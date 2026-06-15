// One-time DB setup for a fresh managed Postgres (e.g. Vercel Postgres / Neon).
// Loads schema.sql + seed_demo.sql from the public repo and runs them.
// Guarded by a token. Idempotent: seeds only when empty.
//   GET /api/admin/init?token=init-9f3k2m
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TOKEN = process.env.INIT_TOKEN || 'init-9f3k2m';
const RAW = 'https://raw.githubusercontent.com/momaged3231-maker/whatsapp-ai-support-engine/main/sql';

async function run() {
  const steps = {};
  // 1) schema (ignore "already exists" so re-runs are safe)
  const schemaSql = await (await fetch(`${RAW}/schema.sql`, { cache: 'no-store' })).text();
  try {
    await pool.query(schemaSql);
    steps.schema = 'created';
  } catch (e) {
    steps.schema = /already exists/i.test(e.message) ? 'exists' : `error: ${e.message}`;
  }

  // 2) seed only if empty
  let count = 0;
  try {
    const r = await pool.query('SELECT COUNT(*)::int AS n FROM businesses');
    count = r.rows[0].n;
  } catch (e) {
    return { ok: false, steps, error: `businesses table missing: ${e.message}` };
  }
  if (count === 0) {
    const seedSql = await (await fetch(`${RAW}/seed_demo.sql`, { cache: 'no-store' })).text();
    try {
      await pool.query(seedSql);
      steps.seed = 'loaded';
    } catch (e) {
      steps.seed = `error: ${e.message}`;
    }
  } else {
    steps.seed = `skipped (already ${count} businesses)`;
  }

  const summary = await pool.query(
    `SELECT (SELECT COUNT(*) FROM businesses) businesses,
            (SELECT COUNT(*) FROM services) services,
            (SELECT COUNT(*) FROM knowledge_documents) knowledge,
            (SELECT COUNT(*) FROM tickets) tickets`
  );
  return { ok: true, steps, counts: summary.rows[0] };
}

async function handle(req) {
  const token = new URL(req.url).searchParams.get('token');
  if (token !== TOKEN) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    return NextResponse.json(await run());
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
