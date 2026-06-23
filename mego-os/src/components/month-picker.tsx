"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input, Label } from "@/components/ui/input";

export function MonthPicker({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="month" className="mb-0">
        الشهر:
      </Label>
      <Input
        id="month"
        type="month"
        className="w-44"
        defaultValue={defaultValue}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("month", e.target.value);
          router.replace(`${pathname}?${params.toString()}`);
        }}
      />
    </div>
  );
}
