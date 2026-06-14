// Integration sync (Workflow 7). Body: { business_id, integration_id? }.
import { NextResponse } from 'next/server';
import { many, one } from '@/lib/db';
import { syncIntegration } from '@/lib/integrations';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const businessId = parseInt(body.business_id || '1', 10);

  let integrations;
  if (body.integration_id) {
    const ig = await one(`SELECT * FROM integrations WHERE id=$1 AND business_id=$2`, [body.integration_id, businessId]);
    integrations = ig ? [ig] : [];
  } else {
    integrations = await many(
      `SELECT * FROM integrations WHERE business_id=$1 AND is_active=TRUE
        AND integration_type IN ('google_sheets','csv','sql','radius')`,
      [businessId]
    );
  }

  const results = [];
  for (const ig of integrations) {
    try { results.push({ id: ig.id, type: ig.integration_type, ...(await syncIntegration(businessId, ig)) }); }
    catch (e) { results.push({ id: ig.id, type: ig.integration_type, error: e.message }); }
  }
  return NextResponse.json({ ok: true, results });
}
