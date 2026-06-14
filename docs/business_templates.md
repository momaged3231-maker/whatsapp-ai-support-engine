# Business Templates

Templates are ready-made vertical presets stored in the `business_templates`
table and applied from the dashboard (**القوالب**). Applying a template sets the
business type and seeds `intents` + `ticket_rules` into `business_settings`.
Everything stays editable afterwards — templates are a starting point, not a lock.

Apply via UI, or:

```bash
curl -X POST http://localhost:3000/api/templates/apply \
  -H 'content-type: application/json' \
  -d '{"business_id":1,"template_key":"clinic"}'
```

## Included presets

### Internet / ADSL  (`internet`)
- **Intents:** `no_internet`, `speed_problem`, `router_problem`, `subscription_question`
- **Ticket type:** `maintenance`
- **Required fields:** `username`, `phone`, `area`
- **Default priority:** `high`

### Clinic  (`clinic`)
- **Intents:** `booking`, `doctor_question`, `working_hours`
- **Ticket type:** `appointment`
- **Required fields:** `name`, `phone`, `preferred_date`

### Restaurant  (`restaurant`)
- **Intents:** `menu`, `order`, `delivery`, `complaint`
- **Ticket type:** `order`
- **Required fields:** `name`, `phone`, `address`, `order_items`

### Real Estate  (`real_estate`)
- **Intents:** `rent_request`, `sale_request`, `viewing_booking`
- **Ticket type:** `lead`
- **Required fields:** `name`, `phone`, `area`, `budget`

### Maintenance Shop  (`maintenance`)
- **Intents:** `repair_request`, `price_question`, `pickup_request`
- **Ticket type:** `repair`
- **Required fields:** `device_type`, `issue`, `phone`

## Universal intents (always available)

`greeting`, `service_question`, `price_question`, `booking_request`,
`complaint`, `support_request`, `order_status`, `payment_question`,
`location_question`, `working_hours_question`, `human_request`,
`follow_up_existing_ticket`, `unknown`.

Each business can add its own intents in `business_settings.intents`.

## Ticket rules shape (`business_settings.ticket_rules`)

```json
{
  "create_ticket_when": [
    "customer_requests_booking",
    "customer_requests_maintenance",
    "customer_complaint",
    "ai_low_confidence",
    "human_requested"
  ],
  "required_fields": ["name", "phone", "area", "service_type"],
  "ticket_type": "maintenance",
  "default_priority": "medium",
  "confirm_before_create": true
}
```

- `confirm_before_create: true` → the bot confirms with the customer before
  opening the ticket (it opens once the customer says نعم/تمام/أكد/yes/ok).
- `confirm_before_create: false` → the bot opens the ticket immediately when a
  trigger matches.

## Adding your own vertical (e.g. pharmacy, clothing store, training center)

1. Insert a row into `business_templates` (key, name, business_type, config), or
2. Just configure a business directly: set its type, add services + knowledge,
   and write the `intents` / `ticket_rules` in the dashboard.

No code changes are required — that is the whole point of the engine.
