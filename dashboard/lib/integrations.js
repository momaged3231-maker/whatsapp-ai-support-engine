// Integration adapter layer (section 8 of the brief).
// Each adapter knows how to look up / sync customers for ONE business.
// The system never depends on RADIUS — that is just one optional adapter.
import { many, one, query } from './db';

// --- tiny CSV parser (no external dep) ---
export function parseCSV(text) {
  const rows = [];
  let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c === '\r') { /* skip */ }
    else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((x) => x !== '')).map((r) => {
    const o = {};
    header.forEach((h, i) => (o[h] = (r[i] || '').trim()));
    return o;
  });
}

function normPhone(p) {
  return (p || '').replace(/[^\d+]/g, '').replace(/^00/, '+');
}

export async function listActiveIntegrations(businessId) {
  return many(
    `SELECT * FROM integrations WHERE business_id=$1 AND is_active=TRUE`,
    [businessId]
  );
}

// ---------------------------------------------------------------------------
// resolveExternalCustomer: try active external adapters to find a known customer
// by phone. Returns { external_customer_id, name, area, metadata } or null.
// ---------------------------------------------------------------------------
export async function resolveExternalCustomer(businessId, phone) {
  const integrations = await listActiveIntegrations(businessId);
  const want = normPhone(phone);
  for (const ig of integrations) {
    try {
      const hit = await ADAPTERS[ig.integration_type]?.lookup(ig, want);
      if (hit) return { ...hit, _via: ig.integration_type };
    } catch (e) {
      // fail soft — a broken adapter must not break the bot
      console.error(`integration ${ig.integration_type} lookup failed`, e.message);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// syncCustomers: pull/refresh customers for one integration (Workflow 7).
// Returns { upserted }.
// ---------------------------------------------------------------------------
export async function syncIntegration(businessId, integration) {
  const a = ADAPTERS[integration.integration_type];
  if (!a || !a.sync) return { upserted: 0, skipped: true };
  const rows = await a.sync(integration);
  let n = 0;
  for (const r of rows) {
    const phone = normPhone(r.phone);
    if (!phone) continue;
    await query(
      `INSERT INTO customers (business_id, phone, name, area, external_customer_id, metadata)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (business_id, phone) DO UPDATE
         SET name=COALESCE(EXCLUDED.name, customers.name),
             area=COALESCE(EXCLUDED.area, customers.area),
             external_customer_id=COALESCE(EXCLUDED.external_customer_id, customers.external_customer_id),
             last_seen_at=customers.last_seen_at`,
      [businessId, phone, r.name || null, r.area || null, r.external_customer_id || null, r.metadata || {}]
    );
    n++;
  }
  await query(
    `UPDATE integrations SET last_sync_at=NOW(), last_sync_status=$2 WHERE id=$1`,
    [integration.id, `ok:${n}`]
  );
  return { upserted: n };
}

// ---------------------------------------------------------------------------
// Adapters. lookup(integration, phone) and/or sync(integration) -> rows.
// ---------------------------------------------------------------------------
const ADAPTERS = {
  manual: {
    // Customers added by hand live in our own table; nothing external.
    async lookup() { return null; },
  },

  csv: {
    // CSV rows are imported into `customers` at upload time; resolve = our DB.
    async lookup() { return null; },
    async sync(ig) {
      // optional: re-fetch from a stored URL
      const url = ig.config?.csv_url;
      if (!url) return [];
      const text = await (await fetch(url)).text();
      return parseCSV(text);
    },
  },

  google_sheets: {
    // Expects config.csv_url = a "Publish to web" CSV link of the sheet.
    async lookup(ig, phone) {
      const url = ig.config?.csv_url;
      if (!url) return null;
      const text = await (await fetch(url)).text();
      const rows = parseCSV(text);
      const hit = rows.find((r) => normPhone(r.phone) === phone);
      return hit
        ? { external_customer_id: hit.id || null, name: hit.name, area: hit.area, metadata: hit }
        : null;
    },
    async sync(ig) {
      const url = ig.config?.csv_url;
      if (!url) return [];
      const text = await (await fetch(url)).text();
      return parseCSV(text);
    },
  },

  // Generic SQL connector PLACEHOLDER (MVP). Wire a real driver (mysql2 / pg)
  // here using ig.config = { host, port, user, password, database, lookup_query }.
  sql: {
    async lookup(ig /*, phone */) {
      // TODO: connect with the configured driver and run ig.config.lookup_query.
      return null;
    },
  },

  // Optional, internet-vertical only. PLACEHOLDER.
  radius: {
    async lookup(ig /*, phone */) {
      // TODO: query Radius/DMA by phone or username. Returns customer if found.
      return null;
    },
  },

  // Optional, internet-vertical only. PLACEHOLDER.
  mikrotik: {
    async lookup() { return null; },
  },

  none: { async lookup() { return null; } },
  whatsapp: { async lookup() { return null; } },
};

export { ADAPTERS };
