// Vector adapter — switch between pgvector and Qdrant via VECTOR_PROVIDER.
// Tenant isolation: every search filters by business_id (see prompts/rag.txt).
import { query, many } from './db';
import { EMBED_DIM } from './ai';

const PROVIDER = process.env.VECTOR_PROVIDER || 'pgvector';
const QDRANT_URL = (process.env.QDRANT_URL || 'http://qdrant:6333').replace(/\/+$/, '');
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const COLLECTION = 'knowledge';

function qHeaders() {
  const h = { 'content-type': 'application/json' };
  if (QDRANT_API_KEY) h['api-key'] = QDRANT_API_KEY;
  return h;
}
function toVectorLiteral(arr) {
  return '[' + arr.map((x) => (Number.isFinite(x) ? x : 0)).join(',') + ']';
}

// Create the Qdrant collection if missing (no-op for pgvector).
export async function ensureReady() {
  if (PROVIDER !== 'qdrant') return;
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, { headers: qHeaders() });
  if (res.ok) return;
  await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, {
    method: 'PUT',
    headers: qHeaders(),
    body: JSON.stringify({ vectors: { size: EMBED_DIM, distance: 'Cosine' } }),
  });
}

// items: [{ id, embedding, content, title, category, source }]
export async function storeVectors(businessId, items) {
  if (!items.length) return;
  if (PROVIDER === 'qdrant') {
    await ensureReady();
    const points = items.map((it) => ({
      id: it.id,
      vector: it.embedding,
      payload: {
        business_id: businessId,
        content: it.content,
        title: it.title,
        category: it.category,
        source: it.source,
      },
    }));
    const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points?wait=true`, {
      method: 'PUT',
      headers: qHeaders(),
      body: JSON.stringify({ points }),
    });
    if (!res.ok) throw new Error('Qdrant upsert failed: ' + (await res.text()));
    return;
  }
  // pgvector: store the vector back on the chunk row.
  for (const it of items) {
    await query('UPDATE knowledge_chunks SET embedding = $1::vector WHERE id = $2', [
      toVectorLiteral(it.embedding),
      it.id,
    ]);
  }
}

// Returns [{ id, content, title, category, similarity }]
export async function search(businessId, embedding, k = 5, minSim = 0.0) {
  if (PROVIDER === 'qdrant') {
    const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points/search`, {
      method: 'POST',
      headers: qHeaders(),
      body: JSON.stringify({
        vector: embedding,
        limit: k,
        score_threshold: minSim || undefined,
        with_payload: true,
        filter: { must: [{ key: 'business_id', match: { value: businessId } }] },
      }),
    });
    if (!res.ok) throw new Error('Qdrant search failed: ' + (await res.text()));
    const data = await res.json();
    return (data.result || []).map((r) => ({
      id: r.id,
      content: r.payload?.content,
      title: r.payload?.title,
      category: r.payload?.category,
      similarity: r.score,
    }));
  }
  // pgvector via the SQL helper (filters by business_id internally).
  return many(
    'SELECT * FROM match_knowledge_chunks($1, $2::vector, $3, $4)',
    [businessId, toVectorLiteral(embedding), k, minSim]
  );
}

export const vectorProvider = PROVIDER;
