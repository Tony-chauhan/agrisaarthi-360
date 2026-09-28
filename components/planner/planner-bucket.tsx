"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import type { FarmTask, PlannerBucketKey } from "@/lib/planner/types";

/**
 * PlannerBucket — one labeled group of task cards (TODAY / THIS WEEK /
 * UPCOMING / WEATHER WATCH / FARM ACTION). Empty buckets stay invisible
 * to keep the board focused.
 */

const BUCKET_META: Record<
  PlannerBucketKey,
  { title: string; hint: string; tone: string }
> = {
  today: {
    title: "Today",
    hint: "Due today or overdue",
    tone: "text-terracotta-600",
  },
  thisWeek: {
    title: "This week",
    hint: "Next 7 days",
    tone: "text-canopy-700",
  },
  upcoming: {
    title: "Upcoming",
    hint: "Later this season",
    tone: "text-loam-600",
  },
  weatherWatch: {
    title: "Weather watch",
    hint: "Weather-aware tasks — re-check the forecast",
    tone: "text-canopy-600",
  },
  farmAction: {
    title: "Farm action",
    hint: "From today's weather action",
    tone: "text-terracotta-600",
  },
};

export function PlannerBucket({
  bucketKey,
  tasks,
  children,
}: {
  bucketKey: PlannerBucketKey;
  tasks: FarmTask[];
  children: React.ReactNode;
}) {
  const meta = BUCKET_META[bucketKey];
  if (tasks.length === 0) return null;

  return (
    <section aria-label={`${meta.title} tasks`} className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-canopy-900">
          <ClipboardList className="h-4 w-4 text-canopy-500" aria-hidden />
          {meta.title}
          <span className="rounded-full bg-canopy-100 px-2 py-0.5 text-xs font-semibold text-canopy-700">
            {tasks.length}
          </span>
        </h3>
        <p className={"text-xs font-medium " + meta.tone}>{meta.hint}</p>
      </div>
      {children}
      {bucketKey === "today" && tasks.length > 0 ? (
        <p className="text-[11px] text-loam-400">
          Tip: complete tasks to build your verified farm record in the{" "}
          <Link href="/timeline" className="font-medium text-terracotta-600 hover:underline">
            Farm Timeline
          </Link>
          .
        </p>
      ) : null}
    </section>
  );
}
