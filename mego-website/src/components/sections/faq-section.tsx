import FAQ from "@/components/faq";
import SectionHeading from "@/components/sections/section-heading";

export default function FAQSection() {
  return (
    <section className="section-padding bg-mego-navy-light">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeading title="أسئلة شائعة" />
        <div className="mt-10">
          <FAQ />
        </div>
      </div>
    </section>
  );
}
