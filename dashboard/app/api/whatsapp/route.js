// WhatsApp Cloud API webhook (Workflow 1 entry point).
//   GET  -> Meta verification handshake (hub.challenge)
//   POST -> inbound message; processed in the background, returns 200 fast.
import { NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { parseInboundWebhook } from '@/lib/whatsapp';
import { processIncomingMessage } from '@/lib/engine';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const envToken = process.env.WHATSAPP_VERIFY_TOKEN;
  let ok = mode === 'subscribe' && token && (token === envToken);
  if (!ok && token) {
    // accept if it matches any business's configured verify_token
    const row = await one(
      `SELECT 1 FROM integrations
        WHERE integration_type='whatsapp' AND config->>'verify_token' = $1 LIMIT 1`,
      [token]
    );
    ok = !!row;
  }
  if (ok) return new Response(challenge || '', { status: 200 });
  return new Response('forbidden', { status: 403 });
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const msg = parseInboundWebhook(body);
  if (!msg) return NextResponse.json({ ignored: true }); // status callbacks etc.

  // Fire-and-forget so we ACK Meta within its timeout.
  processIncomingMessage({
    phoneNumberId: msg.phoneNumberId,
    from: msg.from,
    text: msg.text,
    messageId: msg.messageId,
    contactName: msg.contactName,
  }).catch((e) => console.error('processIncomingMessage failed', e));

  return NextResponse.json({ received: true });
}
