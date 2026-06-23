"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/input";
import { printJobStatusLabels } from "@/lib/status";
import type { PrintJobStatus } from "@/lib/database.types";

export function PrintJobStatusSelect({
  jobId,
  status,
  action,
}: {
  jobId: string;
  status: PrintJobStatus;
  action: (id: string, status: PrintJobStatus) => Promise<void>;
}) {
  const [value, setValue] = useState(status);
  const [, startTransition] = useTransition();

  return (
    <Select
      value={value}
      onChange={(e) => {
        const next = e.target.value as PrintJobStatus;
        setValue(next);
        startTransition(() => action(jobId, next));
      }}
    >
      {Object.entries(printJobStatusLabels).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </Select>
  );
}
