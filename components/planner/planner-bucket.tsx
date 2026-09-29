"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import type { FarmTask, PlannerBucketKey } from "@/lib/planner/types";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * PlannerBucket — one labeled group of task cards (TODAY / THIS WEEK /
 * UPCOMING / WEATHER WATCH / FARM ACTION). Empty buckets stay invisible
 * to keep the board focused.
 */

export function PlannerBucket({
  bucketKey,
  tasks,
  children,
}: {
  bucketKey: PlannerBucketKey;
  tasks: FarmTask[];
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const b = t.planner.bucket;
  const meta: Record<PlannerBucketKey, { title: string; hint: string; tone: string }> = {
    today: { title: b.today, hint: b.todayHint, tone: "text-terracotta-600" },
    thisWeek: { title: b.thisWeek, hint: b.thisWeekHint, tone: "text-canopy-700" },
    upcoming: { title: b.upcoming, hint: b.upcomingHint, tone: "text-loam-600" },
    weatherWatch: {
      title: b.weatherWatch,
      hint: b.weatherWatchHint,
      tone: "text-canopy-600",
    },
    farmAction: { title: b.farmAction, hint: b.farmActionHint, tone: "text-terracotta-600" },
  };
  const m = meta[bucketKey];
  if (tasks.length === 0) return null;

  return (
    <section aria-label={b.tasksAria(m.title)} className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-canopy-900">
          <ClipboardList className="h-4 w-4 text-canopy-500" aria-hidden />
          {m.title}
          <span className="rounded-full bg-canopy-100 px-2 py-0.5 text-xs font-semibold text-canopy-700">
            {tasks.length}
          </span>
        </h3>
        <p className={"text-xs font-medium " + m.tone}>{m.hint}</p>
      </div>
      {children}
      {bucketKey === "today" && tasks.length > 0 ? (
        <p className="text-xs text-loam-400">
          {t.planner.timelineTip}
          <Link href="/timeline" className="font-medium text-terracotta-600 hover:underline">
            {t.planner.timelineTipLink}
          </Link>
          .
        </p>
      ) : null}
    </section>
  );
}
