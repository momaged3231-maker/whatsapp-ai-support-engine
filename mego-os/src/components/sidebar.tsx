"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Printer,
  ListChecks,
  Boxes,
  ShoppingCart,
  Receipt,
  Building2,
  CalendarClock,
  BarChart3,
  Settings,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/customers", label: "العملاء", icon: Users },
  { href: "/orders", label: "طلبات الصيانة", icon: Wrench },
  { href: "/print-jobs", label: "الطباعة والبانرات", icon: Printer },
  { href: "/services", label: "الخدمات", icon: ListChecks },
  { href: "/inventory", label: "المخزون", icon: Boxes },
  { href: "/sales", label: "المبيعات", icon: ShoppingCart },
  { href: "/expenses", label: "المصاريف", icon: Receipt },
  { href: "/business-care", label: "اشتراكات المحلات", icon: Building2 },
  { href: "/followups", label: "المتابعات", icon: CalendarClock },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {links.map((link) => {
        const active = pathname?.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-blue text-white" : "text-slate-200 hover:bg-white/10",
            )}
          >
            <Icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
