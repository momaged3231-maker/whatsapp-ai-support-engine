import ServiceCard from "@/components/service-card";
import SectionHeading from "@/components/sections/section-heading";
import { SERVICES } from "@/lib/constants";

export default function ServicesGrid({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  return (
    <section id="services" className="section-padding bg-mego-navy">
      <div className="mx-auto max-w-6xl px-4">
        {showHeading && (
          <SectionHeading
            title="خدمات ميجو"
            subtitle="كل ما تحتاجه من صيانة وتقنية ودعاية في مكان واحد"
          />
        )}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
