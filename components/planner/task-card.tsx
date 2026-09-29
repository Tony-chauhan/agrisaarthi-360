"use client";

import { CalendarDays, CloudSun, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge, DataSourceTag } from "@/components/ui/badge";
import type { FarmTask, TaskStatus } from "@/lib/planner/types";
import { TaskStatusControl } from "@/components/planner/task-status-control";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * TaskCard — one planner task with progressive disclosure of the
 * reason/context (transparency rule: every task explains itself).
 */

const PRIORITY_TONE: Record<FarmTask["priority"], "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export function TaskCard({
  task,
  onStatusChange,
}: {
  task: FarmTask;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  const [showContext, setShowContext] = useState(false);
  const { t } = useLanguage();
  const done = task.status === "completed";
  const skipped = task.status === "skipped";

  return (
    <article
      className={
        "rounded-xl border px-4 py-3.5 transition-colors " +
        (done
          ? "border-sprout-400/40 bg-sprout-400/10"
          : skipped
            ? "border-canopy-100 bg-canopy-50/40 opacity-70"
            : "border-canopy-100 bg-white hover:border-canopy-300")
      }
      aria-label={t.planner.taskAria(task.title)}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={
              "text-sm font-semibold " +
              (done ? "text-canopy-700 line-through" : "text-canopy-900")
            }
          >
            {task.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-loam-600">
            {task.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={PRIORITY_TONE[task.priority]}>
              {t.planner.priority[task.priority]}
            </Badge>
            <DataSourceTag source={task.sourceLabel} />
          </div>
          <p className="flex items-center gap-1 text-xs text-loam-500">
            <CalendarDays className="h-3 w-3" aria-hidden />
            {t.common.duePrefix(task.dueAt)}
          </p>
          {task.weatherDependency ? (
            <p className="flex items-center gap-1 text-xs font-medium text-canopy-600">
              <CloudSun className="h-3 w-3" aria-hidden />
              {t.planner.weatherAware}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <TaskStatusControl
          taskId={task.id}
          status={task.status}
          onStatusChange={onStatusChange}
        />
        <button
          type="button"
          onClick={() => setShowContext((v) => !v)}
          aria-expanded={showContext}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1 text-xs font-medium text-canopy-700 hover:text-canopy-900"
        >
          {t.planner.whyTask}
          <ChevronDown
            className={
              "h-3.5 w-3.5 transition-transform " + (showContext ? "rotate-180" : "")
            }
            aria-hidden
          />
        </button>
      </div>

      {showContext ? (
        <dl className="mt-2 rounded-lg bg-canopy-50/60 px-3 py-2 text-xs text-loam-700">
          <div className="flex gap-1.5">
            <dt className="font-semibold text-canopy-900">{t.common.sourcePrefix}</dt>
            <dd>
              {task.source === "calendar" ? t.planner.sourceCalendar : task.source}
            </dd>
          </div>
          <div className="mt-0.5 flex gap-1.5">
            <dt className="font-semibold text-canopy-900">{t.common.categoryPrefix}</dt>
            <dd>{task.category}</dd>
          </div>
          {task.weatherDependency ? (
            <div className="mt-0.5 flex gap-1.5">
              <dt className="font-semibold text-canopy-900">{t.weather.caution}</dt>
              <dd>{task.weatherDependency.note}</dd>
            </div>
          ) : null}
          {task.isFallback ? (
            <div className="mt-0.5 flex gap-1.5">
              <dt className="font-semibold text-canopy-900">{t.common.notePrefix}</dt>
              <dd>{t.cropHealth.fallbackTaskNote}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </article>
  );
}
