# Setup Guide

## 1. Prerequisites

- Docker + Docker Compose
- (Optional) An AI API key — OpenAI-compatible or Anthropic. You can also point
  at a **local model** (Ollama / LM Studio / vLLM) and use no cloud key.
- (For live WhatsApp) A Meta **WhatsApp Cloud API** app with a phone number.

## 2. First run

```bash
cp .env.example .env
nano .env            # set POSTGRES_PASSWORD, N8N_ENCRYPTION_KEY, AI_* ...
docker compose up -d
docker compose logs -f db        # watch schema + seed load on first boot
```

The Postgres container runs `sql/schema.sql` then `sql/seed_demo.sql`
automatically on the **first** boot (empty volume). To reload from scratch:

```bash
docker compose down -v && docker compose up -d   # WARNING: wipes data
```

Open the dashboard at <http://localhost:3000>. Use the **business switcher**
(bottom of the sidebar) to pick a demo business.

## 3. Choose your AI provider

Edit `.env`:

**OpenAI (or any OpenAI-compatible cloud)**
```
AI_PROVIDER=openai
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
AI_CHAT_MODEL=gpt-4o-mini
AI_EMBEDDING_MODEL=text-embedding-3-small
AI_EMBEDDING_DIM=1536
```

**Local model (Ollama) — no cloud key**
```
AI_PROVIDER=openai
AI_BASE_URL=http://host.docker.internal:11434/v1
AI_API_KEY=ollama
AI_CHAT_MODEL=llama3.1
AI_EMBEDDING_MODEL=nomic-embed-text
AI_EMBEDDING_DIM=768          # MUST match the vector(N) column in schema.sql
```

**Anthropic (chat) + OpenAI-compatible embeddings**
```
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=...
AI_CHAT_MODEL=claude-3-5-sonnet-latest
# embeddings still use AI_BASE_URL + AI_API_KEY:
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
AI_EMBEDDING_MODEL=text-embedding-3-small
AI_EMBEDDING_DIM=1536
```

> Changing `AI_EMBEDDING_DIM` requires the `vector(N)` dimension in
> `sql/schema.sql` to match **before first boot** (or re-create the table and
> re-ingest knowledge).

## 4. Choose your vector store

- `VECTOR_PROVIDER=pgvector` (default) — vectors live in Postgres. Simplest.
- `VECTOR_PROVIDER=qdrant` — vectors live in the Qdrant container. The collection
  is created automatically on first ingestion.

Either way, retrieval is **always** filtered by `business_id`.

## 5. Connect WhatsApp (Meta Cloud API)

1. In the dashboard go to **واتساب (WhatsApp)** and fill: Phone Number ID,
   WhatsApp Business Account ID, Access Token, Verify Token, API version.
2. Copy the **Webhook URL** shown there
   (`https://YOUR_DOMAIN/api/whatsapp`).
3. In **Meta → your app → WhatsApp → Configuration**:
   - Callback URL = that Webhook URL
   - Verify Token = the same token you entered
   - Subscribe to the **messages** field.
4. Meta sends a `GET` verification (`hub.challenge`) — the dashboard answers it.
5. Click **إرسال اختبار (Send test)** to confirm outbound works.

> WhatsApp requires a **public HTTPS** endpoint with a valid certificate. Use a
> real domain + Let's Encrypt (see `nginx/certs/README.md`). For local testing
> use a tunnel (e.g. ngrok/cloudflared) pointed at port 3000, or just use the
> built-in **Demo** console which exercises the full pipeline without Meta.

## 6. Import the n8n workflows

1. Open n8n at <http://localhost:5678> and create the owner account.
2. **Workflows → Import from File** → import each file in `workflows/`.
3. The workflows call the dashboard via `$env.WAS_DASHBOARD_INTERNAL_URL`
   (already set to `http://dashboard:3000` in compose).
4. Activate the scheduled ones (05 memory, 06 reports, 07 sync). 01–04 are
   webhook/▶-run workflows.

The workflows are thin orchestrators around the engine API:

| Workflow | Trigger | Calls |
|---|---|---|
| 01 WhatsApp Incoming | Webhook | `/api/engine/process` |
| 02 Knowledge Ingestion | Webhook | `/api/knowledge/ingest` |
| 03 Ticket Creation | Webhook | `/api/tickets` |
| 04 Support Notification | Webhook | `/api/notify` |
| 05 Memory Update | Schedule (hourly) | `/api/memory/refresh` |
| 06 Daily Reports | Schedule (06:00) | `/api/report-generate` |
| 07 Integration Sync | Schedule (6h) | `/api/integration-sync` |

> You can run the whole product **without n8n** — the dashboard already serves
> the webhook and runs the pipeline. n8n adds scheduling and a visual canvas.

## 7. Onboard a business (no code)

1. **القوالب (Templates)** → apply a vertical preset (internet/clinic/…)
   to set type, intents, ticket type and required fields.
2. **إعداد النشاط (Setup)** → name, description, hours, coverage, tone, messages.
3. **الخدمات (Services)** → add services/products, prices, booking/staff flags.
4. **قاعدة المعرفة (Knowledge)** → add FAQs/policies/steps → click ingest.
5. **واتساب (WhatsApp)** → connect the number.
6. **توجيه الدعم (Support)** → add staff numbers / departments.
7. **التذاكر (Tickets)** → tune the ticket rules JSON.
8. Test from **محاكاة البوت (Demo)**, then watch **العملاء/التذاكر/التقارير**.

## 8. Integration adapters

Add from the `integrations` table / API. Supported in MVP:

- `manual` — add customers by hand (default).
- `google_sheets` — set `config.csv_url` to a published-to-web CSV link.
- `csv` — import a CSV (or set `config.csv_url` to re-pull on sync).
- `sql` — generic SQL connector **placeholder** (wire a driver in
  `lib/integrations.js`).
- `radius` / `mikrotik` — optional, internet-vertical **placeholders**.
- **No-DB mode** — if no external adapter is active, customers are created from
  WhatsApp messages automatically.

The generic `resolveCustomer(business_id, phone, message)` looks in `customers`,
then active adapters, then creates a new customer — never RADIUS-only.

## 9. Production checklist

- Strong `POSTGRES_PASSWORD`, `N8N_ENCRYPTION_KEY`, `ENGINE_INTERNAL_TOKEN`.
- Real domain + TLS certs in `nginx/certs/`; switch the HTTP server block to
  redirect to HTTPS.
- Rotate the demo `admin_users` password and the demo WhatsApp tokens.
- Back up the Postgres volume.
- Put n8n behind auth and restrict the dashboard internal endpoints.
