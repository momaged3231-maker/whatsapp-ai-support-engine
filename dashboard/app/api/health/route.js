import { NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { chatConfigured, embeddingsConfigured } from '@/lib/ai';
import { vectorProvider } from '@/lib/vector';

export const dynamic = 'force-dynamic';

export async function GET() {
  let db = false;
  try { await one('SELECT 1 AS ok'); db = true; } catch {}
  return NextResponse.json({
    ok: db,
    db,
    vector_provider: vectorProvider,
    ai_provider: process.env.AI_PROVIDER || 'openai',
    chat_configured: chatConfigured(),
    embeddings_configured: embeddingsConfigured(),
    time: new Date().toISOString(),
  });
}
