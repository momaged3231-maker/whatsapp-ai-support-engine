// Trigger embedding/ingestion (Workflow 2). Body: { business_id } or { document_id }.
import { NextResponse } from 'next/server';
import { ingestDocument, ingestPending } from '@/lib/knowledge';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  try {
    if (body.document_id) {
      const r = await ingestDocument(body.document_id);
      return NextResponse.json({ ok: true, ...r });
    }
    const businessId = parseInt(body.business_id || '1', 10);
    const r = await ingestPending(businessId);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
