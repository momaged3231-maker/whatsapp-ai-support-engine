-- =============================================================================
-- WhatsApp AI Support Engine — PostgreSQL schema
-- Multi-tenant from day one: every business-owned row carries business_id.
-- RAG via pgvector (knowledge_chunks). Qdrant is an optional alternative
-- handled by the dashboard's vector adapter (no schema change needed).
--
-- Embedding dimension defaults to 1536 (OpenAI text-embedding-3-small).
-- If you switch models, change vector(1536) below AND AI_EMBEDDING_DIM in .env
-- to the same number BEFORE first boot.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;     -- pgvector
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()

-- n8n stores its own tables in a separate schema (see docker-compose).
CREATE SCHEMA IF NOT EXISTS n8n;

-- -----------------------------------------------------------------------------
-- Helper: updated_at trigger
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. BUSINESSES  (the tenant)
-- =============================================================================
CREATE TABLE businesses (
    id            BIGSERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    business_type TEXT,                       -- internet | clinic | restaurant | real_estate | maintenance | ...
    description   TEXT,
    phone         TEXT,
    email         TEXT,
    logo_url      TEXT,
    timezone      TEXT DEFAULT 'Africa/Cairo',
    language      TEXT DEFAULT 'ar-EG',
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);
CREATE TRIGGER trg_businesses_updated BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 2. BUSINESS_SETTINGS  (1:1 with business — all bot behaviour is config)
-- =============================================================================
CREATE TABLE business_settings (
    id                    BIGSERIAL PRIMARY KEY,
    business_id           BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    working_hours         JSONB,              -- {"sat":["09:00","17:00"], ...}
    coverage_areas        JSONB,              -- ["Nasr City","Maadi", ...]
    policies              JSONB,              -- {"refund":"...","privacy":"..."}
    intents               JSONB,              -- extra business-specific intents
    ticket_rules          JSONB,              -- see section 16 of the brief
    report_config         JSONB,              -- shape of the support report
    default_reply_style   TEXT DEFAULT 'friendly_short',
    welcome_message       TEXT,
    handoff_message       TEXT,               -- "transfer to human" message
    fallback_message      TEXT,
    allow_ai_auto_reply   BOOLEAN DEFAULT TRUE,
    allow_ticket_creation BOOLEAN DEFAULT TRUE,
    require_human_approval BOOLEAN DEFAULT FALSE,
    confidence_threshold  NUMERIC DEFAULT 0.65,
    use_external_db       BOOLEAN DEFAULT FALSE,
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW(),
    UNIQUE (business_id)
);
CREATE TRIGGER trg_business_settings_updated BEFORE UPDATE ON business_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 3. INTEGRATIONS  (adapters: whatsapp, google_sheets, csv, sql, radius, mikrotik)
-- =============================================================================
CREATE TABLE integrations (
    id               BIGSERIAL PRIMARY KEY,
    business_id      BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,           -- whatsapp | google_sheets | csv | sql | radius | mikrotik | manual
    name             TEXT,
    config           JSONB NOT NULL,          -- secrets + connection params (per type)
    is_active        BOOLEAN DEFAULT TRUE,
    last_sync_at     TIMESTAMP,
    last_sync_status TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);
CREATE TRIGGER trg_integrations_updated BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_integrations_business ON integrations(business_id, integration_type);
-- Fast business resolution by WhatsApp phone_number_id (section 15, workflow 1):
CREATE INDEX idx_integrations_wa_phone_id
  ON integrations ((config->>'phone_number_id'))
  WHERE integration_type = 'whatsapp';

-- =============================================================================
-- 4. SERVICES / PRODUCTS  (dashboard page 2)
-- =============================================================================
CREATE TABLE services (
    id             BIGSERIAL PRIMARY KEY,
    business_id    BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    description    TEXT,
    category       TEXT,
    price          NUMERIC,
    currency       TEXT DEFAULT 'EGP',
    price_visible  BOOLEAN DEFAULT TRUE,       -- show price to customer?
    duration       TEXT,                       -- e.g. "30 min", "2-3 days"
    needs_booking  BOOLEAN DEFAULT FALSE,
    needs_staff    BOOLEAN DEFAULT FALSE,
    is_active      BOOLEAN DEFAULT TRUE,
    metadata       JSONB,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_services_business ON services(business_id) WHERE is_active;

-- =============================================================================
-- 5. CUSTOMERS  (memory lives here too)
-- =============================================================================
CREATE TABLE customers (
    id                   BIGSERIAL PRIMARY KEY,
    business_id          BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    external_customer_id TEXT,                 -- id in Radius/Sheet/SQL if linked
    phone                TEXT NOT NULL,
    name                 TEXT,
    area                 TEXT,
    status               TEXT DEFAULT 'new',   -- new | active | needs_followup | closed
    tags                 JSONB,
    metadata             JSONB,
    memory_summary       TEXT,                 -- rolling AI summary
    needs_followup       BOOLEAN DEFAULT FALSE,
    first_seen_at        TIMESTAMP DEFAULT NOW(),
    last_seen_at         TIMESTAMP DEFAULT NOW(),
    UNIQUE (business_id, phone)
);
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_status ON customers(business_id, status);

-- =============================================================================
-- 6. CONVERSATIONS  (one row per message, inbound or outbound)
-- =============================================================================
CREATE TABLE conversations (
    id                  BIGSERIAL PRIMARY KEY,
    business_id         BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id         BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    whatsapp_message_id TEXT,
    direction           TEXT CHECK (direction IN ('inbound','outbound')),
    message_text        TEXT,
    ai_response         TEXT,
    intent              TEXT,
    confidence          NUMERIC,
    needs_human         BOOLEAN DEFAULT FALSE,
    metadata            JSONB,
    created_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_conversations_business ON conversations(business_id, created_at DESC);
CREATE INDEX idx_conversations_customer ON conversations(customer_id, created_at DESC);

-- =============================================================================
-- 7. KNOWLEDGE_DOCUMENTS  (source content authored in the dashboard)
-- =============================================================================
CREATE TABLE knowledge_documents (
    id          BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    category    TEXT,                          -- faq | policy | problem_solution | offer | service_desc | steps
    content     TEXT NOT NULL,
    source      TEXT,                          -- manual | sheet | csv | upload
    is_active   BOOLEAN DEFAULT TRUE,
    embedding_status TEXT DEFAULT 'pending',   -- pending | done | error
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
CREATE TRIGGER trg_knowledge_documents_updated BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_knowledge_docs_business ON knowledge_documents(business_id) WHERE is_active;

-- =============================================================================
-- 7b. KNOWLEDGE_CHUNKS  (RAG vectors — pgvector path)
--     business_id is MANDATORY in every similarity query (tenant isolation).
-- =============================================================================
CREATE TABLE knowledge_chunks (
    id          BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    document_id BIGINT REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT DEFAULT 0,
    content     TEXT NOT NULL,
    category    TEXT,
    title       TEXT,
    source      TEXT,
    embedding   vector(1536),                  -- <<< change N here if model changes
    metadata    JSONB,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chunks_business ON knowledge_chunks(business_id);
-- Approximate nearest-neighbour (cosine). Built after data exists for best recall;
-- safe to create empty.
CREATE INDEX idx_chunks_embedding ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops);

-- =============================================================================
-- 8. TICKETS  (code format: BUS-{business_id}-YYYYMMDD-0001)
-- =============================================================================
CREATE TABLE tickets (
    id           BIGSERIAL PRIMARY KEY,
    business_id  BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id  BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    ticket_code  TEXT UNIQUE NOT NULL,
    ticket_type  TEXT,                          -- maintenance | appointment | order | lead | repair | ...
    issue_type   TEXT,
    priority     TEXT DEFAULT 'medium',         -- low | medium | high | urgent
    status       TEXT DEFAULT 'open',           -- open | in_review | contacted | in_progress | solved | cancelled
    assigned_to  TEXT,
    summary      TEXT,
    ai_diagnosis TEXT,
    fields       JSONB,                         -- captured required_fields per business rules
    metadata     JSONB,
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW(),
    solved_at    TIMESTAMP
);
CREATE TRIGGER trg_tickets_updated BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_tickets_business ON tickets(business_id, status);
CREATE INDEX idx_tickets_customer ON tickets(customer_id);

-- =============================================================================
-- 9. TICKET_EVENTS  (audit trail / timeline)
-- =============================================================================
CREATE TABLE ticket_events (
    id          BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    ticket_id   BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
    event_type  TEXT,                           -- created | status_change | note | assigned | notified
    note        TEXT,
    created_by  TEXT DEFAULT 'system',
    metadata    JSONB,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_ticket_events_ticket ON ticket_events(ticket_id, created_at);

-- =============================================================================
-- 10. SUPPORT_MEMBERS  (routing targets)
-- =============================================================================
CREATE TABLE support_members (
    id          BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    name        TEXT,
    phone       TEXT,
    role        TEXT,                           -- agent | technician | doctor | manager | group
    area        TEXT,
    channel     TEXT DEFAULT 'whatsapp',        -- whatsapp | telegram | email | group
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_support_members_business ON support_members(business_id) WHERE is_active;

-- =============================================================================
-- 11. REPORTS  (generated snapshots)
-- =============================================================================
CREATE TABLE reports (
    id          BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    report_type TEXT,                           -- daily | weekly | adhoc
    report_data JSONB,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reports_business ON reports(business_id, created_at DESC);

-- =============================================================================
-- 12. BUSINESS_TEMPLATES  (catalogue of ready-made vertical presets)
--     Not tenant-owned — a library the dashboard applies to new businesses.
-- =============================================================================
CREATE TABLE business_templates (
    id            BIGSERIAL PRIMARY KEY,
    key           TEXT UNIQUE NOT NULL,         -- internet | clinic | restaurant | real_estate | maintenance
    name          TEXT NOT NULL,
    business_type TEXT,
    description   TEXT,
    config        JSONB NOT NULL,               -- intents, ticket_type, required_fields, sample services/knowledge
    created_at    TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 13. ADMIN_USERS  (minimal dashboard auth — MVP, not full multi-tenant login)
-- =============================================================================
CREATE TABLE admin_users (
    id            BIGSERIAL PRIMARY KEY,
    business_id   BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT,                          -- bcrypt; MVP may use a shared token
    role          TEXT DEFAULT 'owner',          -- owner | agent
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- TICKET CODE GENERATOR  ->  BUS-{business_id}-YYYYMMDD-0001
-- Per-business, per-day sequence, concurrency-safe via row lock.
-- =============================================================================
CREATE TABLE ticket_counters (
    business_id BIGINT NOT NULL,
    day         DATE   NOT NULL,
    last_seq    INT    NOT NULL DEFAULT 0,
    PRIMARY KEY (business_id, day)
);

CREATE OR REPLACE FUNCTION generate_ticket_code(p_business_id BIGINT)
RETURNS TEXT AS $$
DECLARE
    v_day DATE := (NOW() AT TIME ZONE 'UTC')::date;
    v_seq INT;
BEGIN
    INSERT INTO ticket_counters (business_id, day, last_seq)
    VALUES (p_business_id, v_day, 1)
    ON CONFLICT (business_id, day)
    DO UPDATE SET last_seq = ticket_counters.last_seq + 1
    RETURNING last_seq INTO v_seq;

    RETURN format('BUS-%s-%s-%s',
                  p_business_id,
                  to_char(v_day, 'YYYYMMDD'),
                  lpad(v_seq::text, 4, '0'));
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RAG SEARCH HELPER (pgvector path) — always filters by business_id.
-- Returns the top-k most similar chunks for one tenant.
-- =============================================================================
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
    p_business_id BIGINT,
    p_query_embedding vector(1536),
    p_match_count INT DEFAULT 5,
    p_min_similarity NUMERIC DEFAULT 0.0
)
RETURNS TABLE (
    id BIGINT, content TEXT, title TEXT, category TEXT, similarity NUMERIC
) AS $$
    SELECT kc.id, kc.content, kc.title, kc.category,
           (1 - (kc.embedding <=> p_query_embedding))::numeric AS similarity
    FROM knowledge_chunks kc
    WHERE kc.business_id = p_business_id           -- HARD tenant isolation
      AND (1 - (kc.embedding <=> p_query_embedding)) >= p_min_similarity
    ORDER BY kc.embedding <=> p_query_embedding
    LIMIT p_match_count;
$$ LANGUAGE sql STABLE;

-- =============================================================================
-- Convenience view: customer memory page
-- =============================================================================
CREATE OR REPLACE VIEW v_customer_memory AS
SELECT c.business_id, c.id AS customer_id, c.name, c.phone, c.area, c.status,
       c.memory_summary, c.needs_followup, c.last_seen_at,
       (SELECT t.ticket_code FROM tickets t
         WHERE t.customer_id = c.id ORDER BY t.created_at DESC LIMIT 1) AS last_ticket,
       (SELECT cv.message_text FROM conversations cv
         WHERE cv.customer_id = c.id AND cv.direction='inbound'
         ORDER BY cv.created_at DESC LIMIT 1) AS last_message
FROM customers c;
