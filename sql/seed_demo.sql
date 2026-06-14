-- =============================================================================
-- WhatsApp AI Support Engine — DEMO SEED
-- 5 verticals proving the engine is generic (not internet-only):
--   1) Internet / ADSL   2) Clinic   3) Restaurant   4) Real Estate   5) Maintenance
--
-- Businesses are referenced by their unique name so this script is id-agnostic.
-- Knowledge documents are inserted with embedding_status='pending'; the dashboard
-- / ingestion workflow generates embeddings into knowledge_chunks on first run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TEMPLATE LIBRARY (section 17) — applied to new businesses from the dashboard
-- -----------------------------------------------------------------------------
INSERT INTO business_templates (key, name, business_type, description, config) VALUES
('internet', 'Internet / ADSL Company', 'internet',
 'بوت دعم لشركات الإنترنت و ADSL',
 '{"intents":["no_internet","speed_problem","router_problem","subscription_question"],
   "ticket_type":"maintenance",
   "required_fields":["username","phone","area"],
   "default_priority":"high"}'),
('clinic', 'Clinic', 'clinic',
 'بوت حجز ودعم للعيادات',
 '{"intents":["booking","doctor_question","working_hours"],
   "ticket_type":"appointment",
   "required_fields":["name","phone","preferred_date"],
   "default_priority":"medium"}'),
('restaurant', 'Restaurant', 'restaurant',
 'بوت طلبات وخدمة عملاء للمطاعم',
 '{"intents":["menu","order","delivery","complaint"],
   "ticket_type":"order",
   "required_fields":["name","phone","address","order_items"],
   "default_priority":"medium"}'),
('real_estate', 'Real Estate Office', 'real_estate',
 'بوت ليدز ومعاينات لمكاتب العقارات',
 '{"intents":["rent_request","sale_request","viewing_booking"],
   "ticket_type":"lead",
   "required_fields":["name","phone","area","budget"],
   "default_priority":"medium"}'),
('maintenance', 'Maintenance Shop', 'maintenance',
 'بوت طلبات إصلاح لمحلات الصيانة',
 '{"intents":["repair_request","price_question","pickup_request"],
   "ticket_type":"repair",
   "required_fields":["device_type","issue","phone"],
   "default_priority":"medium"}');

-- =============================================================================
-- BUSINESS 1 — INTERNET COMPANY
-- =============================================================================
INSERT INTO businesses (name, business_type, description, phone, email, timezone, language)
VALUES ('SpeedNet ADSL', 'internet', 'مزود خدمة إنترنت و ADSL في القاهرة الكبرى',
        '+20227000000', 'support@speednet.example', 'Africa/Cairo', 'ar-EG');

INSERT INTO business_settings
  (business_id, working_hours, coverage_areas, policies, intents, ticket_rules, report_config,
   default_reply_style, welcome_message, handoff_message, fallback_message,
   allow_ai_auto_reply, allow_ticket_creation, confidence_threshold, use_external_db)
SELECT id,
  '{"sun":["09:00","23:00"],"mon":["09:00","23:00"],"tue":["09:00","23:00"],"wed":["09:00","23:00"],"thu":["09:00","23:00"],"fri":["14:00","23:00"],"sat":["09:00","23:00"]}',
  '["مدينة نصر","المعادي","مصر الجديدة","حلوان","المعصرة"]',
  '{"refund":"يتم احتساب الاسترداد بنسبة المدة المتبقية من الباقة","sla":"زيارة الفني خلال 24-48 ساعة"}',
  '["no_internet","speed_problem","router_problem","subscription_question"]',
  '{"create_ticket_when":["customer_requests_maintenance","customer_complaint","ai_low_confidence","human_requested"],
    "required_fields":["username","phone","area"],
    "default_priority":"high",
    "confirm_before_create":true}',
  '{"sections":["new_customers","open_tickets","top_issues","needs_human"]}',
  'friendly_short',
  'أهلاً بك في SpeedNet 👋 إزاي أقدر أساعدك في خدمة الإنترنت؟',
  'هحوّلك لأحد زملائي في الدعم الفني حالاً، برجاء الانتظار لحظات 🙏',
  'لو محتاج مساعدة أكتر اكتب "دعم" وهنوصلك بفريق خدمة العملاء.',
  TRUE, TRUE, 0.65, FALSE
FROM businesses WHERE name='SpeedNet ADSL';

INSERT INTO services (business_id, name, description, category, price, price_visible, duration, needs_booking, needs_staff)
SELECT id, x.name, x.descr, x.cat, x.price::numeric, x.pv, x.dur, x.book, x.staff FROM businesses b,
(VALUES
  ('باقة 50 ميجا','اشتراك إنترنت منزلي 50Mbps','subscription',300,TRUE,'شهري',FALSE,FALSE),
  ('باقة 100 ميجا','اشتراك إنترنت منزلي 100Mbps','subscription',450,TRUE,'شهري',FALSE,FALSE),
  ('صيانة راوتر','زيارة فني لإصلاح أو ضبط الراوتر','maintenance',NULL,FALSE,'24-48 ساعة',TRUE,TRUE),
  ('تركيب خط جديد','تركيب خط ADSL جديد','installation',150,TRUE,'2-3 أيام',TRUE,TRUE)
) AS x(name,descr,cat,price,pv,dur,book,staff)
WHERE b.name='SpeedNet ADSL';

INSERT INTO knowledge_documents (business_id, title, category, content, source)
SELECT id, x.t, x.c, x.body, 'manual' FROM businesses b,
(VALUES
  ('النت قاطع - خطوات أولية','problem_solution','لو النت قاطع: 1) اقفل الراوتر دقيقتين وشغّله. 2) اتأكد إن لمبة DSL ثابتة. 3) لو لسه قاطع ابعت اسم المستخدم والمنطقة وهنفتحلك بلاغ صيانة.'),
  ('بطء السرعة','problem_solution','لو السرعة بطيئة: قرّب الأجهزة من الراوتر، قلّل عدد المتصلين، واعمل اختبار سرعة. لو المشكلة مستمرة هنبعت فني.'),
  ('مواعيد العمل','faq','الدعم الفني متاح يومياً من 9 صباحاً حتى 11 مساءً، الجمعة من 2 ظهراً.'),
  ('سياسة الاسترداد','policy','يتم احتساب الاسترداد بنسبة المدة المتبقية من الباقة عند إلغاء الاشتراك.')
) AS x(t,c,body)
WHERE b.name='SpeedNet ADSL';

INSERT INTO support_members (business_id, name, phone, role, area, channel)
SELECT id, x.n, x.p, x.r, x.a, 'whatsapp' FROM businesses b,
(VALUES ('أحمد فني','+20100000001','technician','مدينة نصر'),
        ('سارة دعم','+20100000002','agent','all'))
AS x(n,p,r,a) WHERE b.name='SpeedNet ADSL';

INSERT INTO integrations (business_id, integration_type, name, config, is_active)
SELECT id, 'whatsapp', 'WhatsApp Cloud',
  '{"phone_number_id":"100000000000001","waba_id":"200000000000001","access_token":"REPLACE_ME","verify_token":"speednet_verify","api_version":"v21.0"}', TRUE
FROM businesses WHERE name='SpeedNet ADSL';
INSERT INTO integrations (business_id, integration_type, name, config, is_active)
SELECT id, 'manual', 'Manual Customers', '{}', TRUE
FROM businesses WHERE name='SpeedNet ADSL';

-- =============================================================================
-- BUSINESS 2 — CLINIC
-- =============================================================================
INSERT INTO businesses (name, business_type, description, phone, email, timezone, language)
VALUES ('عيادة د. منى للأسنان', 'clinic', 'عيادة أسنان - كشف وتجميل وتقويم',
        '+20223000000', 'reception@dentcare.example', 'Africa/Cairo', 'ar-EG');

INSERT INTO business_settings
  (business_id, working_hours, coverage_areas, policies, intents, ticket_rules, report_config,
   default_reply_style, welcome_message, handoff_message, fallback_message,
   allow_ai_auto_reply, allow_ticket_creation, confidence_threshold)
SELECT id,
  '{"sat":["10:00","21:00"],"sun":["10:00","21:00"],"mon":["10:00","21:00"],"tue":["10:00","21:00"],"wed":["10:00","21:00"],"thu":["10:00","21:00"]}',
  '["التجمع الخامس","الرحاب","مدينتي"]',
  '{"cancellation":"برجاء إلغاء الحجز قبلها بـ 4 ساعات على الأقل"}',
  '["booking","doctor_question","working_hours"]',
  '{"create_ticket_when":["customer_requests_booking","human_requested"],
    "required_fields":["name","phone","preferred_date"],
    "default_priority":"medium",
    "confirm_before_create":true}',
  '{"sections":["new_customers","appointments_today","open_tickets"]}',
  'friendly_short',
  'أهلاً بيك في عيادة د. منى للأسنان 🦷 ممكن أساعدك في حجز كشف أو استفسار؟',
  'هوصلك بمكتب الاستقبال حالاً 🙏',
  'لو حابب تحجز اكتب "حجز" وهسألك على اليوم المناسب.',
  TRUE, TRUE, 0.65
FROM businesses WHERE name='عيادة د. منى للأسنان';

INSERT INTO services (business_id, name, description, category, price, price_visible, duration, needs_booking, needs_staff)
SELECT id, x.name, x.descr, x.cat, x.price::numeric, x.pv, x.dur, x.book, x.staff FROM businesses b,
(VALUES
  ('كشف','كشف وفحص أولي','exam',200,TRUE,'30 دقيقة',TRUE,TRUE),
  ('تنظيف جير','تنظيف وتلميع الأسنان','cleaning',500,TRUE,'45 دقيقة',TRUE,TRUE),
  ('حشو','حشو عصب أو تجميلي','treatment',NULL,FALSE,'45-60 دقيقة',TRUE,TRUE),
  ('تقويم','استشارة تقويم','ortho',300,TRUE,'30 دقيقة',TRUE,TRUE)
) AS x(name,descr,cat,price,pv,dur,book,staff)
WHERE b.name='عيادة د. منى للأسنان';

INSERT INTO knowledge_documents (business_id, title, category, content, source)
SELECT id, x.t, x.c, x.body, 'manual' FROM businesses b,
(VALUES
  ('مواعيد العيادة','faq','العيادة تعمل من السبت للخميس من 10 صباحاً حتى 9 مساءً. الجمعة إجازة.'),
  ('سعر الكشف','faq','سعر الكشف 200 جنيه ويشمل الفحص الأولي والاستشارة.'),
  ('سياسة الإلغاء','policy','برجاء إلغاء أو تعديل الحجز قبل الموعد بـ 4 ساعات على الأقل.'),
  ('خطوات الحجز','steps','للحجز نحتاج: الاسم، رقم الموبايل، واليوم والوقت المفضل، ونأكدلك الموعد.')
) AS x(t,c,body)
WHERE b.name='عيادة د. منى للأسنان';

INSERT INTO support_members (business_id, name, phone, role, area, channel)
SELECT id, 'مكتب الاستقبال', '+20100000010', 'agent', 'all', 'whatsapp'
FROM businesses WHERE name='عيادة د. منى للأسنان';

INSERT INTO integrations (business_id, integration_type, name, config, is_active)
SELECT id, 'whatsapp', 'WhatsApp Cloud',
  '{"phone_number_id":"100000000000002","waba_id":"200000000000002","access_token":"REPLACE_ME","verify_token":"clinic_verify","api_version":"v21.0"}', TRUE
FROM businesses WHERE name='عيادة د. منى للأسنان';

-- =============================================================================
-- BUSINESS 3 — RESTAURANT
-- =============================================================================
INSERT INTO businesses (name, business_type, description, phone, email, timezone, language)
VALUES ('مطعم بيت الكشري', 'restaurant', 'أكل مصري - كشري ومحاشي وطواجن - دليفري',
        '+20226000000', 'orders@beitkoshary.example', 'Africa/Cairo', 'ar-EG');

INSERT INTO business_settings
  (business_id, working_hours, coverage_areas, policies, intents, ticket_rules, report_config,
   default_reply_style, welcome_message, handoff_message, fallback_message,
   allow_ai_auto_reply, allow_ticket_creation, confidence_threshold)
SELECT id,
  '{"sat":["11:00","02:00"],"sun":["11:00","02:00"],"mon":["11:00","02:00"],"tue":["11:00","02:00"],"wed":["11:00","02:00"],"thu":["11:00","03:00"],"fri":["13:00","03:00"]}',
  '["المهندسين","الدقي","العجوزة","الزمالك"]',
  '{"delivery":"التوصيل خلال 45 دقيقة","min_order":"الحد الأدنى للطلب 60 جنيه"}',
  '["menu","order","delivery","complaint"]',
  '{"create_ticket_when":["customer_requests_order","customer_complaint","human_requested"],
    "required_fields":["name","phone","address","order_items"],
    "default_priority":"medium",
    "confirm_before_create":true}',
  '{"sections":["orders_today","top_items","complaints"]}',
  'friendly_short',
  'أهلاً بيك في بيت الكشري 🍚 تحب تطلب إيه النهاردة؟',
  'هوصلك بأحد زملائي لإتمام الطلب 🙏',
  'تقدر تشوف المنيو وتطلب، واكتب "موظف" لو محتاج مساعدة.',
  TRUE, TRUE, 0.65
FROM businesses WHERE name='مطعم بيت الكشري';

INSERT INTO services (business_id, name, description, category, price, price_visible, duration, needs_booking, needs_staff)
SELECT id, x.name, x.descr, x.cat, x.price::numeric, x.pv, x.dur, x.book, x.staff FROM businesses b,
(VALUES
  ('كشري وسط','طبق كشري حجم وسط','food',35,TRUE,NULL,FALSE,FALSE),
  ('كشري كبير','طبق كشري حجم كبير','food',50,TRUE,NULL,FALSE,FALSE),
  ('محشي كرنب','نص كيلو محشي كرنب','food',70,TRUE,NULL,FALSE,FALSE),
  ('توصيل','رسوم توصيل داخل المناطق المغطاة','delivery',15,TRUE,'45 دقيقة',FALSE,FALSE)
) AS x(name,descr,cat,price,pv,dur,book,staff)
WHERE b.name='مطعم بيت الكشري';

INSERT INTO knowledge_documents (business_id, title, category, content, source)
SELECT id, x.t, x.c, x.body, 'manual' FROM businesses b,
(VALUES
  ('المنيو','faq','عندنا كشري (وسط 35 / كبير 50)، محشي كرنب نص كيلو 70 جنيه، وطواجن. التوصيل 15 جنيه.'),
  ('مناطق التوصيل','faq','بنوصّل للمهندسين والدقي والعجوزة والزمالك خلال 45 دقيقة.'),
  ('الحد الأدنى للطلب','policy','الحد الأدنى للطلب 60 جنيه قبل رسوم التوصيل.')
) AS x(t,c,body)
WHERE b.name='مطعم بيت الكشري';

INSERT INTO support_members (business_id, name, phone, role, area, channel)
SELECT id, 'كاشير الطلبات', '+20100000020', 'agent', 'all', 'whatsapp'
FROM businesses WHERE name='مطعم بيت الكشري';

INSERT INTO integrations (business_id, integration_type, name, config, is_active)
SELECT id, 'whatsapp', 'WhatsApp Cloud',
  '{"phone_number_id":"100000000000003","waba_id":"200000000000003","access_token":"REPLACE_ME","verify_token":"resto_verify","api_version":"v21.0"}', TRUE
FROM businesses WHERE name='مطعم بيت الكشري';

-- =============================================================================
-- BUSINESS 4 — REAL ESTATE
-- =============================================================================
INSERT INTO businesses (name, business_type, description, phone, email, timezone, language)
VALUES ('عقارات النخبة', 'real_estate', 'بيع وإيجار شقق وفيلات في القاهرة الجديدة',
        '+20221000000', 'sales@elite-re.example', 'Africa/Cairo', 'ar-EG');

INSERT INTO business_settings
  (business_id, working_hours, coverage_areas, policies, intents, ticket_rules, report_config,
   default_reply_style, welcome_message, handoff_message, fallback_message,
   allow_ai_auto_reply, allow_ticket_creation, confidence_threshold)
SELECT id,
  '{"sat":["10:00","19:00"],"sun":["10:00","19:00"],"mon":["10:00","19:00"],"tue":["10:00","19:00"],"wed":["10:00","19:00"],"thu":["10:00","19:00"]}',
  '["التجمع الخامس","الشروق","مدينتي","العبور"]',
  '{"commission":"عمولة 2.5% على عمليات البيع"}',
  '["rent_request","sale_request","viewing_booking"]',
  '{"create_ticket_when":["customer_requests_booking","rent_request","sale_request","human_requested"],
    "required_fields":["name","phone","area","budget"],
    "default_priority":"medium",
    "confirm_before_create":false}',
  '{"sections":["new_leads","viewings","top_areas"]}',
  'professional_short',
  'أهلاً بك في عقارات النخبة 🏢 بتدور على إيجار ولا تمليك؟',
  'هحوّلك لأحد مستشاري العقارات لدينا 🙏',
  'اكتب "إيجار" أو "تمليك" ووضّح المنطقة والميزانية وهساعدك.',
  TRUE, TRUE, 0.65
FROM businesses WHERE name='عقارات النخبة';

INSERT INTO services (business_id, name, description, category, price, price_visible, duration, needs_booking, needs_staff)
SELECT id, x.name, x.descr, x.cat, x.price::numeric, x.pv, x.dur, x.book, x.staff FROM businesses b,
(VALUES
  ('معاينة عقار','حجز موعد لمعاينة وحدة','viewing',NULL,FALSE,'1 ساعة',TRUE,TRUE),
  ('شقة للإيجار','شقق إيجار في التجمع','rent',NULL,FALSE,NULL,FALSE,TRUE),
  ('شقة للبيع','شقق تمليك في التجمع','sale',NULL,FALSE,NULL,FALSE,TRUE)
) AS x(name,descr,cat,price,pv,dur,book,staff)
WHERE b.name='عقارات النخبة';

INSERT INTO knowledge_documents (business_id, title, category, content, source)
SELECT id, x.t, x.c, x.body, 'manual' FROM businesses b,
(VALUES
  ('المناطق المتاحة','faq','بنشتغل في التجمع الخامس والشروق ومدينتي والعبور، إيجار وتمليك.'),
  ('العمولة','policy','عمولة المكتب 2.5% على عمليات البيع، وشهر على الإيجار السنوي.'),
  ('خطوات المعاينة','steps','للمعاينة نحتاج: الاسم، الموبايل، المنطقة، الميزانية، ونحدد معاد مع المستشار.')
) AS x(t,c,body)
WHERE b.name='عقارات النخبة';

INSERT INTO support_members (business_id, name, phone, role, area, channel)
SELECT id, 'م. كريم - مستشار', '+20100000030', 'agent', 'التجمع الخامس', 'whatsapp'
FROM businesses WHERE name='عقارات النخبة';

INSERT INTO integrations (business_id, integration_type, name, config, is_active)
SELECT id, 'whatsapp', 'WhatsApp Cloud',
  '{"phone_number_id":"100000000000004","waba_id":"200000000000004","access_token":"REPLACE_ME","verify_token":"realestate_verify","api_version":"v21.0"}', TRUE
FROM businesses WHERE name='عقارات النخبة';

-- =============================================================================
-- BUSINESS 5 — MAINTENANCE SHOP
-- =============================================================================
INSERT INTO businesses (name, business_type, description, phone, email, timezone, language)
VALUES ('فيكس لاب لصيانة الموبايل', 'maintenance', 'صيانة موبايلات ولابتوب - تغيير شاشات وبطاريات',
        '+20225000000', 'fix@fixlab.example', 'Africa/Cairo', 'ar-EG');

INSERT INTO business_settings
  (business_id, working_hours, coverage_areas, policies, intents, ticket_rules, report_config,
   default_reply_style, welcome_message, handoff_message, fallback_message,
   allow_ai_auto_reply, allow_ticket_creation, confidence_threshold)
SELECT id,
  '{"sat":["11:00","22:00"],"sun":["11:00","22:00"],"mon":["11:00","22:00"],"tue":["11:00","22:00"],"wed":["11:00","22:00"],"thu":["11:00","22:00"]}',
  '["وسط البلد","العتبة","الجيزة"]',
  '{"warranty":"ضمان 3 شهور على قطع الغيار","diagnosis":"الكشف مجاني"}',
  '["repair_request","price_question","pickup_request"]',
  '{"create_ticket_when":["repair_request","customer_complaint","human_requested"],
    "required_fields":["device_type","issue","phone"],
    "default_priority":"medium",
    "confirm_before_create":true}',
  '{"sections":["open_repairs","top_devices","ready_for_pickup"]}',
  'friendly_short',
  'أهلاً بيك في فيكس لاب 🔧 جهازك فيه إيه ونشوفلك حل؟',
  'هوصلك بأحد الفنيين 🙏',
  'قوللي نوع الجهاز والعطل وهقولك السعر والمدة.',
  TRUE, TRUE, 0.65
FROM businesses WHERE name='فيكس لاب لصيانة الموبايل';

INSERT INTO services (business_id, name, description, category, price, price_visible, duration, needs_booking, needs_staff)
SELECT id, x.name, x.descr, x.cat, x.price::numeric, x.pv, x.dur, x.book, x.staff FROM businesses b,
(VALUES
  ('تغيير شاشة','تغيير شاشة موبايل حسب الموديل','repair',NULL,FALSE,'2-4 ساعات',FALSE,TRUE),
  ('تغيير بطارية','استبدال بطارية','repair',350,TRUE,'1 ساعة',FALSE,TRUE),
  ('كشف عطل','تشخيص العطل','diagnosis',0,TRUE,'30 دقيقة',FALSE,TRUE)
) AS x(name,descr,cat,price,pv,dur,book,staff)
WHERE b.name='فيكس لاب لصيانة الموبايل';

INSERT INTO knowledge_documents (business_id, title, category, content, source)
SELECT id, x.t, x.c, x.body, 'manual' FROM businesses b,
(VALUES
  ('الكشف مجاني','faq','الكشف على الجهاز مجاني، وبنقولك السعر قبل أي إصلاح.'),
  ('الضمان','policy','ضمان 3 شهور على قطع الغيار المستبدلة.'),
  ('تغيير البطارية','service_desc','تغيير البطارية بـ 350 جنيه وبياخد حوالي ساعة.')
) AS x(t,c,body)
WHERE b.name='فيكس لاب لصيانة الموبايل';

INSERT INTO support_members (business_id, name, phone, role, area, channel)
SELECT id, 'أسطى محمود', '+20100000040', 'technician', 'وسط البلد', 'whatsapp'
FROM businesses WHERE name='فيكس لاب لصيانة الموبايل';

INSERT INTO integrations (business_id, integration_type, name, config, is_active)
SELECT id, 'whatsapp', 'WhatsApp Cloud',
  '{"phone_number_id":"100000000000005","waba_id":"200000000000005","access_token":"REPLACE_ME","verify_token":"fixlab_verify","api_version":"v21.0"}', TRUE
FROM businesses WHERE name='فيكس لاب لصيانة الموبايل';

-- =============================================================================
-- A FEW DEMO CUSTOMERS + ONE SAMPLE TICKET (internet) so the dashboard isn't empty
-- =============================================================================
INSERT INTO customers (business_id, phone, name, area, status, memory_summary)
SELECT id, '+201111111111', 'محمد علي', 'مدينة نصر', 'active',
       'عميل باقة 50 ميجا، اشتكى قبل كده من بطء السرعة وتم الحل.'
FROM businesses WHERE name='SpeedNet ADSL';

INSERT INTO customers (business_id, phone, name, area, status)
SELECT id, '+201222222222', 'منى حسن', 'التجمع الخامس', 'new'
FROM businesses WHERE name='عيادة د. منى للأسنان';

-- sample open ticket for the internet business
INSERT INTO tickets (business_id, customer_id, ticket_code, ticket_type, issue_type, priority, status, summary, ai_diagnosis, fields)
SELECT b.id, c.id, generate_ticket_code(b.id), 'maintenance', 'no_internet', 'high', 'open',
       'العميل النت قاطع عنده من الصبح', 'يرجّح مشكلة في خط DSL، يحتاج زيارة فني',
       '{"username":"mohamed_ns","phone":"+201111111111","area":"مدينة نصر"}'
FROM businesses b
JOIN customers c ON c.business_id=b.id AND c.phone='+201111111111'
WHERE b.name='SpeedNet ADSL';

INSERT INTO ticket_events (business_id, ticket_id, event_type, note, created_by)
SELECT t.business_id, t.id, 'created', 'تم إنشاء التذكرة تلقائياً من البوت', 'system'
FROM tickets t WHERE t.ticket_code LIKE 'BUS-%' LIMIT 1;

-- Default admin user (MVP). Password hash below = bcrypt of "admin123" — CHANGE IT.
INSERT INTO admin_users (business_id, email, password_hash, role)
SELECT id, 'admin@speednet.example', '$2b$10$RMt0zjaHpgmIZA1VDr4ZDOeGFcDCn82uASSHscfzCymA5fcCMh3bu', 'owner'
FROM businesses WHERE name='SpeedNet ADSL';

-- Done. 5 businesses, settings, services, knowledge, support, integrations,
-- demo customers, one ticket. Knowledge embeddings are generated on first
-- ingestion run (embedding_status='pending').
