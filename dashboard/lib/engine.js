// =============================================================================
// Core engine — implements Workflow 1 (WhatsApp Incoming) in code so the bot
// runs end-to-end from the dashboard webhook. The n8n workflows can either call
// this engine (POST /api/whatsapp) or reproduce these steps node-by-node.
//
// Pipeline:
//   resolve business -> resolve customer -> save inbound -> load memory
//   -> retrieve knowledge (RAG) -> classify -> reply -> maybe ticket
//   -> send WhatsApp -> save outbound -> update memory -> notify support
//
// Works WITHOUT AI keys via a heuristic fallback + lexical knowledge search,
// so the first demo runs offline. With keys, it uses the configured provider.
// =============================================================================
import { one, many, query } from './db';
import { resolveBusinessByPhoneId, getBusinessBundle, resolveCustomer } from './resolver';
import { chatComplete, parseJsonLoose, embed, embeddingsConfigured, chatConfigured } from './ai';
import { search as vectorSearch } from './vector';
import { PROMPTS } from './prompts';
import { createTicket, notifySupport } from './tickets';
import { sendWhatsAppText } from './whatsapp';

// ---- knowledge retrieval: vector first, lexical fallback ----
async function retrieveKnowledge(businessId, text) {
  if (embeddingsConfigured()) {
    try {
      const [vec] = await embed(text);
      const hits = await vectorSearch(businessId, vec, 5, 0.15);
      if (hits.length) return hits;
    } catch (e) {
      console.error('vector search failed, falling back to lexical', e.message);
    }
  }
  // Lexical fallback over source documents (good enough for demos w/o embeddings)
  const words = (text || '').split(/\s+/).filter((w) => w.length >= 3).slice(0, 6);
  if (!words.length) return [];
  const likes = words.map((_, i) => `content ILIKE $${i + 2}`).join(' OR ');
  const rows = await many(
    `SELECT id, title, category, content FROM knowledge_documents
      WHERE business_id=$1 AND is_active=TRUE AND (${likes})
      LIMIT 4`,
    [businessId, ...words.map((w) => `%${w}%`)]
  );
  return rows.map((r) => ({ ...r, similarity: null }));
}

async function recentMessages(customerId, limit = 6) {
  const rows = await many(
    `SELECT direction, message_text, ai_response, created_at
       FROM conversations WHERE customer_id=$1
      ORDER BY created_at DESC LIMIT $2`,
    [customerId, limit]
  );
  return rows.reverse();
}

async function getServices(businessId) {
  return many(
    `SELECT name, description, category, price, currency, price_visible, duration,
            needs_booking, needs_staff
       FROM services WHERE business_id=$1 AND is_active=TRUE`,
    [businessId]
  );
}

// ---------------- heuristic fallback (no AI key) ----------------
const KW = {
  human: ['موظف', 'حد يكلمني', 'بشري', 'اكلم حد', 'representative', 'agent', 'human', 'call me'],
  booking: ['حجز', 'احجز', 'موعد', 'معاينة', 'booking', 'appointment', 'reserve', 'كشف'],
  price: ['سعر', 'بكام', 'كام', 'التكلفة', 'الأسعار', 'price', 'cost', 'how much'],
  complaint: ['شكوى', 'زعلان', 'مش شغال', 'عطل', 'بطيء', 'قاطع', 'مشكلة', 'broken', 'not working', 'slow'],
  hours: ['مواعيد', 'ميعاد', 'الساعة كام', 'مفتوح', 'working hours', 'open', 'مفتوحين'],
  greeting: ['السلام', 'سلام', 'اهلا', 'أهلا', 'هاي', 'مرحبا', 'hi', 'hello', 'صباح', 'مساء'],
};
function matchAny(text, arr) { const t = (text || '').toLowerCase(); return arr.some((k) => t.includes(k.toLowerCase())); }

function heuristicClassify(text, rules) {
  let intent = 'unknown', needs_human = false, needs_ticket = false, confidence = 0.5;
  if (matchAny(text, KW.human)) { intent = 'human_request'; needs_human = true; confidence = 0.9; }
  else if (matchAny(text, KW.booking)) { intent = 'booking_request'; needs_ticket = true; confidence = 0.7; }
  else if (matchAny(text, KW.complaint)) { intent = 'complaint'; needs_ticket = true; confidence = 0.7; }
  else if (matchAny(text, KW.price)) { intent = 'price_question'; confidence = 0.7; }
  else if (matchAny(text, KW.hours)) { intent = 'working_hours_question'; confidence = 0.75; }
  else if (matchAny(text, KW.greeting)) { intent = 'greeting'; confidence = 0.8; }
  const triggers = rules?.create_ticket_when || [];
  if (intent === 'complaint' && !triggers.includes('customer_complaint')) needs_ticket = false;
  return {
    intent, topic: intent, needs_ticket, needs_human,
    priority: rules?.default_priority || 'medium',
    confidence, missing_info: [], suggested_next_question: '',
    short_summary: (text || '').slice(0, 120),
  };
}

function heuristicReply({ intent, settings, knowledge, ticket, business }) {
  const s = settings || {};
  if (intent === 'greeting') return s.welcome_message || `أهلاً بك في ${business.name} 👋`;
  if (intent === 'human_request') return s.handoff_message || 'هحوّلك لأحد زملائي في الدعم حالاً 🙏';
  if (ticket) {
    return `تمام، فتحنا لك طلب بكود ${ticket.ticket_code} ✅ وهنتواصل معاك قريب.`;
  }
  if (knowledge && knowledge.length) {
    const top = knowledge[0];
    return `${top.content}${top.content.length < 160 ? '' : ''}`.slice(0, 600);
  }
  return s.fallback_message || 'فريقنا هيراجع طلبك ويرد عليك قريب 🙏';
}

// ---------------- context builder for AI prompts ----------------
function buildContextPayload({ business, settings, services, customer, memory, recent, knowledge, message, intent, ticket }) {
  return JSON.stringify({
    BUSINESS_PROFILE: {
      name: business.name, type: business.business_type,
      description: business.description, language: business.language,
      tone: settings?.default_reply_style,
    },
    BUSINESS_SETTINGS: {
      working_hours: settings?.working_hours, coverage_areas: settings?.coverage_areas,
      policies: settings?.policies, welcome_message: settings?.welcome_message,
      handoff_message: settings?.handoff_message, fallback_message: settings?.fallback_message,
      confidence_threshold: settings?.confidence_threshold,
    },
    TICKET_RULES: settings?.ticket_rules || {},
    ALLOWED_INTENTS: (settings?.intents || []).concat([
      'greeting', 'service_question', 'price_question', 'booking_request', 'complaint',
      'support_request', 'order_status', 'payment_question', 'location_question',
      'working_hours_question', 'human_request', 'follow_up_existing_ticket', 'unknown',
    ]),
    SERVICES: services,
    CUSTOMER_PROFILE: customer ? { name: customer.name, area: customer.area, status: customer.status } : null,
    CUSTOMER_MEMORY: memory || '',
    RECENT_MESSAGES: recent,
    RETRIEVED_KNOWLEDGE: (knowledge || []).map((k) => ({ title: k.title, category: k.category, content: k.content })),
    INTENT: intent || null,
    TICKET_STATUS: ticket ? { ticket_code: ticket.ticket_code, status: ticket.status, type: ticket.ticket_type } : null,
    CUSTOMER_MESSAGE: message,
  }, null, 0);
}

// ---------------- main entry ----------------
export async function processIncomingMessage({ phoneNumberId, from, text, messageId, contactName }) {
  const business = await resolveBusinessByPhoneId(phoneNumberId);
  if (!business) return { ok: false, error: 'unknown_business', phoneNumberId };

  const { settings } = await getBusinessBundle(business.id);
  const phone = from.startsWith('+') ? from : `+${from}`;
  const { customer } = await resolveCustomer(business.id, phone, text);
  if (contactName && !customer.name) {
    await query(`UPDATE customers SET name=$2 WHERE id=$1`, [customer.id, contactName]);
    customer.name = contactName;
  }

  // save inbound
  await query(
    `INSERT INTO conversations (business_id, customer_id, whatsapp_message_id, direction, message_text)
     VALUES ($1,$2,$3,'inbound',$4)`,
    [business.id, customer.id, messageId || null, text]
  );

  const memory = customer.memory_summary || '';
  const recent = await recentMessages(customer.id);
  const services = await getServices(business.id);
  const knowledge = await retrieveKnowledge(business.id, text);

  // ----- classify -----
  let intent;
  if (chatConfigured()) {
    try {
      const raw = await chatComplete({
        system: PROMPTS.classifier(),
        user: buildContextPayload({ business, settings, services, customer, memory, recent, knowledge, message: text }),
        json: true, temperature: 0,
      });
      intent = parseJsonLoose(raw);
    } catch (e) { console.error('AI classify failed', e.message); }
  }
  if (!intent) intent = heuristicClassify(text, settings?.ticket_rules);

  // enforce confidence threshold
  const thr = Number(settings?.confidence_threshold ?? 0.65);
  if (Number(intent.confidence ?? 0) < thr) intent.needs_human = true;

  // ----- ticket -----
  let ticket = null;
  const canTicket = settings?.allow_ticket_creation !== false;
  const confirmFirst = settings?.ticket_rules?.confirm_before_create;
  // For MVP demo we create immediately when needed unless confirm flow is desired.
  if (canTicket && intent.needs_ticket && (!confirmFirst || /اه|نعم|تمام|اكد|أكد|yes|ok|تأكيد/i.test(text))) {
    ticket = await createTicket(business.id, customer.id, {
      ticket_type: settings?.ticket_rules?.ticket_type || intent.intent,
      issue_type: intent.topic,
      priority: intent.priority,
      summary: intent.short_summary,
      ai_diagnosis: intent.ai_diagnosis || null,
      fields: {},
    });
  }

  // ----- reply -----
  let reply;
  if (chatConfigured()) {
    try {
      reply = (await chatComplete({
        system: PROMPTS.reply(),
        user: buildContextPayload({ business, settings, services, customer, memory, recent, knowledge, message: text, intent, ticket }),
        temperature: 0.4,
      })).trim();
    } catch (e) { console.error('AI reply failed', e.message); }
  }
  if (!reply) reply = heuristicReply({ intent: intent.intent, settings, knowledge, ticket, business });

  // ----- send + save outbound -----
  await sendWhatsAppText(business.wa_config, from, reply);
  await query(
    `INSERT INTO conversations (business_id, customer_id, direction, message_text, ai_response, intent, confidence, needs_human)
     VALUES ($1,$2,'outbound',$3,$4,$5,$6,$7)`,
    [business.id, customer.id, text, reply, intent.intent, intent.confidence ?? null, !!intent.needs_human]
  );

  // ----- memory update (best-effort) -----
  try { await updateMemory({ business, settings, customer, recent, intent, ticket, lastInbound: text, lastOutbound: reply }); }
  catch (e) { console.error('memory update failed', e.message); }

  // ----- support notification -----
  let notified = null;
  if (ticket || intent.needs_human) {
    const t = ticket || (await createTicketForHuman(business, customer, intent, settings, canTicket));
    if (t) notified = await notifySupport(business, business.wa_config, t, customer);
    if (t && !ticket) ticket = t;
  }

  return {
    ok: true, business: business.name, customer: customer.phone,
    intent: intent.intent, needs_human: !!intent.needs_human,
    ticket: ticket?.ticket_code || null, reply, notified,
  };
}

// If a human is needed but no ticket was created, open a lightweight one so the
// handoff is tracked and support gets notified.
async function createTicketForHuman(business, customer, intent, settings, canTicket) {
  if (!canTicket) return null;
  return createTicket(business.id, customer.id, {
    ticket_type: 'human_handoff', issue_type: intent.topic, priority: intent.priority || 'high',
    summary: intent.short_summary || 'العميل طلب التحدث مع موظف',
  });
}

// ---- memory ----
async function updateMemory({ business, settings, customer, intent, ticket, lastInbound, lastOutbound }) {
  let result = null;
  if (chatConfigured()) {
    try {
      const raw = await chatComplete({
        system: PROMPTS.memory(),
        user: JSON.stringify({
          BUSINESS_PROFILE: { type: business.business_type, language: business.language },
          PREVIOUS_MEMORY: customer.memory_summary || '',
          LATEST_EXCHANGE: { inbound: lastInbound, outbound: lastOutbound },
          INTENT: intent, TICKET_STATUS: ticket ? { code: ticket.ticket_code } : null,
        }),
        json: true, temperature: 0.2,
      });
      result = parseJsonLoose(raw);
    } catch (e) { console.error('AI memory failed', e.message); }
  }
  if (!result) {
    // heuristic memory: append a short note
    const note = `آخر تواصل: ${intent.intent}${ticket ? ` (تذكرة ${ticket.ticket_code})` : ''}.`;
    const prev = customer.memory_summary || '';
    result = {
      memory_summary: (prev ? prev + ' ' : '') + note,
      status: ticket ? 'needs_followup' : (customer.status || 'active'),
      needs_followup: !!ticket || !!intent.needs_human,
      tags: [],
    };
    // keep it from growing forever
    if (result.memory_summary.length > 400) result.memory_summary = result.memory_summary.slice(-400);
  }
  await query(
    `UPDATE customers SET memory_summary=$2, status=$3, needs_followup=$4,
            tags = COALESCE($5, tags)
     WHERE id=$1`,
    [customer.id, result.memory_summary, result.status || 'active', !!result.needs_followup, JSON.stringify(result.tags || [])]
  );
}
