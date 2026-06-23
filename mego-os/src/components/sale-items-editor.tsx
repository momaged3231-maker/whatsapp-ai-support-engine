"use client";

import { useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Option = { id: string; name: string; price: number };

type Line = {
  key: string;
  item_type: "service" | "product";
  inventory_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
};

export function SaleItemsEditor({
  services,
  products,
}: {
  services: Option[];
  products: Option[];
}) {
  const [lines, setLines] = useState<Line[]>([
    { key: crypto.randomUUID(), item_type: "service", inventory_item_id: "", item_name: "", quantity: 1, unit_price: 0 },
  ]);

  const total = useMemo(() => lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0), [lines]);

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      { key: crypto.randomUUID(), item_type: "product", inventory_item_id: "", item_name: "", quantity: 1, unit_price: 0 },
    ]);
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));
  }

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="items_json"
        value={JSON.stringify(
          lines
            .filter((l) => l.item_name.trim())
            .map((l) => ({
              item_type: l.item_type,
              item_name: l.item_name,
              inventory_item_id: l.inventory_item_id || null,
              quantity: l.quantity,
              unit_price: l.unit_price,
              total_price: l.quantity * l.unit_price,
            })),
        )}
      />
      <input type="hidden" name="total_amount" value={total} />

      {lines.map((line) => {
        const options = line.item_type === "service" ? services : products;
        return (
          <div key={line.key} className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-100 p-2">
            <Select
              className="w-28"
              value={line.item_type}
              onChange={(e) =>
                updateLine(line.key, {
                  item_type: e.target.value as "service" | "product",
                  inventory_item_id: "",
                  item_name: "",
                  unit_price: 0,
                })
              }
            >
              <option value="service">خدمة</option>
              <option value="product">منتج</option>
            </Select>

            <Select
              className="w-48"
              value={line.inventory_item_id}
              onChange={(e) => {
                const opt = options.find((o) => o.id === e.target.value);
                updateLine(line.key, {
                  inventory_item_id: e.target.value,
                  item_name: opt?.name ?? line.item_name,
                  unit_price: opt?.price ?? line.unit_price,
                });
              }}
            >
              <option value="">اختر من القائمة (اختياري)</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>

            <Input
              placeholder="اسم البند"
              className="w-40"
              value={line.item_name}
              onChange={(e) => updateLine(line.key, { item_name: e.target.value })}
            />

            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="الكمية"
              className="w-20"
              value={line.quantity}
              onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) })}
            />

            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="السعر"
              className="w-24"
              value={line.unit_price}
              onChange={(e) => updateLine(line.key, { unit_price: Number(e.target.value) })}
            />

            <span className="w-24 text-sm font-semibold">{formatCurrency(line.quantity * line.unit_price)}</span>

            <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(line.key)}>
              <Trash2 size={14} />
            </Button>
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" onClick={addLine}>
        <Plus size={14} /> إضافة بند
      </Button>

      <div className="text-left font-bold">الإجمالي: {formatCurrency(total)}</div>
    </div>
  );
}
