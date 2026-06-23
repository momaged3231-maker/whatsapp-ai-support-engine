"use client";

import { useState } from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { customerTypeLabels, customerSourceLabels } from "@/lib/status";
import type { Customer } from "@/lib/database.types";

export function CustomerForm({
  customer,
  action,
}: {
  customer?: Customer;
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">الاسم *</Label>
          <Input id="name" name="name" required defaultValue={customer?.name} />
        </div>
        <div>
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input id="phone" name="phone" required dir="ltr" defaultValue={customer?.phone} />
        </div>
        <div>
          <Label htmlFor="phone2">رقم هاتف إضافي</Label>
          <Input id="phone2" name="phone2" dir="ltr" defaultValue={customer?.phone2 ?? ""} />
        </div>
        <div>
          <Label htmlFor="area">المنطقة</Label>
          <Input id="area" name="area" defaultValue={customer?.area ?? ""} />
        </div>
        <div>
          <Label htmlFor="customer_type">نوع العميل</Label>
          <Select id="customer_type" name="customer_type" defaultValue={customer?.customer_type ?? "individual"}>
            {Object.entries(customerTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="source">مصدر العميل</Label>
          <Select id="source" name="source" defaultValue={customer?.source ?? "walk_in"}>
            {Object.entries(customerSourceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="address">العنوان</Label>
        <Input id="address" name="address" defaultValue={customer?.address ?? ""} />
      </div>
      <div>
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea id="notes" name="notes" defaultValue={customer?.notes ?? ""} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "جاري الحفظ..." : "حفظ"}
      </Button>
    </form>
  );
}
