import RequestForm from "@/components/request-form";
import SectionHeading from "@/components/sections/section-heading";

export default function RequestSection({
  defaultService,
}: {
  defaultService?: string;
}) {
  return (
    <section id="request" className="section-padding bg-mego-navy">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading
          title="اطلب خدمة من ميجو"
          subtitle="ابعت طلبك وهنقولك الحل والسعر قبل التنفيذ"
        />
        <div className="mt-10">
          <RequestForm defaultService={defaultService} />
        </div>
      </div>
    </section>
  );
}
