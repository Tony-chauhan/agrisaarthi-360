"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sprout, RefreshCw } from "lucide-react";
import { useFarmProfile } from "@/lib/farm-context";
import { useTimeline } from "@/lib/timeline/timeline-context";
import { usePlanner } from "@/lib/planner/task-store";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";
import { generatePlan } from "@/lib/planner/planner-engine";
import type { PlannerPlan } from "@/lib/planner/types";
import type { FarmTask, TaskStatus } from "@/lib/planner/types";
import { PlannerBucket } from "@/components/planner/planner-bucket";
import { TaskCard } from "@/components/planner/task-card";
import { EmptyState, SkeletonCard } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * PlannerBoard — the P1.1 board. Generates the plan from the CURRENT farm
 * context (profile + crop + weather action + health + operation) via the
 * deterministic engine, merges it into the session task store, and renders
 * TODAY / THIS WEEK / UPCOMING / WEATHER WATCH / FARM ACTION.
 */
export function PlannerBoard() {
  const { profile, latestHealthCheck, latestOperation } = useFarmProfile();
  const { snapshot } = useWeather(profile.location);
  const { applyPlan, tasks, setTaskStatus } = usePlanner();
  const { emitEvent } = useTimeline();
  const { t, lang } = useLanguage();

  const [ready, setReady] = useState(false);

  const weatherAction = useMemo(
    () => (snapshot ? deriveFarmWeatherAction(snapshot, profile, lang) : null),
    [snapshot, profile, lang]
  );

  const plan: PlannerPlan = useMemo(
    () =>
      generatePlan(
        {
          profile: {
            location: profile.location,
            farmSizeAcres: profile.farmSizeAcres,
            season: profile.season,
            selectedCrop: profile.selectedCrop,
          },
          weatherAction: weatherAction
            ? {
                title: weatherAction.title,
                message: weatherAction.message,
                reason: weatherAction.reason,
                recommendation: weatherAction.recommendation,
                category: weatherAction.category,
                priority: weatherAction.priority,
              }
            : null,
          latestHealthCheck,
          latestOperation,
        },
        lang
      ),
    [profile, weatherAction, latestHealthCheck, latestOperation, lang]
  );

  // Merge the freshly generated plan into the session store once per render.
  useEffect(() => {
    applyPlan(plan);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.generatedAt, plan.tasks.length]);

  const hasCrop = Boolean(profile.selectedCrop);

  if (!ready) {
    return <SkeletonCard className="h-64" />;
  }

  if (!hasCrop) {
    return (
      <EmptyState
        title={t.planner.noPlanTitle}
        description={t.planner.noPlanBody}
        action={
          <Link href="/crop-advisor">
            <Button variant="accent" leftIcon={<Sprout className="h-4 w-4" aria-hidden />}>
              {t.planner.openAdvisor}
            </Button>
          </Link>
        }
      />
    );
  }

  const activeCount = tasks.filter(
    (t) => t.status === "planned" || t.status === "in-progress"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-loam-600">
          {t.planner.planFor(profile.selectedCrop ?? "")}{" "}
          {t.planner.seasonActive(t.common.seasons[profile.season], activeCount)}
        </p>
        <div className="flex items-center gap-2">
          <Badge>
            <RefreshCw className="h-3 w-3" aria-hidden />
            {t.weather.decisionEngine}
          </Badge>
          <button
            type="button"
            onClick={() =>
              emitEvent({
                eventType: "FARM_RECORD_CREATED",
                title: t.planner.recordEventTitle,
                description: t.planner.recordEventDescription(
                  profile.selectedCrop ?? "",
                  profile.location,
                ),
                source: "rules-based",
                entityType: "record",
                entityId: `record-${Date.now().toString(36)}`,
              })
            }
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-canopy-200 px-3 text-sm font-medium text-canopy-700 hover:bg-canopy-50"
          >
            {t.planner.createRecord}
          </button>
        </div>
      </div>

      {(["today", "thisWeek", "upcoming", "weatherWatch", "farmAction"] as const).map(
        (key) => {
          // Buckets are computed from the merged store so status changes
          // reflect immediately.
          const bucketTasks = tasks
            .filter((t) => t.status === "planned" || t.status === "in-progress")
            .filter((t) => matchBucket(t, key, todayIso()));
          return (
            <PlannerBucket key={key} bucketKey={key} tasks={bucketTasks}>
              <div className="flex flex-col gap-2.5">
                {bucketTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={setTaskStatus}
                  />
                ))}
              </div>
            </PlannerBucket>
          );
        }
      )}

      {completedOrSkipped(tasks).length > 0 ? (
        <section aria-label={t.planner.completedAria} className="flex flex-col gap-2">
          <h3 className="font-display text-base font-semibold text-canopy-900">
            {t.planner.completedSkipped}
          </h3>
          {completedOrSkipped(tasks).map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={setTaskStatus} />
          ))}
        </section>
      ) : null}

      <p className="rounded-lg bg-canopy-50/60 px-3 py-2 text-xs text-loam-600">
        {plan.caveat}
      </p>
    </div>
  );
}

/* ---------------------------- helpers ---------------------------- */

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekEndIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}

function matchBucket(
  task: FarmTask,
  bucket: string,
  today: string
): boolean {
  const weekEnd = weekEndIso();
  switch (bucket) {
    case "today":
      return task.dueAt <= today;
    case "thisWeek":
      return task.dueAt > today && task.dueAt <= weekEnd;
    case "upcoming":
      return task.dueAt > weekEnd;
    case "weatherWatch":
      return Boolean(task.weatherDependency);
    case "farmAction":
      return task.source === "weather";
    default:
      return false;
  }
}

function completedOrSkipped(tasks: FarmTask[]): FarmTask[] {
  return tasks
    .filter((t) => t.status === "completed" || t.status === "skipped")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
