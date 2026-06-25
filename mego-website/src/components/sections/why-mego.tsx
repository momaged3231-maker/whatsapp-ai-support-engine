import {
  Tag,
  ReceiptText,
  MessageCircleHeart,
  MapPin,
  Users,
  Boxes,
} from "lucide-react";
import SectionHeading from "@/components/sections/section-heading";

const POINTS = [
  { icon: Tag, title: "سعر قبل التنفيذ" },
  { icon: ReceiptText, title: "إيصال استلام" },
  { icon: MessageCircleHeart, title: "متابعة واتساب" },
  { icon: MapPin, title: "خدمة محلية داخل جمصة" },
  { icon: Users, title: "مناسب للأفراد والمحلات" },
  { icon: Boxes, title: "حلول تقنية ودعائية في مكان واحد" },
];

export default function WhyMego() {
  return (
    <section className="section-padding bg-mego-navy-light">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title="ليه ميجو؟" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((point) => (
            <div
              key={point.title}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-mego-navy px-5 py-5"
            >
              <point.icon className="h-6 w-6 shrink-0 text-mego-yellow" />
              <span className="font-bold text-white">{point.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
