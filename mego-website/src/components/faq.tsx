"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "هل يوجد زيارة منزلية؟",
    a: "أيوه، تقدر تطلب زيارة منزلية أو زيارة محل داخل جمصة من خلال نموذج الطلب أو واتساب.",
  },
  {
    q: "هل السعر ثابت؟",
    a: "السعر يختلف حسب نوع المشكلة والخدمة، وبنوضحلك السعر النهائي قبل البدء في التنفيذ.",
  },
  {
    q: "هل يتم تحديد السعر قبل التنفيذ؟",
    a: "أيوه، السعر النهائي يتم تحديده بعد معاينة الحالة وقبل التنفيذ مباشرة، عشان ما يكون فيه أي مفاجآت.",
  },
  {
    q: "هل تقدمون خدمات للمحلات؟",
    a: "أيوه، عندنا خدمات متكاملة للمحلات والعيادات والمطاعم والصيدليات: كاميرات، شبكات، طابعات، واتساب بيزنس، إعلانات، ودعم تقني شهري.",
  },
  {
    q: "هل يوجد طباعة ويافطات؟",
    a: "أيوه، بنقدم طباعة وتصوير، يافطات، بانرات، رول أب، فليكس، كلادينج، استيكرات، وكروت شخصية.",
  },
  {
    q: "هل يمكن طلب الخدمة واتساب؟",
    a: "بالتأكيد، تقدر تبعت طلبك مباشرة على واتساب وهنرد عليك بأقرب وقت.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-mego-navy-light">
      {FAQS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q}>
            <button
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-right"
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span className="font-bold text-white">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-mego-cyan transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <p className="px-5 pb-4 text-sm leading-relaxed text-white/70">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
