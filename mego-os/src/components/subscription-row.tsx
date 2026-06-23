"use client";

import { useState, useTransition } from "react";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tr, Td } from "@/components/ui/table";
import { CopyButton } from "@/components/copy-button";
import { DeleteButton } from "@/components/delete-button";
import { subscriptionStatusLabels } from "@/lib/status";
import { formatCurrency, formatDate } from "@/lib/utils";
import { subscriptionRenewalMessage, whatsappLink } from "@/lib/whatsapp-templates";
import type { BusinessSubscription } from "@/lib/database.types";

export function SubscriptionRow({
  sub,
  customerPhone,
  isAdmin,
  statusAction,
  visitsAction,
  renewAction,
  deleteAction,
}: {
  sub: BusinessSubscription;
  customerPhone: string;
  isAdmin: boolean;
  statusAction: (id: string, status: BusinessSubscription["status"]) => Promise<void>;
  visitsAction: (id: string, used: number) => Promise<void>;
  renewAction: (id: string, renewalDate: string) => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  const [, startTransition] = useTransition();
  const [used, setUsed] = useState(sub.used_visits);
  const message = subscriptionRenewalMessage(sub.business_name, sub.monthly_price, formatDate(sub.renewal_date));

  return (
    <Tr>
      <Td className="font-semibold">{sub.business_name}</Td>
      <Td>{sub.package_name}</Td>
      <Td>{formatCurrency(sub.monthly_price)}</Td>
      <Td>{formatDate(sub.renewal_date)}</Td>
      <Td>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            className="w-14"
            value={used}
            min={0}
            max={sub.included_visits}
            onChange={(e) => {
              const v = Number(e.target.value);
              setUsed(v);
              startTransition(() => visitsAction(sub.id, v));
            }}
          />
          <span className="text-xs text-slate-400">/ {sub.included_visits}</span>
        </div>
      </Td>
      <Td>
        <Select
          value={sub.status}
          onChange={(e) => startTransition(() => statusAction(sub.id, e.target.value as BusinessSubscription["status"]))}
          className="w-32"
        >
          {Object.entries(subscriptionStatusLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </Td>
      <Td>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={message} label="رسالة تجديد" />
          <a href={whatsappLink(customerPhone, message)} target="_blank" rel="noreferrer">
            <Button type="button" size="sm" variant="success">
              واتساب
            </Button>
          </a>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const next = prompt("تاريخ التجديد الجديد (YYYY-MM-DD)", sub.renewal_date);
              if (next) startTransition(() => renewAction(sub.id, next));
            }}
          >
            تجديد
          </Button>
          {isAdmin && <DeleteButton action={deleteAction} confirmText="حذف هذا الاشتراك؟" />}
        </div>
      </Td>
    </Tr>
  );
}
