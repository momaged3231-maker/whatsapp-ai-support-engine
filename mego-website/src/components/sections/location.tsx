import { MessageCircle, Phone } from "lucide-react";
import SectionHeading from "@/components/sections/section-heading";
import { BRAND, buildWhatsAppLink } from "@/lib/constants";

export default function Location() {
  return (
    <section className="section-padding bg-mego-navy">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeading title="موقعنا" subtitle={`ميجو — ${BRAND.location}`} />

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title="موقع ميجو على الخريطة - جمصة"
            src="https://www.google.com/maps?q=جمصة+مسجد+السلام&output=embed"
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={buildWhatsAppLink("أهلاً ميجو، عايز أعرف العنوان بالتفصيل.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-base font-bold text-white sm:w-auto"
          >
            <MessageCircle className="h-5 w-5" />
            واتساب
          </a>
          <a
            href={`tel:${BRAND.phone}`}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-mego-cyan px-6 py-3 text-base font-bold text-mego-cyan sm:w-auto"
          >
            <Phone className="h-5 w-5" />
            اتصل الآن
          </a>
        </div>
      </div>
    </section>
  );
}
