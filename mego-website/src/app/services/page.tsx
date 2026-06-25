import type { Metadata } from "next";
import ServicesGrid from "@/components/sections/services-grid";
import RequestSection from "@/components/sections/request-section";
import SectionHeading from "@/components/sections/section-heading";

export const metadata: Metadata = {
  title: "خدمات ميجو في جمصة",
  description:
    "صيانة كمبيوتر ولاب توب، موبايل، ريسيفر ودش، كاميرات مراقبة، شبكات، طباعة وتصوير، خدمات طلاب ومحلات، إعلانات ممولة، تصميم مواقع، يافطات وLED.",
};

export default function ServicesPage() {
  return (
    <>
      <div className="section-padding bg-mego-navy pb-0">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeading
            title="كل خدمات ميجو"
            subtitle="مناسب للأفراد والطلاب والمحلات والعيادات والمطاعم"
          />
        </div>
      </div>
      <ServicesGrid showHeading={false} />
      <RequestSection />
    </>
  );
}
