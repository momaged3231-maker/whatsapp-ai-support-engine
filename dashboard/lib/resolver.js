// Business + customer resolution (sections 5, 9, 15 of the brief).
import { one } from './db';
import { resolveExternalCustomer } from './integrations';

// Identify the tenant from the WhatsApp phone_number_id on the inbound webhook.
export async function resolveBusinessByPhoneId(phoneNumberId) {
  const row = await one(
    `SELECT b.*, i.config AS wa_config, i.id AS integration_id
       FROM integrations i
       JOIN businesses b ON b.id = i.business_id
      WHERE i.integration_type='whatsapp'
        AND i.is_active=TRUE
        AND i.config->>'phone_number_id' = $1
        AND b.is_active=TRUE
      LIMIT 1`,
    [String(phoneNumberId)]
  );
  return row; // null if unknown
}

export async function getBusinessBundle(businessId) {
  const business = await one(`SELECT * FROM businesses WHERE id=$1`, [businessId]);
  const settings = await one(`SELECT * FROM business_settings WHERE business_id=$1`, [businessId]);
  return { business, settings };
}

// resolveCustomer(business_id, whatsapp_phone, message_text)
// 1) look in customers  2) if missing, try external adapters  3) else create new.
export async function resolveCustomer(businessId, phone, _messageText) {
  let customer = await one(
    `SELECT * FROM customers WHERE business_id=$1 AND phone=$2`,
    [businessId, phone]
  );
  if (customer) {
    await one(`UPDATE customers SET last_seen_at=NOW() WHERE id=$1 RETURNING id`, [customer.id]);
    return { customer, created: false, source: 'internal' };
  }

  // Not in our DB — ask the active integrations (Sheets / SQL / Radius / ...).
  const ext = await resolveExternalCustomer(businessId, phone);

  customer = await one(
    `INSERT INTO customers (business_id, phone, name, area, external_customer_id, status, metadata)
     VALUES ($1,$2,$3,$4,$5,'new',$6)
     ON CONFLICT (business_id, phone) DO UPDATE SET last_seen_at=NOW()
     RETURNING *`,
    [
      businessId,
      phone,
      ext?.name || null,
      ext?.area || null,
      ext?.external_customer_id || null,
      ext?.metadata || {},
    ]
  );
  return { customer, created: true, source: ext ? ext._via : 'whatsapp' };
}
