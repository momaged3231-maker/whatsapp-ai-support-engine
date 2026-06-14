// Standalone memory refresh (Workflow 5). Summarizes a customer's recent
// conversation into a durable memory_summary. AI if configured, else heuristic.
import { one, many, query } from './db';
import { chatComplete, parseJsonLoose, chatConfigured } from './ai';
import { PROMPTS } from './prompts';

export async function refreshCustomerMemory(businessId, customerId) {
  const customer = await one(`SELECT * FROM customers WHERE id=$1 AND business_id=$2`, [customerId, businessId]);
  if (!customer) throw new Error('customer not found');

  const msgs = await many(
    `SELECT direction, message_text, ai_response, created_at FROM conversations
      WHERE customer_id=$1 ORDER BY created_at DESC LIMIT 12`,
    [customerId]
  );
  const transcript = msgs.reverse()
    .map((m) => (m.direction === 'inbound' ? `العميل: ${m.message_text}` : `الدعم: ${m.ai_response || m.message_text}`))
    .join('\n');

  const openTickets = await one(
    `SELECT COUNT(*)::int AS n FROM tickets WHERE customer_id=$1 AND status NOT IN ('solved','cancelled')`,
    [customerId]
  );

  let result = null;
  if (chatConfigured() && transcript) {
    try {
      const raw = await chatComplete({
        system: PROMPTS.memory(),
        user: JSON.stringify({
          BUSINESS_PROFILE: { id: businessId },
          PREVIOUS_MEMORY: customer.memory_summary || '',
          LATEST_EXCHANGE: transcript,
          INTENT: null,
          TICKET_STATUS: openTickets?.n ? { open: openTickets.n } : null,
        }),
        json: true, temperature: 0.2,
      });
      result = parseJsonLoose(raw);
    } catch (e) { console.error('memory AI failed', e.message); }
  }
  if (!result) {
    result = {
      memory_summary: customer.memory_summary || (transcript ? transcript.slice(-300) : ''),
      status: openTickets?.n ? 'needs_followup' : (customer.status || 'active'),
      needs_followup: !!openTickets?.n,
      tags: customer.tags || [],
    };
  }

  await query(
    `UPDATE customers SET memory_summary=$2, status=$3, needs_followup=$4 WHERE id=$1`,
    [customerId, result.memory_summary, result.status || 'active', !!result.needs_followup]
  );
  return { customer_id: customerId, ...result };
}

// Refresh memory for all customers seen recently (scheduled use).
export async function refreshStaleMemories(businessId, hours = 24) {
  const rows = await many(
    `SELECT id FROM customers WHERE business_id=$1 AND last_seen_at >= NOW() - ($2 || ' hours')::interval`,
    [businessId, String(hours)]
  );
  let n = 0;
  for (const r of rows) { try { await refreshCustomerMemory(businessId, r.id); n++; } catch {} }
  return { refreshed: n };
}
