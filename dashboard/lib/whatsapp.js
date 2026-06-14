// WhatsApp Cloud API (Meta) sender.
// In demo mode (no real token) it logs instead of calling Meta, so the whole
// pipeline can be exercised locally without WhatsApp credentials.

function isDemoToken(t) {
  return !t || t === 'REPLACE_ME' || t === 'demo';
}

export async function sendWhatsAppText(waConfig, to, text) {
  const token = waConfig?.access_token;
  const phoneId = waConfig?.phone_number_id;
  const version = waConfig?.api_version || process.env.WHATSAPP_API_VERSION || 'v21.0';

  if (isDemoToken(token) || !phoneId) {
    console.log(`[whatsapp:demo] -> ${to}: ${text}`);
    return { demo: true, to, text, messages: [{ id: 'demo-' + Date.now() }] };
  }

  const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('WhatsApp send failed: ' + JSON.stringify(data));
  return data;
}

// Parse an inbound Meta webhook payload into a normalized message (or null).
export function parseInboundWebhook(body) {
  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const msg = value?.messages?.[0];
    if (!msg) return null; // could be a status callback, ignore
    return {
      phoneNumberId: value.metadata?.phone_number_id,
      from: msg.from, // customer phone (no +)
      messageId: msg.id,
      type: msg.type,
      text:
        msg.text?.body ||
        msg.button?.text ||
        msg.interactive?.list_reply?.title ||
        msg.interactive?.button_reply?.title ||
        '',
      contactName: value.contacts?.[0]?.profile?.name || null,
      raw: msg,
    };
  } catch {
    return null;
  }
}
