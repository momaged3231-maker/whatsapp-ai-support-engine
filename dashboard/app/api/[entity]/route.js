import { NextResponse } from 'next/server';
import { listEntity, createEntity, getBusinessId } from '@/lib/crud';
import { entityDef } from '@/lib/entities';
import { createTicket } from '@/lib/tickets';
import { ingestDocument } from '@/lib/knowledge';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { entity } = params;
  if (!entityDef(entity)) return NextResponse.json({ error: 'unknown entity' }, { status: 404 });
  const url = new URL(req.url);
  try {
    const rows = await listEntity(entity, getBusinessId(req), {
      status: url.searchParams.get('status') || undefined,
      limit: url.searchParams.get('limit') || undefined,
    });
    return NextResponse.json({ data: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function POST(req, { params }) {
  const { entity } = params;
  if (!entityDef(entity)) return NextResponse.json({ error: 'unknown entity' }, { status: 404 });
  let body = {};
  try { body = await req.json(); } catch {}
  const businessId = getBusinessId(req, body);

  try {
    // Tickets need the generated code + events -> use the engine helper.
    if (entity === 'tickets') {
      const t = await createTicket(businessId, body.customer_id || null, body);
      return NextResponse.json({ data: t }, { status: 201 });
    }

    const row = await createEntity(entity, body, businessId);

    // Auto-ingest knowledge into the vector store on create (best effort).
    if (entity === 'knowledge_documents' && row?.id) {
      ingestDocument(row.id).catch((e) => console.error('ingest failed', e.message));
    }
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
