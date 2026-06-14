// Generic, whitelist-driven CRUD used by app/api/[entity]/*.
import { pool } from './db';
import { entityDef } from './entities';

function encode(def, col, val) {
  if (def.json && def.json.includes(col) && val !== null && typeof val === 'object') {
    return JSON.stringify(val);
  }
  return val;
}

export async function listEntity(name, businessId, opts = {}) {
  const def = entityDef(name);
  if (!def) throw new Error('unknown entity');
  const params = [];
  const where = [];
  if (def.scoped) { params.push(businessId); where.push(`business_id = $${params.length}`); }
  if (opts.status) { params.push(opts.status); where.push(`status = $${params.length}`); }
  const sql =
    `SELECT * FROM ${def.table}` +
    (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
    ` ORDER BY ${def.order} LIMIT ${Math.min(parseInt(opts.limit || 200, 10), 500)}`;
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getEntity(name, id, businessId) {
  const def = entityDef(name);
  if (!def) throw new Error('unknown entity');
  const params = [id];
  let sql = `SELECT * FROM ${def.table} WHERE id = $1`;
  if (def.scoped) { params.push(businessId); sql += ` AND business_id = $2`; }
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

export async function createEntity(name, data, businessId) {
  const def = entityDef(name);
  if (!def) throw new Error('unknown entity');
  const cols = def.columns.filter((c) => c in data);
  const values = cols.map((c) => encode(def, c, data[c]));
  if (def.scoped) { cols.unshift('business_id'); values.unshift(businessId); }
  if (!cols.length) throw new Error('no valid columns');
  const ph = cols.map((_, i) => `$${i + 1}`);
  const sql = `INSERT INTO ${def.table} (${cols.join(',')}) VALUES (${ph.join(',')}) RETURNING *`;
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

export async function updateEntity(name, id, data, businessId) {
  const def = entityDef(name);
  if (!def) throw new Error('unknown entity');
  const cols = def.columns.filter((c) => c in data);
  if (!cols.length) return getEntity(name, id, businessId);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`);
  const values = cols.map((c) => encode(def, c, data[c]));
  values.push(id);
  let sql = `UPDATE ${def.table} SET ${sets.join(', ')} WHERE id = $${values.length}`;
  if (def.scoped) { values.push(businessId); sql += ` AND business_id = $${values.length}`; }
  sql += ' RETURNING *';
  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
}

export async function deleteEntity(name, id, businessId) {
  const def = entityDef(name);
  if (!def) throw new Error('unknown entity');
  const params = [id];
  let sql = `DELETE FROM ${def.table} WHERE id = $1`;
  if (def.scoped) { params.push(businessId); sql += ` AND business_id = $2`; }
  sql += ' RETURNING id';
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

// Convenience: get business_id from request (query or body), default 1 (MVP).
export function getBusinessId(req, body) {
  const url = new URL(req.url);
  const q = url.searchParams.get('business_id');
  return parseInt(q || (body && body.business_id) || '1', 10);
}
