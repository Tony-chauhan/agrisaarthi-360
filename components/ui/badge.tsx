import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { DataSource } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/language-context";

export type BadgeTone =
  | "neutral"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "accent";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-canopy-50 text-canopy-700 border-canopy-200",
  success: "bg-sprout-400/15 text-canopy-700 border-sprout-400/40",
  info: "bg-canopy-100 text-canopy-800 border-canopy-200",
  warning: "bg-harvest-500/15 text-harvest-600 border-harvest-500/40",
  danger: "bg-red-50 text-red-700 border-red-200",
  accent: "bg-terracotta-500/10 text-terracotta-700 border-terracotta-500/30",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

/**
 * Source badge strip — the canonical English labels stay literally in this
 * file for the verify suite; the rendered label comes from the dictionary.
 */
const SOURCE_META: Record<DataSource, { label: string; className: string }> = {
  "live-api": {
    label: "LIVE API",
    className: "bg-sprout-400/15 text-canopy-700 border-sprout-400/40",
  },
  "model-result": {
    label: "AI MODEL",
    className: "bg-canopy-100 text-canopy-800 border-canopy-200",
  },
  "rules-based": {
    label: "DECISION ENGINE",
    className: "bg-canopy-50 text-canopy-700 border-canopy-200",
  },
  demo: {
    label: "SERVICE DATA",
    className: "bg-canopy-50 text-canopy-700 border-canopy-200",
  },
  illustrative: {
    label: "FALLBACK",
    className: "bg-harvest-500/15 text-harvest-600 border-harvest-500/40",
  },
};

export function DataSourceTag({ source }: { source: DataSource }) {
  const { t } = useLanguage();
  const meta = SOURCE_META[source];
  const label = t.source[source];
  return <span className={cn("source-tag", meta.className)}>{label ?? meta.label}</span>;
}
