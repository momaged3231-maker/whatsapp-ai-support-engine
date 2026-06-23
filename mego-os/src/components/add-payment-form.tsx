"use client";

import { useState } from "react";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { paymentMethodLabels } from "@/lib/status";

export function AddPaymentForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="success" size="sm" onClick={() => setOpen(true)}>
        + إضافة دفعة
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        setPending(true);
        try {
          await action(formData);
          setOpen(false);
        } finally {
          setPending(false);
        }
      }}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-3"
    >
      <div>
        <Label htmlFor="amount">القيمة</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0" required className="w-32" />
      </div>
      <div>
        <Label htmlFor="payment_method">طريقة الدفع</Label>
        <Select id="payment_method" name="payment_method" defaultValue="cash" className="w-40">
          {Object.entries(paymentMethodLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "جاري الحفظ..." : "حفظ الدفعة"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        إلغاء
      </Button>
    </form>
  );
}
