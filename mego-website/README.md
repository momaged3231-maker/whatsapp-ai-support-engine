# ميجو — Mego Website

موقع تسويقي ولايدچن (lead generation) لمحل خدمات ميجو في جمصة — صيانة كمبيوتر
وموبايل، كاميرات وشبكات، طباعة ودعاية، وخدمات للمحلات والأنشطة التجارية.

الموقع مبني بـ Next.js (App Router) + TypeScript + Tailwind CSS، باللغة
العربية وتنسيق RTL بالكامل، وموجّه أساسًا لتحويل الزائر لطلب خدمة أو رسالة
واتساب.

## المميزات

- صفحة رئيسية كاملة (Hero، الخدمات، نموذج طلب خدمة، صيانة منزلية/محلات،
  خدمات المحلات، دعاية وطباعة، ليه ميجو، الموقع، أسئلة شائعة).
- صفحات: `/services`, `/business`, `/printing-ads`, `/request`.
- نموذج طلب خدمة يفتح واتساب برسالة جاهزة بكل تفاصيل الطلب، وفي نفس الوقت
  يحفظ الطلب في Supabase لو تم تفعيله.
- صفحة إدارة `/admin/requests` لعرض الطلبات، الفلترة، البحث، تغيير الحالة،
  ونسخ رسالة رد جاهزة — محمية بكلمة مرور.
- SEO جاهز: metadata بالعربي، `sitemap.xml`, `robots.txt`.
- تصميم متجاوب (mobile-first) بألوان البراند (كحلي/أزرق/سماوي/أصفر).

## التشغيل محليًا

```bash
npm install
cp .env.example .env.local   # عبّي القيم المطلوبة (اختياري لو هتستخدم Supabase)
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

أوامر أخرى:

```bash
npm run build   # بناء النسخة النهائية
npm run start   # تشغيل النسخة المبنية
npm run lint    # فحص الكود
```

## متغيرات البيئة

شوف `.env.example` للتفاصيل الكاملة. أهم المتغيرات:

| المتغير                       | الوصف                                                          |
| ------------------------------ | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | رابط الموقع المنشور، يستخدم في SEO و sitemap                    |
| `NEXT_PUBLIC_SUPABASE_URL`     | رابط مشروع Supabase (اختياري)                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| مفتاح Supabase العام (اختياري)                                  |
| `SUPABASE_SERVICE_ROLE_KEY`    | مفتاح Supabase السري — يُستخدم سيرفر سايد فقط لحفظ/قراءة الطلبات |
| `ADMIN_PASSWORD`               | كلمة مرور صفحة `/admin/requests`                                 |

> لو متغيرات Supabase فاضية، نموذج طلب الخدمة هيفضل يعمل بشكل كامل عن طريق
> واتساب فقط (بدون حفظ في قاعدة بيانات)، وصفحة `/admin/requests` هتظهر رسالة
> توضح إن Supabase غير مفعل.

## إعداد Supabase (اختياري)

1. أنشئ مشروع جديد على [supabase.com](https://supabase.com).
2. شغّل محتوى `supabase/schema.sql` في SQL Editor — هيعمل جدول
   `service_requests` مع RLS policies مناسبة.
3. هات القيم من **Settings → API** وضعها في `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (مفتاح سري — لا تشاركه أبدًا)
4. حدّد `ADMIN_PASSWORD` بكلمة مرور قوية للدخول على `/admin/requests`.

## رفع المشروع على GitHub

```bash
git init
git add .
git commit -m "Initial Mego website"
git branch -M main
git remote add origin <repo-url>
git push -u origin main
```

## النشر على Vercel

1. ادخل [vercel.com/new](https://vercel.com/new) واختر الريبو.
2. لو الموقع جوه مونوريبو، حدد **Root Directory** = `mego-website`.
3. ضيف متغيرات البيئة من `.env.example` في إعدادات المشروع على Vercel.
4. اضغط Deploy.

## بنية المشروع

```
src/
  app/                    صفحات Next.js (App Router)
    page.tsx              الصفحة الرئيسية
    services/             صفحة كل الخدمات
    business/              صفحة خدمات المحلات
    printing-ads/          صفحة الدعاية والطباعة
    request/               صفحة طلب خدمة
    admin/requests/        صفحة إدارة الطلبات (محمية)
    api/requests/          استقبال طلبات الخدمة (حفظ في Supabase لو مفعّل)
    api/admin/             تسجيل دخول/خروج الإدارة وتحديث حالة الطلب
  components/             عناصر واجهة قابلة لإعادة الاستخدام
  lib/                    ثوابت البراند، عميل Supabase، أدوات مساعدة
supabase/schema.sql        SQL لإنشاء جدول service_requests
```

## تحسينات مستقبلية (V2)

- رفع الصور المرفقة في نموذج الطلب إلى Supabase Storage بدل تجاهلها.
- إشعارات تلقائية (واتساب/إيميل) للإدارة عند وصول طلب جديد.
- تسجيل دخول إدارة حقيقي عبر Supabase Auth بدل كلمة مرور واحدة.
- صفحة "قبل وبعد" لأعمال الصيانة والدعاية والطباعة.
- تقييمات وآراء العملاء.
- دعم تعدد اللغات (عربي/إنجليزي) لو احتاج النشاط ده مستقبلًا.
