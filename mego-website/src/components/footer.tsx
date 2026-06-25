import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { BRAND, SERVICES, buildWhatsAppLink } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-mego-navy">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="text-2xl font-extrabold text-white">ميجو</h3>
          <p className="mt-2 text-sm text-white/70">{BRAND.slogan}</p>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mego-cyan" />
              {BRAND.location}
            </p>
            <a
              href={`tel:${BRAND.phone}`}
              className="flex items-center gap-2 hover:text-mego-cyan"
            >
              <Phone className="h-4 w-4 text-mego-cyan" />
              {BRAND.phone}
            </a>
            <a
              href={buildWhatsAppLink(`أهلاً ميجو، عندي استفسار.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-mego-cyan"
            >
              <MessageCircle className="h-4 w-4 text-mego-cyan" />
              واتساب
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white">الخدمات</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link href="/services" className="hover:text-mego-cyan">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white">خدمات إضافية</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {SERVICES.slice(6).map((s) => (
              <li key={s.slug}>
                <Link href="/services" className="hover:text-mego-cyan">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white">روابط سريعة</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/business" className="hover:text-mego-cyan">
                خدمات المحلات والأنشطة
              </Link>
            </li>
            <li>
              <Link href="/printing-ads" className="hover:text-mego-cyan">
                دعاية وطباعة
              </Link>
            </li>
            <li>
              <Link href="/request" className="hover:text-mego-cyan">
                اطلب خدمة الآن
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} ميجو — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
