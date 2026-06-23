"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  confirmText = "هل أنت متأكد من الحذف؟",
  label = "حذف",
}: {
  action: () => Promise<void>;
  confirmText?: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={async () => {
        if (!confirm(confirmText)) return;
        setPending(true);
        try {
          await action();
        } finally {
          setPending(false);
        }
      }}
    >
      <Trash2 size={14} />
      {pending ? "جاري الحذف..." : label}
    </Button>
  );
}
