// "Test send" button on the WhatsApp settings page.
import { NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { sendWhatsAppText } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const businessId = parseInt(body.business_id || '1', 10);
  const to = body.to;
  const text = body.text || 'رسالة اختبار من WhatsApp AI Support Engine ✅';
  if (!to) return NextResponse.json({ error: 'to is required' }, { status: 400 });

  const ig = await one(
    `SELECT config FROM integrations
      WHERE business_id=$1 AND integration_type='whatsapp' AND is_active=TRUE LIMIT 1`,
    [businessId]
  );
  if (!ig) return NextResponse.json({ error: 'no whatsapp integration for this business' }, { status: 404 });

  try {
    const r = await sendWhatsAppText(ig.config, to, text);
    return NextResponse.json({ ok: true, demo: !!r.demo, result: r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 502 });
  }
}
