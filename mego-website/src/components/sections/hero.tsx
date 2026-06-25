import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/constants";

const TRUST_POINTS = [
  "سعر واضح قبل التنفيذ",
  "خدمة داخل جمصة",
  "دعم للأفراد والمحلات",
  "بجوار مسجد السلام",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-mego-navy">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(0,180,216,0.18),_transparent_55%)]" />
      <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
          <span className="text-white">ميجو</span>{" "}
          <span className="gradient-text">— خدمتك في مكان واحد</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 md:text-lg">
          صيانة، طباعة، كاميرات، شبكات، إعلانات، مواقع وخدمات محلات داخل جمصة.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/request"
            className="w-full rounded-full bg-mego-blue px-8 py-4 text-lg font-extrabold text-white shadow-lg shadow-mego-blue/30 transition hover:bg-mego-cyan sm:w-auto"
          >
            اطلب خدمة الآن
          </Link>
          <a
            href={buildWhatsAppLink("أهلاً ميجو، محتاج خدمة.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] px-8 py-4 text-lg font-extrabold text-[#25D366] transition hover:bg-[#25D366] hover:text-white sm:w-auto"
          >
            <MessageCircle className="h-5 w-5" />
            كلمنا واتساب
          </a>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 text-right md:grid-cols-4">
          {TRUST_POINTS.map((point) => (
            <div
              key={point}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-mego-yellow" />
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
