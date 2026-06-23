import { cn } from "@/lib/utils";

type Tone = "slate" | "blue" | "green" | "orange" | "red" | "cyan" | "navy";

const toneClasses: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue/10 text-blue",
  green: "bg-green/10 text-green",
  orange: "bg-orange/10 text-orange",
  red: "bg-red-100 text-red-700",
  cyan: "bg-cyan/10 text-cyan",
  navy: "bg-navy/10 text-navy",
};

export function Badge({
  tone = "slate",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
