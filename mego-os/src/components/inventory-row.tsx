"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tr, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/delete-button";
import { formatCurrency } from "@/lib/utils";
import type { InventoryItem } from "@/lib/database.types";

export function InventoryRow({
  item,
  isAdmin,
  updateAction,
  deleteAction,
}: {
  item: InventoryItem;
  isAdmin: boolean;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const low = item.quantity <= item.min_quantity;

  if (editing) {
    return (
      <Tr>
        <Td colSpan={6}>
          <form
            action={async (formData) => {
              await updateAction(formData);
              setEditing(false);
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <Input name="name" defaultValue={item.name} className="w-40" required />
            <Input name="category" defaultValue={item.category ?? ""} placeholder="التصنيف" className="w-32" />
            <Input name="sku" defaultValue={item.sku ?? ""} placeholder="الكود" className="w-28" />
            <Input name="quantity" type="number" defaultValue={item.quantity} className="w-20" />
            <Input name="min_quantity" type="number" defaultValue={item.min_quantity} placeholder="حد أدنى" className="w-24" />
            <Input
              name="purchase_price"
              type="number"
              step="0.01"
              defaultValue={item.purchase_price ?? ""}
              placeholder="شراء"
              className="w-24"
            />
            <Input
              name="selling_price"
              type="number"
              step="0.01"
              defaultValue={item.selling_price ?? ""}
              placeholder="بيع"
              className="w-24"
            />
            <Button type="submit" size="sm">
              حفظ
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              إلغاء
            </Button>
          </form>
        </Td>
      </Tr>
    );
  }

  return (
    <Tr>
      <Td className="font-semibold">{item.name}</Td>
      <Td>{item.category ?? "—"}</Td>
      <Td>
        {item.quantity} {low && <Badge tone="red">منخفض</Badge>}
      </Td>
      <Td>{item.selling_price != null ? formatCurrency(item.selling_price) : "—"}</Td>
      <Td>{item.supplier_name ?? "—"}</Td>
      <Td>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            تعديل
          </Button>
          {isAdmin && <DeleteButton action={deleteAction} confirmText="حذف هذا المنتج؟" />}
        </div>
      </Td>
    </Tr>
  );
}
