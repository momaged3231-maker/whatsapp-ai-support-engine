import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ICON_MAP } from "@/components/icon-map";
import type { ServiceItem } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/constants";

export default function ServiceCard({ service }: { service: ServiceItem }) {
  const Icon = ICON_MAP[service.icon];

  return (
    <div className="group flex flex-col rounded-2xl border border-white/10 bg-mego-navy-light p-6 transition hover:border-mego-cyan/50 hover:shadow-lg hover:shadow-mego-cyan/10">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mego-blue/15 text-mego-cyan">
        {Icon ? <Icon className="h-6 w-6" /> : null}
      </div>
      <h3 className="text-lg font-bold text-white">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">
        {service.description}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Link
          href={`/request?service=${encodeURIComponent(service.title)}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-mego-cyan transition group-hover:gap-2"
        >
          اطلب الخدمة
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <a
          href={buildWhatsAppLink(
            `أهلاً ميجو، محتاج خدمة "${service.title}".`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white/50 hover:text-white"
        >
          واتساب
        </a>
      </div>
    </div>
  );
}
