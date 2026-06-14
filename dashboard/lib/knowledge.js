// Knowledge ingestion (Workflow 2): clean -> chunk -> embed -> store vectors.
import { one, many, query } from './db';
import { embed, embeddingsConfigured } from './ai';
import { storeVectors } from './vector';

function cleanText(s) {
  return (s || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

// ~800 char chunks with ~120 char overlap; short docs stay single-chunk.
export function chunkText(text, size = 800, overlap = 120) {
  const t = cleanText(text);
  if (t.length <= size) return [t];
  const chunks = [];
  let i = 0;
  while (i < t.length) {
    let end = Math.min(i + size, t.length);
    // try to break on a sentence/space boundary
    if (end < t.length) {
      const slice = t.slice(i, end);
      const lastBreak = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('\n'), slice.lastIndexOf('! '), slice.lastIndexOf('؟ '));
      if (lastBreak > size * 0.5) end = i + lastBreak + 1;
    }
    chunks.push(t.slice(i, end).trim());
    if (end >= t.length) break;
    i = end - overlap;
  }
  return chunks.filter(Boolean);
}

export async function ingestDocument(documentId) {
  const doc = await one(`SELECT * FROM knowledge_documents WHERE id=$1`, [documentId]);
  if (!doc) throw new Error('document not found');

  // Re-ingest cleanly.
  await query(`DELETE FROM knowledge_chunks WHERE document_id=$1`, [documentId]);

  const parts = chunkText(doc.content);
  const chunkRows = [];
  for (let idx = 0; idx < parts.length; idx++) {
    const row = await one(
      `INSERT INTO knowledge_chunks
         (business_id, document_id, chunk_index, content, category, title, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [doc.business_id, documentId, idx, parts[idx], doc.category, doc.title, doc.source]
    );
    chunkRows.push({ id: row.id, content: parts[idx], title: doc.title, category: doc.category, source: doc.source });
  }

  let status = 'pending';
  if (embeddingsConfigured() && chunkRows.length) {
    const vectors = await embed(chunkRows.map((c) => c.content));
    const items = chunkRows.map((c, i) => ({ ...c, embedding: vectors[i] }));
    await storeVectors(doc.business_id, items);
    status = 'done';
  }
  await query(`UPDATE knowledge_documents SET embedding_status=$2 WHERE id=$1`, [documentId, status]);
  return { chunks: chunkRows.length, status };
}

// Ingest all pending docs for a business (used after bulk import).
export async function ingestPending(businessId) {
  const docs = await many(
    `SELECT id FROM knowledge_documents
      WHERE business_id=$1 AND is_active=TRUE AND embedding_status <> 'done'`,
    [businessId]
  );
  let total = 0;
  for (const d of docs) {
    const r = await ingestDocument(d.id);
    total += r.chunks;
  }
  return { documents: docs.length, chunks: total };
}
