"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function SearchBox({ placeholder = "بحث..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <Input
        placeholder={placeholder}
        defaultValue={searchParams.get("q") ?? ""}
        className="pr-9"
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) {
            params.set("q", e.target.value);
          } else {
            params.delete("q");
          }
          startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
          });
        }}
      />
    </div>
  );
}
