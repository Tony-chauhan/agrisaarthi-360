import type { ReactNode } from "react";
import { Info, CheckCircle2, TriangleAlert, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONE_META: Record<AlertTone, { icon: typeof Info; classes: string }> = {
  info: {
    icon: Info,
    classes: "bg-canopy-50 border-canopy-200 text-canopy-800",
  },
  success: {
    icon: CheckCircle2,
    classes: "bg-sprout-400/10 border-sprout-400/40 text-canopy-800",
  },
  warning: {
    icon: TriangleAlert,
    classes: "bg-harvest-500/10 border-harvest-500/40 text-harvest-600",
  },
  danger: {
    icon: OctagonAlert,
    classes: "bg-red-50 border-red-200 text-red-800",
  },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const meta = TONE_META[tone];
  const Icon = meta.icon;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-xl border p-4", meta.classes, className)}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="text-sm">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
