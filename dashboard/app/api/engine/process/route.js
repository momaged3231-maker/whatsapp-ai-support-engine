// Synchronous engine entry — used by the dashboard "test" button, the testing
// script, and n8n Workflow 1 (HTTP Request node). Returns the full result.
import { NextResponse } from 'next/server';
import { processIncomingMessage } from '@/lib/engine';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const { phoneNumberId, from, text, messageId, contactName } = body;
  if (!phoneNumberId || !from || !text) {
    return NextResponse.json({ error: 'phoneNumberId, from, text are required' }, { status: 400 });
  }
  try {
    const result = await processIncomingMessage({ phoneNumberId, from, text, messageId, contactName });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
