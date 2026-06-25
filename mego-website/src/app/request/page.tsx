import type { Metadata } from "next";
import RequestSection from "@/components/sections/request-section";

export const metadata: Metadata = {
  title: "اطلب خدمة من ميجو",
  description:
    "ابعت طلبك لميجو في جمصة وهنقولك الحل والسعر قبل التنفيذ. صيانة، طباعة، كاميرات، شبكات، إعلانات ومواقع.",
};

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const params = await searchParams;
  return <RequestSection defaultService={params.service} />;
}
