// Postgres connection pool + tiny query helper.
import { Pool } from 'pg';

const globalForPg = globalThis;

export const pool =
  globalForPg._wasPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
  });

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
