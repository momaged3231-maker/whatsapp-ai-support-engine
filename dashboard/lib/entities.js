// Whitelist for the generic CRUD API (app/api/[entity]). Column names are
// validated against these lists so they can be safely interpolated into SQL.
// Values are always passed as parameters.

export const ENTITIES = {
  businesses: {
    table: 'businesses',
    scoped: false,
    columns: ['name', 'business_type', 'description', 'phone', 'email', 'logo_url', 'timezone', 'language', 'is_active'],
    order: 'id DESC',
  },
  business_settings: {
    table: 'business_settings',
    scoped: true,
    columns: ['working_hours', 'coverage_areas', 'policies', 'intents', 'ticket_rules', 'report_config',
      'default_reply_style', 'welcome_message', 'handoff_message', 'fallback_message',
      'allow_ai_auto_reply', 'allow_ticket_creation', 'require_human_approval',
      'confidence_threshold', 'use_external_db'],
    json: ['working_hours', 'coverage_areas', 'policies', 'intents', 'ticket_rules', 'report_config'],
    order: 'id DESC',
  },
  services: {
    table: 'services',
    scoped: true,
    columns: ['name', 'description', 'category', 'price', 'currency', 'price_visible', 'duration', 'needs_booking', 'needs_staff', 'is_active', 'metadata'],
    json: ['metadata'],
    order: 'id DESC',
  },
  knowledge_documents: {
    table: 'knowledge_documents',
    scoped: true,
    columns: ['title', 'category', 'content', 'source', 'is_active'],
    order: 'id DESC',
  },
  customers: {
    table: 'customers',
    scoped: true,
    columns: ['phone', 'name', 'area', 'status', 'tags', 'metadata', 'memory_summary', 'needs_followup', 'external_customer_id'],
    json: ['tags', 'metadata'],
    order: 'last_seen_at DESC',
  },
  tickets: {
    table: 'tickets',
    scoped: true,
    columns: ['customer_id', 'ticket_type', 'issue_type', 'priority', 'status', 'assigned_to', 'summary', 'ai_diagnosis', 'fields', 'metadata'],
    json: ['fields', 'metadata'],
    order: 'created_at DESC',
  },
  support_members: {
    table: 'support_members',
    scoped: true,
    columns: ['name', 'phone', 'role', 'area', 'channel', 'is_active'],
    order: 'id DESC',
  },
  integrations: {
    table: 'integrations',
    scoped: true,
    columns: ['integration_type', 'name', 'config', 'is_active'],
    json: ['config'],
    order: 'id DESC',
  },
  reports: {
    table: 'reports',
    scoped: true,
    columns: ['report_type', 'report_data'],
    json: ['report_data'],
    order: 'created_at DESC',
  },
  conversations: {
    table: 'conversations',
    scoped: true,
    columns: [],
    order: 'created_at DESC',
  },
};

export function entityDef(name) {
  return ENTITIES[name] || null;
}
