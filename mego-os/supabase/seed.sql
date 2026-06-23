-- Mego OS — seed data
-- Run after schema.sql. Safe to re-run (uses upsert-style guards).

insert into settings (id, shop_name, phone, whatsapp, address, slogan, receipt_footer)
values (
  1,
  'ميجو',
  '01095477307',
  '01095477307',
  'جمصة — بجوار مسجد السلام',
  'خدمتك في مكان واحد',
  'شكرًا لتعاملك مع ميجو. المحل غير مسؤول عن أي بيانات غير مذكور تسليمها أو نسخها احتياطيًا.'
)
on conflict (id) do update set
  shop_name = excluded.shop_name,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  address = excluded.address,
  slogan = excluded.slogan,
  receipt_footer = excluded.receipt_footer;

insert into services (name, category, starting_price, description, is_active)
select * from (values
  ('صيانة كمبيوتر ولاب توب', 'repair'::service_category, 250::numeric, 'فحص وصيانة أجهزة الكمبيوتر واللاب توب', true),
  ('خدمات موبايل وسوفت وير', 'repair'::service_category, 150::numeric, 'صيانة موبايل وتثبيت برامج وأنظمة', true),
  ('صيانة ريسيفر ودش', 'receiver'::service_category, 150::numeric, 'صيانة وضبط أجهزة الريسيفر والدش', true),
  ('شبكات وراوتر', 'network'::service_category, 200::numeric, 'تمديد وإعداد شبكات وراوترات', true),
  ('كاميرات مراقبة', 'cctv'::service_category, null, 'تركيب وصيانة كاميرات المراقبة - حسب المعاينة', true),
  ('طباعة وتصوير', 'printing'::service_category, null, 'طباعة وتصوير وخدمات مستندات - حسب الخدمة', true),
  ('خدمات طلاب', 'student'::service_category, null, 'بحوث، تنسيق، طباعة أبحاث الطلاب', true),
  ('واتساب بيزنس للمحلات', 'business'::service_category, 200::numeric, 'إعداد واتساب بيزنس للمحلات والشركات', true),
  ('إعلانات ممولة', 'ads'::service_category, 300::numeric, 'إدارة وتشغيل إعلانات ممولة', true),
  ('بانرات ويافطات', 'signage'::service_category, null, 'تصميم وطباعة بانرات ويافطات - حسب المقاس', true),
  ('إكسسوارات خفيفة', 'accessory'::service_category, null, 'إكسسوارات موبايل وكمبيوتر خفيفة', true),
  ('دعم تقني للمحلات', 'business'::service_category, 200::numeric, 'دعم تقني شهري للمحلات - زيارة دورية', true)
) as v(name, category, starting_price, description, is_active)
where not exists (select 1 from services s where s.name = v.name);
