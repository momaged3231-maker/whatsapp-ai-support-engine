import Hero from "@/components/sections/hero";
import ServicesGrid from "@/components/sections/services-grid";
import RequestSection from "@/components/sections/request-section";
import Maintenance from "@/components/sections/maintenance";
import BusinessServices from "@/components/sections/business-services";
import PrintingAds from "@/components/sections/printing-ads";
import WhyMego from "@/components/sections/why-mego";
import Location from "@/components/sections/location";
import FAQSection from "@/components/sections/faq-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <RequestSection />
      <Maintenance />
      <BusinessServices />
      <PrintingAds />
      <WhyMego />
      <Location />
      <FAQSection />
    </>
  );
}
