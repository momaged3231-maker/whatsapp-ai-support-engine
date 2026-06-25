import Link from "next/link";
import SectionHeading from "@/components/sections/section-heading";

const ITEMS = [
  "يافطات",
  "بانرات",
  "رول أب",
  "فليكس",
  "كلادينج",
  "استيكرات",
  "كروت شخصية",
  "منيوهات",
  "تصميم بوستات",
  "إعلانات ممولة",
  "مواقع وصفحات هبوط",
];

export default function PrintingAds() {
  return (
    <section id="printing-ads" className="section-padding bg-mego-navy">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeading
          title="دعاية وطباعة لمشروعك"
          subtitle="كل احتياجاتك من التصميم والطباعة والإعلانات في مكان واحد"
        />

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {ITEMS.map((item) => (
            <span
              key={item}
              className="rounded-full border border-mego-cyan/30 bg-mego-navy-light px-5 py-2 text-sm font-bold text-white"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/printing-ads"
            className="rounded-full bg-mego-yellow px-8 py-4 text-lg font-extrabold text-mego-navy shadow-lg shadow-mego-yellow/30 transition hover:brightness-110"
          >
            اطلب تصميم أو طباعة
          </Link>
        </div>
      </div>
    </section>
  );
}
