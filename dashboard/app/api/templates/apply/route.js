// Apply a vertical template to a business: sets business_type and seeds the
// intents + ticket_rules into business_settings (section 17). Idempotent.
import { NextResponse } from 'next/server';
import { one } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const businessId = parseInt(body.business_id || '1', 10);
  const key = body.template_key;
  if (!key) return NextResponse.json({ error: 'template_key required' }, { status: 400 });

  const tpl = await one(`SELECT * FROM business_templates WHERE key=$1`, [key]);
  if (!tpl) return NextResponse.json({ error: 'template not found' }, { status: 404 });

  const cfg = tpl.config || {};
  const ticketRules = {
    create_ticket_when: ['human_requested', 'ai_low_confidence'],
    required_fields: cfg.required_fields || ['name', 'phone'],
    ticket_type: cfg.ticket_type || 'general',
    default_priority: cfg.default_priority || 'medium',
    confirm_before_create: true,
  };

  await one(`UPDATE businesses SET business_type=$2 WHERE id=$1 RETURNING id`, [businessId, tpl.business_type]);

  // upsert settings row
  await one(
    `INSERT INTO business_settings (business_id, intents, ticket_rules)
     VALUES ($1,$2,$3)
     ON CONFLICT (business_id) DO UPDATE
       SET intents = $2, ticket_rules = $3
     RETURNING id`,
    [businessId, JSON.stringify(cfg.intents || []), JSON.stringify(ticketRules)]
  );

  return NextResponse.json({ ok: true, applied: key, business_type: tpl.business_type, ticket_rules: ticketRules });
}
