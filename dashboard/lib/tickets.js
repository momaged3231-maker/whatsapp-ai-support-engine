// Ticket creation (Workflow 3) + support notification (Workflow 4).
import { one, many } from './db';
import { sendWhatsAppText } from './whatsapp';

// Create a ticket using the business ticket rules. Code: BUS-{id}-YYYYMMDD-0001
export async function createTicket(businessId, customerId, data = {}) {
  const ticket = await one(
    `INSERT INTO tickets
       (business_id, customer_id, ticket_code, ticket_type, issue_type,
        priority, status, summary, ai_diagnosis, fields, metadata)
     VALUES ($1,$2, generate_ticket_code($1), $3,$4,$5,'open',$6,$7,$8,$9)
     RETURNING *`,
    [
      businessId,
      customerId,
      data.ticket_type || 'general',
      data.issue_type || null,
      data.priority || 'medium',
      data.summary || null,
      data.ai_diagnosis || null,
      data.fields || {},
      data.metadata || {},
    ]
  );
  await one(
    `INSERT INTO ticket_events (business_id, ticket_id, event_type, note, created_by)
     VALUES ($1,$2,'created',$3,'system') RETURNING id`,
    [businessId, ticket.id, 'تم إنشاء التذكرة تلقائياً']
  );
  return ticket;
}

export async function setTicketStatus(ticketId, status, note, by = 'agent') {
  const ticket = await one(
    `UPDATE tickets SET status=$2,
       solved_at = CASE WHEN $2='solved' THEN NOW() ELSE solved_at END
     WHERE id=$1 RETURNING *`,
    [ticketId, status]
  );
  if (ticket) {
    await one(
      `INSERT INTO ticket_events (business_id, ticket_id, event_type, note, created_by)
       VALUES ($1,$2,'status_change',$3,$4) RETURNING id`,
      [ticket.business_id, ticketId, note || `status -> ${status}`, by]
    );
  }
  return ticket;
}

// Send the support report/notification (Workflow 4). Routes to active support
// members by area when possible, else to all. Channels other than whatsapp are
// recorded but only whatsapp is sent here (telegram/email are optional later).
export async function notifySupport(business, waConfig, ticket, customer) {
  const members = await many(
    `SELECT * FROM support_members
      WHERE business_id=$1 AND is_active=TRUE AND channel='whatsapp'`,
    [business.id]
  );
  const targeted = members.filter(
    (m) => !m.area || m.area === 'all' || (customer?.area && m.area === customer.area)
  );
  const recipients = (targeted.length ? targeted : members);

  const msg =
    `🆕 تذكرة جديدة - ${business.name}\n` +
    `كود: ${ticket.ticket_code}\n` +
    `النوع: ${ticket.ticket_type || '-'} | الأولوية: ${ticket.priority}\n` +
    `العميل: ${customer?.name || 'غير معروف'} (${customer?.phone || '-'})\n` +
    `المنطقة: ${customer?.area || '-'}\n` +
    `الملخص: ${ticket.summary || '-'}\n` +
    (ticket.ai_diagnosis ? `التشخيص: ${ticket.ai_diagnosis}\n` : '');

  const sent = [];
  for (const m of recipients) {
    try {
      await sendWhatsAppText(waConfig, m.phone, msg);
      sent.push(m.phone);
    } catch (e) {
      console.error('notify support failed', m.phone, e.message);
    }
  }
  await one(
    `INSERT INTO ticket_events (business_id, ticket_id, event_type, note, created_by, metadata)
     VALUES ($1,$2,'notified',$3,'system',$4) RETURNING id`,
    [business.id, ticket.id, `أُبلغ الدعم: ${sent.length} رقم`, { sent }]
  );
  return { sent };
}
