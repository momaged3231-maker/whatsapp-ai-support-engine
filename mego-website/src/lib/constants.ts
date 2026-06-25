export const BRAND = {
  name: "ميجو",
  slogan: "خدمتك في مكان واحد",
  location: "جمصة — بجوار مسجد السلام",
  phone: "01095477307",
  phoneIntl: "201095477307",
  whatsappBase: "https://wa.me/201095477307",
};

export function buildWhatsAppLink(message: string) {
  return `${BRAND.whatsappBase}?text=${encodeURIComponent(message)}`;
}

export type ServiceItem = {
  slug: string;
  title: string;
  description: string;
  icon: string;
};

export const SERVICES: ServiceItem[] = [
  {
    slug: "computer-repair",
    title: "صيانة كمبيوتر ولاب توب",
    description: "أعطال هارد وير وسوفت وير، تهنيج، فورمات، وتركيب برامج.",
    icon: "Laptop",
  },
  {
    slug: "mobile-software",
    title: "خدمات موبايل وسوفت وير",
    description: "حل مشاكل السوفت وير، فورمات، ونقل بيانات للموبايل.",
    icon: "Smartphone",
  },
  {
    slug: "receiver-dish",
    title: "صيانة ريسيفر ودش",
    description: "ضبط وتعليق الدش وحل مشاكل الريسيفر والقنوات.",
    icon: "Satellite",
  },
  {
    slug: "cctv",
    title: "كاميرات مراقبة",
    description: "تركيب وصيانة كاميرات مراقبة للمنازل والمحلات.",
    icon: "Camera",
  },
  {
    slug: "networks",
    title: "شبكات وراوتر",
    description: "تمديد شبكات، ضبط راوتر، وتقوية تغطية الواي فاي.",
    icon: "Wifi",
  },
  {
    slug: "printing",
    title: "طباعة وتصوير",
    description: "طباعة وتصوير مستندات بجودة عالية وأسعار مناسبة.",
    icon: "Printer",
  },
  {
    slug: "students",
    title: "خدمات طلاب",
    description: "طباعة أبحاث وتصوير ومذكرات بأسعار خاصة للطلاب.",
    icon: "GraduationCap",
  },
  {
    slug: "business-services",
    title: "خدمات محلات وأنشطة",
    description: "حلول تقنية متكاملة للمحلات والعيادات والمطاعم.",
    icon: "Store",
  },
  {
    slug: "ads",
    title: "إعلانات ممولة وتسويق",
    description: "إدارة وتشغيل إعلانات ممولة على فيسبوك وإنستجرام.",
    icon: "Megaphone",
  },
  {
    slug: "websites",
    title: "تصميم مواقع وصفحات هبوط",
    description: "موقع أو صفحة هبوط تجيبلك طلبات وعملاء جدد.",
    icon: "Globe",
  },
  {
    slug: "signage",
    title: "يافطات وبانرات وLED",
    description: "يافطات، بانرات، رول أب، كلادينج، وإضاءة LED.",
    icon: "Signpost",
  },
  {
    slug: "accessories",
    title: "إكسسوارات تقنية خفيفة",
    description: "سماعات، كابلات، باور بانك، وإكسسوارات موبايل وكمبيوتر.",
    icon: "Cable",
  },
];

export const CUSTOMER_TYPES = [
  "فرد",
  "طالب",
  "محل",
  "عيادة",
  "مطعم",
  "صيدلية",
  "نشاط تجاري",
] as const;

export const SERVICE_PLACES = [
  "في المحل",
  "زيارة منزلية",
  "زيارة محل",
  "أونلاين",
] as const;

export const REQUEST_STATUSES = [
  { value: "new", label: "جديد" },
  { value: "contacted", label: "تم التواصل" },
  { value: "booked", label: "تم الحجز" },
  { value: "done", label: "تم التنفيذ" },
  { value: "cancelled", label: "ملغي" },
] as const;
