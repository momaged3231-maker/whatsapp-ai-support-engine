import type {
  OrderStatus,
  PrintJobStatus,
  SubscriptionStatus,
  FollowupStatus,
  CustomerType,
  CustomerSource,
  DeviceType,
  ServiceCategory,
  ExpenseCategory,
  PaymentMethod,
  OrderPriority,
} from "@/lib/database.types";

type Tone = "slate" | "blue" | "green" | "orange" | "red" | "cyan" | "navy";

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: "جديد",
  checking: "قيد الفحص",
  waiting_customer_approval: "في انتظار موافقة العميل",
  waiting_part: "في انتظار قطعة غيار",
  in_progress: "قيد التنفيذ",
  ready: "جاهز للتسليم",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export const orderStatusTones: Record<OrderStatus, Tone> = {
  new: "blue",
  checking: "cyan",
  waiting_customer_approval: "orange",
  waiting_part: "orange",
  in_progress: "blue",
  ready: "green",
  delivered: "slate",
  cancelled: "red",
};

export const orderPriorityLabels: Record<OrderPriority, string> = {
  normal: "عادي",
  urgent: "عاجل",
};

export const printJobStatusLabels: Record<PrintJobStatus, string> = {
  new: "جديد",
  in_progress: "قيد التنفيذ",
  ready: "جاهز للتسليم",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export const printJobStatusTones: Record<PrintJobStatus, Tone> = {
  new: "blue",
  in_progress: "cyan",
  ready: "green",
  delivered: "slate",
  cancelled: "red",
};

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  active: "نشط",
  paused: "متوقف مؤقتًا",
  cancelled: "ملغي",
  expired: "منتهي",
};

export const subscriptionStatusTones: Record<SubscriptionStatus, Tone> = {
  active: "green",
  paused: "orange",
  cancelled: "red",
  expired: "slate",
};

export const followupStatusLabels: Record<FollowupStatus, string> = {
  pending: "قيد الانتظار",
  done: "تم",
  cancelled: "ملغي",
};

export const followupStatusTones: Record<FollowupStatus, Tone> = {
  pending: "orange",
  done: "green",
  cancelled: "red",
};

export const customerTypeLabels: Record<CustomerType, string> = {
  individual: "فرد",
  student: "طالب",
  business: "محل/شركة",
  real_estate: "عقارات",
};

export const customerSourceLabels: Record<CustomerSource, string> = {
  walk_in: "زيارة مباشرة",
  facebook: "فيسبوك",
  whatsapp: "واتساب",
  referral: "توصية",
  other: "أخرى",
};

export const deviceTypeLabels: Record<DeviceType, string> = {
  laptop: "لاب توب",
  pc: "كمبيوتر مكتبي",
  mobile: "موبايل",
  receiver: "ريسيفر",
  printer: "طابعة",
  router: "راوتر",
  camera: "كاميرا",
  other: "أخرى",
};

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  repair: "صيانة",
  printing: "طباعة",
  student: "خدمات طلاب",
  business: "خدمات تجارية",
  cctv: "كاميرات مراقبة",
  network: "شبكات",
  receiver: "ريسيفر",
  ads: "إعلانات",
  signage: "بانرات ويافطات",
  accessory: "إكسسوارات",
  other: "أخرى",
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  rent: "إيجار",
  tools: "أدوات",
  paint: "خامات/طلاء",
  electricity: "كهرباء",
  internet: "إنترنت",
  ads: "إعلانات",
  stock: "مخزون",
  transport: "نقل وتوصيل",
  other: "أخرى",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "كاش",
  instapay: "إنستاباي",
  vodafone_cash: "فودافون كاش",
  bank: "تحويل بنكي",
  other: "أخرى",
};
