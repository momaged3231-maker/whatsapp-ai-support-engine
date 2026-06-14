// Generate a fresh report (Workflow 6 / dashboard page 8).
import { NextResponse } from 'next/server';
import { generateReport } from '@/lib/reports';

export const dynamic = 'force-dynamic';

async function run(businessId, type) {
  return generateReport(businessId, type || 'daily');
}

export async function GET(req) {
  const url = new URL(req.url);
  const businessId = parseInt(url.searchParams.get('business_id') || '1', 10);
  const type = url.searchParams.get('type') || 'daily';
  try { return NextResponse.json({ data: await run(businessId, type) }); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const businessId = parseInt(body.business_id || '1', 10);
  try { return NextResponse.json({ data: await run(businessId, body.type) }); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
