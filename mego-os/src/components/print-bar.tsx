"use client";

import { Button } from "@/components/ui/button";
import { Printer, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function PrintBar() {
  const router = useRouter();
  return (
    <div className="no-print mb-4 flex items-center justify-between">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowRight size={16} /> رجوع
      </Button>
      <Button size="sm" onClick={() => window.print()}>
        <Printer size={16} /> طباعة
      </Button>
    </div>
  );
}
