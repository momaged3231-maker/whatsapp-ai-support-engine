"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/input";
import { orderStatusLabels } from "@/lib/status";
import type { OrderStatus } from "@/lib/database.types";

export function OrderStatusSelect({
  orderId,
  status,
  action,
}: {
  orderId: string;
  status: OrderStatus;
  action: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const [value, setValue] = useState(status);
  const [, startTransition] = useTransition();

  return (
    <Select
      value={value}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        setValue(next);
        startTransition(() => action(orderId, next));
      }}
    >
      {Object.entries(orderStatusLabels).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </Select>
  );
}
