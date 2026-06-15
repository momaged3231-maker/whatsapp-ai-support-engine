// Postgres connection pool + tiny query helper.
// Connection string resolution (first match wins):
//   DATABASE_URL  ->  POSTGRES_URL  ->  POSTGRES_PRISMA_URL  ->  DATABASE_URL_UNPOOLED
// so it works with local Docker, Supabase, AND Vercel Postgres / Neon
// (which auto-inject POSTGRES_URL / DATABASE_URL).
import { Pool } from 'pg';

const globalForPg = globalThis;

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  '';

// SSL: managed Postgres (Supabase/Neon/etc.) needs SSL. On for any remote host.
function makeSsl() {
  if (process.env.PGSSL === 'disable') return false;
  if (process.env.PGSSL === 'require') return { rejectUnauthorized: false };
  if (/@(localhost|127\.0\.0\.1|db|postgres)[:/]/.test(CONN)) return false; // local docker
  if (!CONN) return false;
  return { rejectUnauthorized: false }; // remote managed Postgres
}

// Optional dedicated schema (e.g. Supabase "was"). Empty => default public schema.
const RAW_SCHEMA = process.env.DB_SCHEMA || '';
const SCHEMA = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(RAW_SCHEMA) ? RAW_SCHEMA : '';

function buildPool() {
  const p = new Pool({
    connectionString: CONN,
    max: parseInt(process.env.DB_POOL_MAX || '5', 10),
    idleTimeoutMillis: 30000,
    ssl: makeSsl(),
  });
  if (SCHEMA) {
    p.on('connect', (client) => {
      client.query(`SET search_path TO "${SCHEMA}", public, extensions`).catch((e) =>
        console.error('search_path set failed', e.message)
      );
    });
  }
  p.on('error', (e) => console.error('pg pool error', e.message));
  return p;
}

export const pool = globalForPg._wasPool || buildPool();
if (process.env.NODE_ENV !== 'production') globalForPg._wasPool = pool;

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

export async function one(text, params) {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
}

export async function many(text, params) {
  const { rows } = await pool.query(text, params);
  return rows;
}
