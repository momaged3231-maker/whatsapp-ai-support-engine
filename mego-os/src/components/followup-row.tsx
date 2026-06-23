"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tr, Td } from "@/components/ui/table";
import { CopyButton } from "@/components/copy-button";
import { DeleteButton } from "@/components/delete-button";
import { followupStatusLabels } from "@/lib/status";
import { formatDate } from "@/lib/utils";
import { followupReminderMessage, whatsappLink } from "@/lib/whatsapp-templates";
import type { Followup } from "@/lib/database.types";

export function FollowupRow({
  followup,
  customerName,
  customerPhone,
  orderNo,
  isAdmin,
  statusAction,
  deleteAction,
}: {
  followup: Followup;
  customerName: string;
  customerPhone: string;
  orderNo: string | null;
  isAdmin: boolean;
  statusAction: (id: string, status: Followup["status"]) => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  const [, startTransition] = useTransition();
  const message = followupReminderMessage(followup.title);

  return (
    <Tr>
      <Td className="font-semibold">{customerName}</Td>
      <Td dir="ltr" className="text-slate-500">
        {customerPhone}
      </Td>
      <Td>{followup.title}</Td>
      <Td>{orderNo ?? "—"}</Td>
      <Td>{formatDate(followup.followup_date)}</Td>
      <Td>
        <Select
          value={followup.status}
          onChange={(e) => startTransition(() => statusAction(followup.id, e.target.value as Followup["status"]))}
          className="w-32"
        >
          {Object.entries(followupStatusLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </Td>
      <Td>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={message} label="رسالة تذكير" />
          <a href={whatsappLink(customerPhone, message)} target="_blank" rel="noreferrer">
            <Button type="button" size="sm" variant="success">
              واتساب
            </Button>
          </a>
          {isAdmin && <DeleteButton action={deleteAction} confirmText="حذف هذه المتابعة؟" />}
        </div>
      </Td>
    </Tr>
  );
}
