// Memory refresh (Workflow 5). Body: { business_id, customer_id? }.
import { NextResponse } from 'next/server';
import { refreshCustomerMemory, refreshStaleMemories } from '@/lib/memory';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const businessId = parseInt(body.business_id || '1', 10);
  try {
    if (body.customer_id) {
      return NextResponse.json({ ok: true, ...(await refreshCustomerMemory(businessId, body.customer_id)) });
    }
    return NextResponse.json({ ok: true, ...(await refreshStaleMemories(businessId, body.hours || 24)) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
