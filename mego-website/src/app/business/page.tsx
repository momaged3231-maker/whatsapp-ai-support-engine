import type { Metadata } from "next";
import BusinessServices from "@/components/sections/business-services";
import RequestSection from "@/components/sections/request-section";
import WhyMego from "@/components/sections/why-mego";

export const metadata: Metadata = {
  title: "خدمات المحلات والأنشطة التجارية في جمصة",
  description:
    "حلول تقنية ودعائية للمحلات والعيادات والمطاعم والصيدليات في جمصة: واتساب بيزنس، كاميرات، شبكات، طابعات، إعلانات ممولة، تصميم منيو وQR، دعم تقني شهري.",
};

export default function BusinessPage() {
  return (
    <>
      <BusinessServices />
      <WhyMego />
      <RequestSection defaultService="خدمات محلات وأنشطة" />
    </>
  );
}
