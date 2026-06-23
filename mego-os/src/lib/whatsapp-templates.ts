export function orderReceivedMessage(orderNo: string) {
  return `أهلاً يا فندم، تم استلام جهازك في ميجو برقم طلب: ${orderNo}. هنفحص الجهاز ونبلغك بالتكلفة قبل التنفيذ.`;
}

export function orderApprovalMessage(problem: string, price: number) {
  return `تم فحص الجهاز يا فندم. المطلوب: ${problem}. التكلفة المتوقعة: ${price} جنيه. نبدأ التنفيذ؟`;
}

export function orderReadyMessage(orderNo: string, remaining: number) {
  return `جهازك جاهز للاستلام يا فندم. رقم الطلب: ${orderNo}. المتبقي: ${remaining} جنيه.`;
}

export function orderDeliveredMessage() {
  return `شكرًا لتعاملك مع ميجو. نتمنى تكون الخدمة عجبت حضرتك. خدمتك في مكان واحد.`;
}

export function subscriptionRenewalMessage(businessName: string, price: number, renewalDate: string) {
  return `أهلاً يا فندم، تذكير بتجديد اشتراك ${businessName} الشهري مع ميجو بقيمة ${price} جنيه. تاريخ التجديد: ${renewalDate}. خدمتك في مكان واحد.`;
}

export function followupReminderMessage(title: string) {
  return `أهلاً يا فندم، ده تذكير بخصوص: ${title}. لو محتاج أي مساعدة إحنا في خدمتك. خدمتك في مكان واحد.`;
}

export function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("20") ? digits : `20${digits.replace(/^0/, "")}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}
