import type { Metadata } from "next";
import PrintingAds from "@/components/sections/printing-ads";
import RequestSection from "@/components/sections/request-section";

export const metadata: Metadata = {
  title: "دعاية وطباعة في جمصة",
  description:
    "يافطات، بانرات، رول أب، فليكس، كلادينج، استيكرات، كروت شخصية، منيوهات، تصميم بوستات، إعلانات ممولة، ومواقع وصفحات هبوط في جمصة.",
};

export default function PrintingAdsPage() {
  return (
    <>
      <PrintingAds />
      <RequestSection defaultService="إعلانات ممولة وتسويق" />
    </>
  );
}
