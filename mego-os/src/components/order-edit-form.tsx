"use client";

import { useState } from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deviceTypeLabels, orderPriorityLabels } from "@/lib/status";
import type { RepairOrder } from "@/lib/database.types";

export function OrderEditForm({
  order,
  action,
}: {
  order: RepairOrder;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        setPending(true);
        try {
          await action(formData);
        } finally {
          setPending(false);
        }
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="device_type">نوع الجهاز</Label>
          <Select id="device_type" name="device_type" defaultValue={order.device_type}>
            {Object.entries(deviceTypeLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="device_brand">الماركة</Label>
          <Input id="device_brand" name="device_brand" defaultValue={order.device_brand ?? ""} />
        </div>
        <div>
          <Label htmlFor="device_model">الموديل</Label>
          <Input id="device_model" name="device_model" defaultValue={order.device_model ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="problem_description">وصف العطل</Label>
        <Textarea id="problem_description" name="problem_description" defaultValue={order.problem_description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="received_accessories">الملحقات المستلمة</Label>
          <Input id="received_accessories" name="received_accessories" defaultValue={order.received_accessories ?? ""} />
        </div>
        <div>
          <Label htmlFor="device_condition">حالة الجهاز</Label>
          <Input id="device_condition" name="device_condition" defaultValue={order.device_condition ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="estimated_price">السعر التقديري</Label>
          <Input
            id="estimated_price"
            name="estimated_price"
            type="number"
            step="0.01"
            defaultValue={order.estimated_price ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="final_price">السعر النهائي</Label>
          <Input id="final_price" name="final_price" type="number" step="0.01" defaultValue={order.final_price ?? ""} />
        </div>
        <div>
          <Label htmlFor="priority">الأولوية</Label>
          <Select id="priority" name="priority" defaultValue={order.priority}>
            {Object.entries(orderPriorityLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="expected_delivery_at">موعد التسليم المتوقع</Label>
        <Input
          id="expected_delivery_at"
          name="expected_delivery_at"
          type="datetime-local"
          defaultValue={order.expected_delivery_at?.slice(0, 16) ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="technician_notes">ملاحظات الفني</Label>
        <Textarea id="technician_notes" name="technician_notes" defaultValue={order.technician_notes ?? ""} />
      </div>
      <div>
        <Label htmlFor="customer_notes">ملاحظات العميل</Label>
        <Textarea id="customer_notes" name="customer_notes" defaultValue={order.customer_notes ?? ""} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "جاري الحفظ..." : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
