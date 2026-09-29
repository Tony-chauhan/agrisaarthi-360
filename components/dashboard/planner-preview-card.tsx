"use client";

import Link from "next/link";
import { CalendarCheck, ArrowRight, CloudSun, CheckCircle2 } from "lucide-react";
import { useFarmProfile } from "@/lib/farm-context";
import { usePlanner } from "@/lib/planner/task-store";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge, DataSourceTag } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * PlannerPreviewCard — dashboard entry to the Farm Planner.
 * Shows Today's Plan count, weather-aware count, and the next tasks.
 * State-driven: CTA to select a crop when the plan cannot be built.
 */
export function PlannerPreviewCard() {
  const { profile, isProfileEmpty } = useFarmProfile();
  const { tasks } = usePlanner();
  const { snapshot } = useWeather(profile.location);
  const { t } = useLanguage();
  const weatherAction = snapshot
    ? deriveFarmWeatherAction(snapshot, profile)
    : null;

  const active = tasks.filter(
    (t) => t.status === "planned" || t.status === "in-progress"
  );
  const todayCount = active.filter(
    (t) => t.dueAt <= new Date().toISOString().slice(0, 10)
  ).length;
  const weatherCount = active.filter((t) => t.weatherDependency).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const nextTasks = active.slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.dashboard.plannerTitle}</CardTitle>
        <DataSourceTag source="rules-based" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isProfileEmpty ? (
          <p className="text-sm text-loam-600">
            {t.dashboard.plannerSetupHint}
          </p>
        ) : !profile.selectedCrop ? (
          <p className="text-sm text-loam-600">
            {t.dashboard.plannerCropHint}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge tone="accent">
                <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
                {t.dashboard.plannerDueToday(todayCount)}
              </Badge>
              {weatherCount > 0 ? (
                <Badge tone="info">
                  <CloudSun className="h-3.5 w-3.5" aria-hidden />
                  {t.dashboard.plannerWeatherAware(weatherCount)}
                </Badge>
              ) : null}
              {completedCount > 0 ? (
                <Badge tone="success">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  {t.dashboard.plannerCompleted(completedCount)}
                </Badge>
              ) : null}
            </div>
            {nextTasks.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {nextTasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-2 text-sm text-loam-700">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-canopy-400" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-canopy-900">
                        {task.title}
                      </span>
                      <span className="text-xs text-loam-500">{t.common.duePrefix(task.dueAt)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-loam-600">
                {t.dashboard.plannerNoTasks}
              </p>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">
          {weatherAction
            ? t.dashboard.plannerWeatherAction(weatherAction.title)
            : t.dashboard.plannerDecisionEngine}
        </p>
        <Link
          href="/planner"
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
        >
          {t.dashboard.plannerOpen}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
