import { NextResponse } from 'next/server';
import { getEntity, updateEntity, deleteEntity, getBusinessId } from '@/lib/crud';
import { entityDef } from '@/lib/entities';
import { ingestDocument } from '@/lib/knowledge';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { entity, id } = params;
  if (!entityDef(entity)) return NextResponse.json({ error: 'unknown entity' }, { status: 404 });
  const row = await getEntity(entity, id, getBusinessId(req));
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function PATCH(req, { params }) {
  const { entity, id } = params;
  if (!entityDef(entity)) return NextResponse.json({ error: 'unknown entity' }, { status: 404 });
  let body = {};
  try { body = await req.json(); } catch {}
  try {
    const row = await updateEntity(entity, id, body, getBusinessId(req, body));
    if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (entity === 'knowledge_documents') {
      ingestDocument(row.id).catch((e) => console.error('re-ingest failed', e.message));
    }
    return NextResponse.json({ data: row });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const { entity, id } = params;
  if (!entityDef(entity)) return NextResponse.json({ error: 'unknown entity' }, { status: 404 });
  const row = await deleteEntity(entity, id, getBusinessId(req));
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ data: row });
}
