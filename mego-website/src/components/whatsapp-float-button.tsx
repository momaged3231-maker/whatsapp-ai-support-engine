import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/constants";

export default function WhatsAppFloatButton() {
  return (
    <a
      href={buildWhatsAppLink("أهلاً ميجو، محتاج خدمة.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا على واتساب"
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/30 transition hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
