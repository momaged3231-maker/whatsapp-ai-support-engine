# WhatsApp AI Support Engine

![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?logo=postgresql&logoColor=white)
![Qdrant](https://img.shields.io/badge/Vector-pgvector%20%7C%20Qdrant-dc2626)
![n8n](https://img.shields.io/badge/Automation-n8n-EA4B71?logo=n8n&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)
![Multi-tenant](https://img.shields.io/badge/Multi--tenant-ready-4c8dff)

> **Live demo:** _deploying…_ (the public URL will be added here once Vercel finishes)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmomaged3231-maker%2Fwhatsapp-ai-support-engine&root-directory=dashboard&env=DATABASE_URL,DB_SCHEMA,PGSSL&envDescription=Supabase%20session-pooler%20URI%20%2B%20DB_SCHEMA%3Dwas%20%2B%20PGSSL%3Drequire)

A **white-label, multi-business** WhatsApp support engine: an AI bot that replies
to customers, retrieves business knowledge with **RAG**, keeps **per-customer
memory**, opens **tickets**, notifies **support staff**, and exposes a full
**dashboard** — all **configurable per business, with zero hard-coding** of any
vertical.

> Works for an internet/ADSL company, a clinic, a restaurant, a real-estate
> office, a maintenance shop, a pharmacy, a clothing store, a training center —
> any business with WhatsApp and customer service. The vertical is just settings.

---

## Why it's generic (the golden rule)

Everything a vertical needs lives in the database and the dashboard, not in code:

- **Business settings** — name, type, hours, coverage, tone, messages, policies
- **Knowledge base** — FAQs, policies, problem→solution, steps → embedded for RAG
- **Services / products** — with prices, visibility, booking & staff flags
- **Ticket rules** — when to open a ticket, required fields, priority, confirm flow
- **WhatsApp**, **AI agent**, **tickets**, **memory**, **dashboard** are the core.

RADIUS / MikroTik are **optional adapters**, never the heart of the system.

---

## Architecture

```
WhatsApp Cloud API ──▶ Webhook (Dashboard /api/whatsapp  ·or·  n8n WF1)
                               │
                               ▼
                    ┌────────────────────┐      ┌────────────────────┐
                    │  Engine pipeline    │◀────▶│ PostgreSQL          │
                    │  (lib/engine.js)    │      │  + pgvector (RAG)   │
                    │  resolve business   │      └────────────────────┘
                    │  resolve customer   │      ┌────────────────────┐
                    │  memory + RAG       │◀────▶│ Qdrant (optional)   │
                    │  classify → reply   │      └────────────────────┘
                    │  ticket + notify    │      ┌────────────────────┐
                    └─────────┬──────────┘◀────▶│ AI provider          │
                              │                  │ OpenAI / Anthropic / │
                              ▼                  │ LOCAL (Ollama, vLLM) │
                    Dashboard (Next.js)          └────────────────────┘
                    + n8n orchestration (7 workflows, schedules)
```

- **n8n** — automation engine: webhook trigger + scheduled workflows (memory,
  reports, integration sync). Thin orchestrators that call the engine API.
- **Dashboard (Next.js)** — admin UI + REST API + the WhatsApp webhook + the
  engine pipeline (so it runs end-to-end even without n8n).
- **PostgreSQL + pgvector** — system DB and (by default) the RAG vector store.
- **Qdrant** — optional alternative vector store (switch with `VECTOR_PROVIDER`).
- **AI adapter** — provider-agnostic: OpenAI-compatible (incl. **local models**)
  or Anthropic. Embeddings via any OpenAI-compatible endpoint.
- **Docker Compose + Nginx + SSL** — one command to run the whole stack.

---

## Quick start

```bash
cp .env.example .env
# edit .env: set POSTGRES_PASSWORD, AI_API_KEY (or point AI_BASE_URL at a local model)
docker compose up -d
```

On first boot the database auto-loads `sql/schema.sql` then `sql/seed_demo.sql`
(5 demo businesses). Then open:

| Service       | URL                          |
|---------------|------------------------------|
| Dashboard     | http://localhost:3000        |
| n8n           | http://localhost:5678        |
| Qdrant        | http://localhost:6333        |
| Nginx (proxy) | http://localhost             |

**Try it with no WhatsApp account:** open the dashboard → **محاكاة البوت (Demo)**
→ send "النت قاطع" then "عايز فني". The bot answers from the knowledge base,
opens a ticket, and notifies support — all in demo mode.

> Without an AI key the engine still works via a heuristic classifier + lexical
> knowledge search, so the first demo runs offline. Add an AI key for full
> RAG + LLM replies.

---

## Deploy live (Vercel + Supabase)

The Next.js app lives in `dashboard/` and can run serverless on Vercel against a
managed Postgres (e.g. Supabase). Click the **Deploy with Vercel** button above,
or:

1. Import this repo in Vercel and set **Root Directory = `dashboard`**.
2. Add environment variables:
   - `DATABASE_URL` = your Postgres **session-pooler / direct** URI (not the
     transaction pooler, so `SET search_path` persists).
   - `DB_SCHEMA` = `was` (if your engine tables live in an isolated schema; this
     repo's Supabase setup uses `was`). Omit for a fresh public-schema DB.
   - `PGSSL` = `require` (managed Postgres needs SSL; auto-detected for Supabase).
   - `AI_API_KEY` = optional. Empty → offline heuristic + lexical search; set a
     key (OpenAI-compatible) for full RAG + LLM replies.
3. Deploy. The seeded demo businesses appear immediately.

> Cloud deployments can't reach a **local** Ollama (`localhost`). For smart
> replies on a hosted URL, use a cloud/OpenAI-compatible `AI_BASE_URL` + key.

---

## Folder structure

```
whatsapp-ai-support-engine/
  docker-compose.yml        # Postgres+pgvector, Qdrant, n8n, dashboard, nginx
  .env.example
  README.md
  sql/
    schema.sql              # multi-tenant schema + pgvector + helpers
    seed_demo.sql           # 5 demo businesses + templates
  workflows/                # 7 importable n8n workflows
    01_whatsapp_incoming.json ... 07_integration_sync.json
  prompts/
    classifier.txt  reply_agent.txt  memory_update.txt  rag.txt
  dashboard/                # Next.js full-stack app (UI + API + engine)
    app/  lib/  components/  Dockerfile
  nginx/
    nginx.conf  certs/
  docs/
    setup.md  business_templates.md  testing.md
```

---

## Configuration highlights (`.env`)

- `VECTOR_PROVIDER` = `pgvector` (default) or `qdrant`
- `AI_PROVIDER` = `openai` (any OpenAI-compatible incl. local) or `anthropic`
- `AI_BASE_URL` / `AI_API_KEY` / `AI_CHAT_MODEL` / `AI_EMBEDDING_MODEL` / `AI_EMBEDDING_DIM`
- Local model example (Ollama): `AI_BASE_URL=http://host.docker.internal:11434/v1`

> If you change the embedding model, set `AI_EMBEDDING_DIM` **and** the
> `vector(N)` dimension in `sql/schema.sql` to match (default 1536).

See **docs/setup.md** for the full setup & WhatsApp connection guide,
**docs/business_templates.md** for the vertical presets, and **docs/testing.md**
for the 5-business test matrix.

---

## Multi-tenant by design

Every business-owned row carries `business_id`. RAG search **always** filters by
`business_id` (a bot for business A can never see business B's knowledge). One
deployment can serve many businesses; the dashboard's business switcher selects
the active tenant.

## MVP scope

Included: single/multi business setup, WhatsApp settings, knowledge base + RAG,
AI auto-reply, customer memory, tickets, support notification to direct numbers,
dashboards for tickets/customers/conversations, manual/CSV/Google-Sheets import,
generic SQL connector placeholder, business templates.

Not included (by design): billing, full auth/permissions system, mobile app,
complex CRM, real WhatsApp-group dependency.

## License & notes

This is an MVP scaffold intended to be extended. Replace demo tokens, set strong
secrets, and put it behind HTTPS before any production use.
