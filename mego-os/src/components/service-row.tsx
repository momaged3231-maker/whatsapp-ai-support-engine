"use client";

import { useState, useTransition } from "react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tr, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/delete-button";
import { serviceCategoryLabels } from "@/lib/status";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/lib/database.types";

export function ServiceRow({
  service,
  isAdmin,
  updateAction,
  toggleAction,
  deleteAction,
}: {
  service: Service;
  isAdmin: boolean;
  updateAction: (formData: FormData) => Promise<void>;
  toggleAction: (id: string, isActive: boolean) => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <Tr>
        <Td colSpan={5}>
          <form
            action={async (formData) => {
              await updateAction(formData);
              setEditing(false);
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <Input name="name" defaultValue={service.name} className="w-48" required />
            <Select name="category" defaultValue={service.category} className="w-40">
              {Object.entries(serviceCategoryLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            <Input
              name="starting_price"
              type="number"
              step="0.01"
              defaultValue={service.starting_price ?? ""}
              placeholder="السعر"
              className="w-28"
            />
            <Input name="description" defaultValue={service.description ?? ""} placeholder="الوصف" className="w-48" />
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
      <Td className="font-semibold">{service.name}</Td>
      <Td>
        <Badge tone="cyan">{serviceCategoryLabels[service.category]}</Badge>
      </Td>
      <Td>{service.starting_price != null ? formatCurrency(service.starting_price) : "حسب المعاينة"}</Td>
      <Td>
        <button
          disabled={pending}
          onClick={() => startTransition(() => toggleAction(service.id, !service.is_active))}
        >
          <Badge tone={service.is_active ? "green" : "slate"}>{service.is_active ? "مفعل" : "متوقف"}</Badge>
        </button>
      </Td>
      <Td>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            تعديل
          </Button>
          {isAdmin && <DeleteButton action={deleteAction} confirmText="حذف هذه الخدمة؟" />}
        </div>
      </Td>
    </Tr>
  );
}
