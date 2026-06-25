import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import WhatsAppFloatButton from "@/components/whatsapp-float-button";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mego-gomsa.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "ميجو جمصة | صيانة كمبيوتر وموبايل وكاميرات وطباعة وخدمات محلات",
    template: "%s | ميجو جمصة",
  },
  description:
    "ميجو في جمصة بجوار مسجد السلام يقدم صيانة كمبيوتر ولاب توب، خدمات موبايل، ريسيفر ودش، كاميرات، شبكات، طباعة وتصوير، إعلانات ممولة، يافطات، مواقع وخدمات محلات.",
  keywords: [
    "ميجو جمصة",
    "صيانة كمبيوتر جمصة",
    "صيانة موبايل جمصة",
    "كاميرات مراقبة جمصة",
    "طباعة جمصة",
    "خدمات طلاب جمصة",
    "يافطات جمصة",
    "إعلانات ممولة جمصة",
    "تصميم مواقع جمصة",
  ],
  authors: [{ name: "ميجو" }],
  openGraph: {
    title: "ميجو — خدمتك في مكان واحد",
    description:
      "صيانة، طباعة، كاميرات، شبكات، إعلانات، مواقع وخدمات محلات داخل جمصة.",
    locale: "ar_EG",
    type: "website",
    siteName: "ميجو",
  },
  twitter: {
    card: "summary_large_image",
    title: "ميجو — خدمتك في مكان واحد",
    description:
      "صيانة، طباعة، كاميرات، شبكات، إعلانات، مواقع وخدمات محلات داخل جمصة.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1B2A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-mego-navy text-white antialiased font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloatButton />
      </body>
    </html>
  );
}
