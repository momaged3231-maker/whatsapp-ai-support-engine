// Postgres connection pool + tiny query helper.
// Works with:
//   - local Docker Postgres (public schema)              -> no extra env
//   - managed Postgres / Supabase with an isolated schema -> DB_SCHEMA=was, PGSSL=require
import { Pool } from 'pg';

const globalForPg = globalThis;

// SSL: required by Supabase / most managed Postgres. Auto-on for *.supabase.com.
function makeSsl() {
  const url = process.env.DATABASE_URL || '';
  if (process.env.PGSSL === 'disable') return false;
  if (process.env.PGSSL === 'require' || /supabase\.(co|com)|sslmode=require/.test(url)) {
    return { rejectUnauthorized: false };
  }
  return false;
}

// Optional dedicated schema (e.g. Supabase "was"). Sanitized to a plain identifier.
const RAW_SCHEMA = process.env.DB_SCHEMA || '';
const SCHEMA = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(RAW_SCHEMA) ? RAW_SCHEMA : '';

function buildPool() {
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DB_POOL_MAX || '5', 10),
    idleTimeoutMillis: 30000,
    ssl: makeSsl(),
  });
  // Set search_path on every new physical connection (session-level).
  // Use a session/direct connection string (not the transaction pooler) so this persists.
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

// Return first row or null.
export async function one(text, params) {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
}

export async function many(text, params) {
  const { rows } = await pool.query(text, params);
  return rows;
}
