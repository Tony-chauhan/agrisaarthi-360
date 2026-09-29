"use client";

import { CheckCircle2, Ban, PlayCircle } from "lucide-react";
import type { TaskStatus } from "@/lib/planner/types";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * TaskStatusControl — lifecycle actions on a task card.
 * Touch-friendly (44px+ targets), keyboard accessible, no color-only
 * status (icon + label always rendered).
 */
export function TaskStatusControl({
  taskId,
  status,
  onStatusChange,
}: {
  taskId: string;
  status: TaskStatus;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  const { t } = useLanguage();

  if (status === "completed" || status === "skipped") {
    return (
      <button
        type="button"
        onClick={() => onStatusChange(taskId, "planned")}
        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-canopy-200 px-3 text-sm font-medium text-loam-600 transition-colors hover:bg-canopy-50"
        aria-label={t.planner.statusReopenAria(taskId)}
      >
        {t.planner.statusReopen}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "planned" ? (
        <button
          type="button"
          onClick={() => onStatusChange(taskId, "in-progress")}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-canopy-200 px-3 text-sm font-medium text-canopy-700 transition-colors hover:bg-canopy-50"
          aria-label={t.planner.statusInProgressAria}
        >
          <PlayCircle className="h-4 w-4" aria-hidden />
          {t.planner.statusStart}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onStatusChange(taskId, "completed")}
        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-sprout-400/20 px-3 text-sm font-medium text-canopy-800 transition-colors hover:bg-sprout-400/30"
        aria-label={t.planner.statusCompleteAria}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        {t.planner.statusComplete}
      </button>
      <button
        type="button"
        onClick={() => onStatusChange(taskId, "skipped")}
        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-loam-500 transition-colors hover:bg-canopy-50"
        aria-label={t.planner.statusSkipAria}
      >
        <Ban className="h-4 w-4" aria-hidden />
        {t.planner.statusSkip}
      </button>
    </div>
  );
}
