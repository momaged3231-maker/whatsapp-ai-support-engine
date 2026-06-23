"use client";

import { useState, useTransition } from "react";
import { Input, Label } from "@/components/ui/input";
import { searchCustomers } from "@/app/(app)/customers/search-action";

type Match = { id: string; name: string; phone: string };

export function CustomerPicker({ defaultCustomer }: { defaultCustomer?: Match | null }) {
  const [mode, setMode] = useState<"existing" | "new">(defaultCustomer ? "existing" : "existing");
  const [query, setQuery] = useState(defaultCustomer?.name ?? "");
  const [results, setResults] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(defaultCustomer ?? null);
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${mode === "existing" ? "bg-blue text-white" : "bg-slate-100 text-slate-600"}`}
        >
          عميل موجود
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("new");
            setSelected(null);
          }}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${mode === "new" ? "bg-blue text-white" : "bg-slate-100 text-slate-600"}`}
        >
          عميل جديد
        </button>
      </div>

      {mode === "existing" ? (
        <div className="relative">
          <Label htmlFor="customer_search">بحث عن العميل (بالاسم أو الهاتف) *</Label>
          <Input
            id="customer_search"
            dir="auto"
            placeholder="اكتب اسم العميل أو رقم الهاتف"
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              setSelected(null);
              startTransition(async () => {
                const r = await searchCustomers(v);
                setResults(r);
              });
            }}
          />
          <input type="hidden" name="customer_id" value={selected?.id ?? ""} required />
          {results.length > 0 && !selected && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="block w-full px-3 py-2 text-right text-sm hover:bg-slate-50"
                  onClick={() => {
                    setSelected(r);
                    setQuery(`${r.name} — ${r.phone}`);
                    setResults([]);
                  }}
                >
                  {r.name} <span className="text-slate-400" dir="ltr">{r.phone}</span>
                </button>
              ))}
            </div>
          )}
          {selected && <p className="mt-1 text-xs text-green">تم اختيار: {selected.name}</p>}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="new_customer_name">اسم العميل *</Label>
            <Input id="new_customer_name" name="new_customer_name" required />
          </div>
          <div>
            <Label htmlFor="new_customer_phone">رقم الهاتف *</Label>
            <Input id="new_customer_phone" name="new_customer_phone" dir="ltr" required />
          </div>
        </div>
      )}
    </div>
  );
}
