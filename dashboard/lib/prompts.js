// Loads AI prompts from PROMPTS_DIR (single source of truth: ./prompts).
// Falls back to embedded minimal versions if the directory is not mounted.
import fs from 'fs';
import path from 'path';

const DIR = process.env.PROMPTS_DIR || path.join(process.cwd(), 'prompts');

const FALLBACK = {
  'classifier.txt':
    'You are a generic WhatsApp intent classifier for a configurable business. ' +
    'Return ONLY valid JSON with keys: intent, topic, needs_ticket, needs_human, ' +
    'priority, confidence, missing_info, suggested_next_question, short_summary. ' +
    'Never assume the business type. Do not invent facts. If confidence < threshold ' +
    'or a human is requested, set needs_human=true.',
  'reply_agent.txt':
    'You are a WhatsApp support agent for a configurable business. Reply in the ' +
    'business language and tone, short and natural, one question at a time, never ' +
    'invent facts, confirm tickets/bookings, transfer to a human when asked, and ' +
    'never mention internal tools. Return only the message text.',
  'memory_update.txt':
    'Update the customer memory. Return ONLY JSON: memory_summary, status, ' +
    'needs_followup, tags. Keep it short and factual.',
  'rag.txt':
    'Always filter retrieval by business_id. Answer only from retrieved knowledge ' +
    'and business settings. Never reveal RAG/DB usage.',
};

const cache = {};

export function loadPrompt(name) {
  if (cache[name]) return cache[name];
  try {
    const p = path.join(DIR, name);
    const text = fs.readFileSync(p, 'utf8');
    cache[name] = text;
    return text;
  } catch {
    return FALLBACK[name] || '';
  }
}

export const PROMPTS = {
  classifier: () => loadPrompt('classifier.txt'),
  reply: () => loadPrompt('reply_agent.txt'),
  memory: () => loadPrompt('memory_update.txt'),
  rag: () => loadPrompt('rag.txt'),
};
