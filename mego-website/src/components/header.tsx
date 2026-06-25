"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { BRAND } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/business", label: "خدمات المحلات" },
  { href: "/printing-ads", label: "دعاية وطباعة" },
  { href: "/request", label: "اطلب خدمة" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-mego-navy/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-white">
            ميجو<span className="text-mego-cyan">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 transition hover:text-mego-cyan"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={`tel:${BRAND.phone}`}
            className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-mego-cyan hover:text-mego-cyan"
          >
            <Phone className="h-4 w-4" />
            اتصل الآن
          </a>
          <Link
            href="/request"
            className="rounded-full bg-mego-blue px-5 py-2 text-sm font-bold text-white shadow-lg shadow-mego-blue/30 transition hover:bg-mego-cyan"
          >
            اطلب خدمة الآن
          </Link>
        </div>

        <button
          aria-label="فتح القائمة"
          className="text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-mego-navy px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-base font-medium text-white/90 hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/request"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-mego-blue px-5 py-3 text-center text-base font-bold text-white"
            >
              اطلب خدمة الآن
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
