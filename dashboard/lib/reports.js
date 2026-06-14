// Reports (Workflow 6 + dashboard page 8). Aggregates per business.
import { one, many } from './db';

export async function generateReport(businessId, type = 'daily') {
  const since = type === 'weekly' ? "NOW() - INTERVAL '7 days'" : "date_trunc('day', NOW())";

  const stats = await one(
    `SELECT
       (SELECT COUNT(*) FROM conversations c WHERE c.business_id=$1 AND c.created_at >= ${since}) AS messages,
       (SELECT COUNT(*) FROM customers cu WHERE cu.business_id=$1 AND cu.first_seen_at >= ${since}) AS new_customers,
       (SELECT COUNT(*) FROM tickets t WHERE t.business_id=$1 AND t.status NOT IN ('solved','cancelled')) AS open_tickets,
       (SELECT COUNT(*) FROM tickets t WHERE t.business_id=$1 AND t.status='solved' AND t.solved_at >= ${since}) AS solved_tickets,
       (SELECT COUNT(*) FROM conversations c WHERE c.business_id=$1 AND c.needs_human AND c.created_at >= ${since}) AS handoffs
    `,
    [businessId]
  );

  const topIntents = await many(
    `SELECT intent, COUNT(*)::int AS n FROM conversations
      WHERE business_id=$1 AND direction='outbound' AND intent IS NOT NULL AND created_at >= ${since}
      GROUP BY intent ORDER BY n DESC LIMIT 5`,
    [businessId]
  );
  const topTicketTypes = await many(
    `SELECT ticket_type, COUNT(*)::int AS n FROM tickets
      WHERE business_id=$1 AND created_at >= ${since}
      GROUP BY ticket_type ORDER BY n DESC LIMIT 5`,
    [businessId]
  );

  const report_data = {
    period: type,
    generated_at: new Date().toISOString(),
    messages: Number(stats?.messages || 0),
    new_customers: Number(stats?.new_customers || 0),
    open_tickets: Number(stats?.open_tickets || 0),
    solved_tickets: Number(stats?.solved_tickets || 0),
    handoffs: Number(stats?.handoffs || 0),
    top_intents: topIntents,
    top_ticket_types: topTicketTypes,
  };

  await one(
    `INSERT INTO reports (business_id, report_type, report_data) VALUES ($1,$2,$3) RETURNING id`,
    [businessId, type, report_data]
  );
  return report_data;
}
