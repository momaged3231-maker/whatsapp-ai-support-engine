"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function CopyButton({
  text,
  label = "نسخ الرسالة",
  ...props
}: { text: string; label?: string } & ButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      {...props}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "تم النسخ" : label}
    </Button>
  );
}
