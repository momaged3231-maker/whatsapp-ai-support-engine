# Testing

Two ways to test the full pipeline without a real WhatsApp number:

1. **Dashboard → محاكاة البوت (Demo)** — type as a customer, watch the reply,
   intent, ticket code and support-notification badge.
2. **Engine API** — POST to `/api/engine/process`:

```bash
curl -s http://localhost:3000/api/engine/process \
  -H 'content-type: application/json' \
  -d '{"phoneNumberId":"100000000000001","from":"201111111111","text":"النت قاطع"}' | jq
```

`phoneNumberId` selects the business (it matches the WhatsApp integration). The
seed phone_number_ids are `100000000000001`..`5` for the 5 demo businesses.

A ready-made runner is provided:

```bash
node scripts/test_scenarios.mjs            # against http://localhost:3000
BASE=https://your-domain node scripts/test_scenarios.mjs
```

---

## Required demo 1 — Internet company (proves knowledge + ticket + notify)

- Business: SpeedNet ADSL (`phoneNumberId=100000000000001`)
- Send **"النت قاطع"** → bot replies from the configured knowledge
  ("اقفل الراوتر دقيقتين…").
- Send **"عايز فني"** → bot opens a `maintenance`/handoff ticket
  (`BUS-1-YYYYMMDD-0001`) and notifies support.

## Required demo 2 — Clinic (proves a different vertical, same engine)

- Business: عيادة د. منى للأسنان (`phoneNumberId=100000000000002`)
- Send **"عايز أحجز كشف"** → bot asks for the preferred day/time and, on
  confirmation, opens an `appointment` ticket.

Same engine, different behaviour — driven entirely by settings. That's the proof
the system is generic, not internet-specific.

---

## Full test matrix (run for each of the 5 businesses)

| # | Scenario | Send (example) | Expect |
|---|----------|----------------|--------|
| 1 | Price question | "السعر كام؟" / "بكام الكشف؟" | price from services (only if `price_visible`) or "الفريق هيأكد السعر" |
| 2 | Working hours | "مواعيدكم إيه؟" | hours from settings/knowledge |
| 3 | Booking/order request | "عايز أحجز" / "عايز أطلب" | asks for missing field, then opens ticket |
| 4 | Complaint | "مش شغال" / "في مشكلة" | empathetic reply + ticket per rules |
| 5 | Human request | "عايز أكلم موظف" | `needs_human=true`, polite handoff + notify |
| 6 | Unclear message | "؟" / "تمام" | one clarifying question, lower confidence |
| 7 | Returning customer | resend after a prior chat | reply uses `memory_summary` |
| 8 | Ticket creation | confirm a booking/repair | ticket code `BUS-{id}-YYYYMMDD-0001` |
| 9 | Support report | after #5/#8 | support member receives the report (demo log if no token) |
| 10 | Dashboard visibility | open Customers/Tickets/Reports | the new customer, ticket and counts appear |

### Per-business quick commands

```bash
# Internet
curl -s localhost:3000/api/engine/process -H 'content-type: application/json' \
  -d '{"phoneNumberId":"100000000000001","from":"201111110001","text":"النت بطيء"}' | jq .reply

# Clinic
curl -s localhost:3000/api/engine/process -H 'content-type: application/json' \
  -d '{"phoneNumberId":"100000000000002","from":"201111110002","text":"عايز أحجز كشف بكرة"}' | jq

# Restaurant
curl -s localhost:3000/api/engine/process -H 'content-type: application/json' \
  -d '{"phoneNumberId":"100000000000003","from":"201111110003","text":"المنيو عندكم إيه؟"}' | jq .reply

# Real estate
curl -s localhost:3000/api/engine/process -H 'content-type: application/json' \
  -d '{"phoneNumberId":"100000000000004","from":"201111110004","text":"عايز شقة إيجار في التجمع"}' | jq

# Maintenance
curl -s localhost:3000/api/engine/process -H 'content-type: application/json' \
  -d '{"phoneNumberId":"100000000000005","from":"201111110005","text":"الموبايل شاشته مكسورة بكام التصليح؟"}' | jq
```

## What "pass" looks like

- A natural, on-brand reply in the business language.
- Correct `intent`; `needs_ticket` / `needs_human` follow the business rules.
- A ticket is created (with code) when the rules say so; a `ticket_event` is logged.
- Support is notified for tickets / human requests (real send with a token, or a
  `[whatsapp:demo]` server log without one).
- Customer, conversation, ticket and report rows are visible in the dashboard.
- RAG (with an embedding key) returns only that business's knowledge.

## Health check

```bash
curl -s localhost:3000/api/health | jq
# { ok, db, vector_provider, ai_provider, chat_configured, embeddings_configured }
```
