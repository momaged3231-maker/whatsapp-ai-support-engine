// Support notification (Workflow 4). Body: { business_id, ticket_id }.
import { NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { notifySupport } from '@/lib/tickets';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const businessId = parseInt(body.business_id || '1', 10);
  if (!body.ticket_id) return NextResponse.json({ error: 'ticket_id required' }, { status: 400 });

  const business = await one(
    `SELECT b.*, i.config AS wa_config FROM businesses b
       LEFT JOIN integrations i ON i.business_id=b.id AND i.integration_type='whatsapp' AND i.is_active=TRUE
      WHERE b.id=$1`,
    [businessId]
  );
  const ticket = await one(`SELECT * FROM tickets WHERE id=$1 AND business_id=$2`, [body.ticket_id, businessId]);
  if (!business || !ticket) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const customer = ticket.customer_id ? await one(`SELECT * FROM customers WHERE id=$1`, [ticket.customer_id]) : null;

  const r = await notifySupport(business, business.wa_config, ticket, customer);
  return NextResponse.json({ ok: true, ...r });
}
