// Provider-agnostic AI adapter.
//
// CHAT:   AI_PROVIDER = openai | anthropic
//   - "openai" hits any OpenAI-compatible /chat/completions endpoint, which
//     includes OpenAI, Azure, Together, Groq, OpenRouter, and LOCAL servers
//     (Ollama, LM Studio, vLLM) via AI_BASE_URL.
//   - "anthropic" hits the Claude Messages API.
//
// EMBEDDINGS: always use the OpenAI-compatible /embeddings endpoint
//   (AI_BASE_URL + AI_API_KEY + AI_EMBEDDING_MODEL). This lets you run a local
//   embedding model even when chat uses Anthropic.

const PROVIDER = process.env.AI_PROVIDER || 'openai';
const AI_BASE_URL = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const AI_API_KEY = process.env.AI_API_KEY || '';
const CHAT_MODEL = process.env.AI_CHAT_MODEL || 'gpt-4o-mini';
const EMBED_MODEL = process.env.AI_EMBEDDING_MODEL || 'text-embedding-3-small';
export const EMBED_DIM = parseInt(process.env.AI_EMBEDDING_DIM || '1536', 10);

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_BASE = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, '');

export function chatConfigured() {
  return PROVIDER === 'anthropic' ? !!ANTHROPIC_KEY : !!AI_API_KEY;
}
export function embeddingsConfigured() {
  return !!AI_API_KEY;
}

async function httpJson(url, opts) {
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(`AI HTTP ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : {};
}

// Returns a plain string. If json=true, instructs the model to return JSON.
export async function chatComplete({ system, user, json = false, temperature = 0.3 }) {
  if (PROVIDER === 'anthropic') {
    const body = {
      model: CHAT_MODEL,
      max_tokens: 1024,
      temperature,
      system: system + (json ? '\nReturn ONLY valid JSON.' : ''),
      messages: [{ role: 'user', content: user }],
    };
    const data = await httpJson(`${ANTHROPIC_BASE}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    return (data.content && data.content[0] && data.content[0].text) || '';
  }

  // OpenAI-compatible (incl. local)
  const body = {
    model: CHAT_MODEL,
    temperature,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
  if (json) body.response_format = { type: 'json_object' };
  const data = await httpJson(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return (data.choices && data.choices[0] && data.choices[0].message.content) || '';
}

// Parse a JSON object out of a model response (tolerant of stray text).
export function parseJsonLoose(s) {
  if (!s) return null;
  try { return JSON.parse(s); } catch {}
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a !== -1 && b !== -1 && b > a) {
    try { return JSON.parse(s.slice(a, b + 1)); } catch {}
  }
  return null;
}

// Embed one string or an array of strings -> array of vectors.
export async function embed(input) {
  const arr = Array.isArray(input) ? input : [input];
  const data = await httpJson(`${AI_BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: arr }),
  });
  return data.data.map((d) => d.embedding);
}
