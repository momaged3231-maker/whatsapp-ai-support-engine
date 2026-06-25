import Link from "next/link";
import { Home, Store } from "lucide-react";

export default function Maintenance() {
  return (
    <section className="section-padding bg-mego-navy-light">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white md:text-4xl">
          خدمة زيارة منزلية أو زيارة محل
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/80 md:text-lg">
          لو عندك مشكلة في الكمبيوتر، الراوتر، الطابعة، الكاميرات، الريسيفر أو
          الشبكة، ابعت طلبك وهنحدد أقرب معاد مناسب داخل جمصة.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-mego-navy px-5 py-4 text-right">
            <Home className="h-6 w-6 shrink-0 text-mego-cyan" />
            <span className="text-sm font-bold text-white">زيارة منزلية</span>
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-mego-navy px-5 py-4 text-right">
            <Store className="h-6 w-6 shrink-0 text-mego-cyan" />
            <span className="text-sm font-bold text-white">زيارة محل</span>
          </div>
        </div>

        <p className="mt-6 inline-block rounded-full bg-mego-yellow/15 px-5 py-2 text-sm font-bold text-mego-yellow">
          السعر النهائي يتم تحديده قبل التنفيذ حسب الحالة.
        </p>

        <div className="mt-8">
          <Link
            href="/request"
            className="rounded-full bg-mego-blue px-8 py-4 text-lg font-extrabold text-white shadow-lg shadow-mego-blue/30 transition hover:bg-mego-cyan"
          >
            اطلب زيارة الآن
          </Link>
        </div>
      </div>
    </section>
  );
}
