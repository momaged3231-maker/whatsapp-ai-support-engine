import Link from "next/link";
import {
  MessageSquare,
  MapPinned,
  Camera,
  Printer,
  Megaphone,
  QrCode,
  Headset,
} from "lucide-react";
import SectionHeading from "@/components/sections/section-heading";

const BUSINESS_CARDS = [
  { icon: MessageSquare, title: "واتساب بيزنس" },
  { icon: MapPinned, title: "Google Maps" },
  { icon: Camera, title: "كاميرات وشبكات" },
  { icon: Printer, title: "طابعة وراوتر" },
  { icon: Megaphone, title: "إعلانات ممولة" },
  { icon: QrCode, title: "تصميم منيو وQR" },
  { icon: Headset, title: "دعم تقني شهري" },
];

export default function BusinessServices() {
  return (
    <section id="business" className="section-padding bg-mego-navy-light">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          title="خدمات للمحلات والأنشطة التجارية"
          subtitle="حلول متكاملة للمحلات، العيادات، المطاعم، الكافيهات، والمكاتب العقارية"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {BUSINESS_CARDS.map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-mego-navy px-4 py-6 text-center"
            >
              <card.icon className="h-7 w-7 text-mego-cyan" />
              <span className="text-sm font-bold text-white">
                {card.title}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/business"
            className="rounded-full bg-mego-blue px-8 py-4 text-lg font-extrabold text-white shadow-lg shadow-mego-blue/30 transition hover:bg-mego-cyan"
          >
            اطلب فحص نشاطك
          </Link>
        </div>
      </div>
    </section>
  );
}
