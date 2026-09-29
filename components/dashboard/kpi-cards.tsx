"use client";

import Link from "next/link";
import {
  CloudSun,
  Sprout,
  ScanHeart,
  CalendarCheck,
  ArrowUpRight,
} from "lucide-react";
import { useFarmProfile } from "@/lib/farm-context";
import { usePlanner } from "@/lib/planner/task-store";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";
import { recommendCrops } from "@/lib/crop-recommendation";
import { DataSourceTag } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/cn";

/**
 * KPI STATUS CARDS — the four-metric row (brief §7).
 * Every value comes from real application state; when data doesn't exist
 * yet the card says "Not available yet" instead of inventing anything.
 */

const SEASON_LABEL: Record<string, string> = {
  kharif: "Kharif",
  rabi: "Rabi",
  zaid: "Zaid",
};

function KpiCard({
  icon: Icon,
  title,
  href,
  source,
  children,
  className,
}: {
  icon: typeof CloudSun;
  title: string;
  href: string;
  source?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group card-surface dashboard-enter flex min-h-[9.5rem] flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2",
        className
      )}
    >
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-loam-500">
          <Icon className="h-4 w-4 text-canopy-600" aria-hidden />
          {title}
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-canopy-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-terracotta-600"
          aria-hidden
        />
      </span>
      <span className="mt-3 flex flex-1 flex-col justify-between gap-2">{children}</span>
      {source ? <span className="mt-2">{source}</span> : null}
    </Link>
  );
}

function KpiValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-2xl font-semibold leading-tight text-canopy-950">
      {children}
    </span>
  );
}

function KpiSub({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-loam-600">{children}</span>;
}

export function KpiCards() {
  const { profile, latestHealthCheck } = useFarmProfile();
  const { tasks } = usePlanner();
  const { snapshot, status: weatherStatus } = useWeather(profile.location);
  const { t, lang } = useLanguage();

  const weatherAction = snapshot ? deriveFarmWeatherAction(snapshot, profile, lang) : null;

  const topRecommendation = (() => {
    try {
      return recommendCrops({
        location: profile.location,
        season: profile.season,
        farmSizeAcres: profile.farmSizeAcres,
        irrigation: profile.irrigation,
        soilType: profile.soilType,
      }).recommendations[0] ?? null;
    } catch {
      return null;
    }
  })();

  const today = new Date().toISOString().slice(0, 10);
  const active = tasks.filter((t) => t.status !== "completed");
  const dueToday = active.filter((t) => t.dueAt <= today);
  const completed = tasks.filter((t) => t.status === "completed");
  const nextTask = dueToday[0] ?? active[0] ?? null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* WEATHER */}
      <KpiCard
        icon={CloudSun}
        title={t.dashboard.kpiWeather}
        href="/weather"
        source={
          snapshot ? (
            <DataSourceTag source={snapshot.source} />
          ) : weatherStatus === "unavailable" ? (
            <span className="text-xs font-medium text-harvest-600">{t.dashboard.kpiUnavailable}</span>
          ) : null
        }
      >
        {snapshot ? (
          <>
            <KpiValue>
              {Math.round(snapshot.current.temperatureC)}°C
            </KpiValue>
            <KpiSub>{snapshot.current.condition}</KpiSub>
            {weatherAction ? (
              <span className="rounded-lg bg-terracotta-500/10 px-2.5 py-1.5 text-xs font-medium text-terracotta-700">
                {weatherAction.title}
              </span>
            ) : null}
          </>
        ) : (
          <KpiSub>
            {weatherStatus === "unavailable"
              ? t.dashboard.kpiWeatherUnavailable
              : t.dashboard.kpiLoadingConditions}
          </KpiSub>
        )}
      </KpiCard>

      {/* CROP */}
      <KpiCard
        icon={Sprout}
        title={t.dashboard.kpiCrop}
        href="/crop-advisor"
        source={<DataSourceTag source="rules-based" />}
      >
        {profile.selectedCrop ? (
          <>
            <KpiValue>{profile.selectedCrop}</KpiValue>
            <KpiSub>
              {t.dashboard.kpiSeasonSoil(
                t.common.seasons[profile.season],
                profile.soilType,
              )}
            </KpiSub>
          </>
        ) : topRecommendation ? (
          <>
            <KpiValue>{topRecommendation.crop}</KpiValue>
            <KpiSub>
              {t.dashboard.kpiRecommended(topRecommendation.suitability)}
            </KpiSub>
          </>
        ) : (
          <>
            <KpiValue>—</KpiValue>
            <KpiSub>{t.dashboard.kpiNoCropSelected}</KpiSub>
          </>
        )}
      </KpiCard>

      {/* CROP HEALTH */}
      <KpiCard
        icon={ScanHeart}
        title={t.dashboard.kpiCropHealth}
        href="/crop-health"
        source={latestHealthCheck ? <DataSourceTag source={latestHealthCheck.source} /> : null}
      >
        {latestHealthCheck ? (
          <>
            <KpiValue>{latestHealthCheck.crop}</KpiValue>
            <KpiSub>
              {latestHealthCheck.possibleCondition} · {latestHealthCheck.likelihood}
            </KpiSub>
            <span className="text-xs text-loam-500">
              {t.dashboard.kpiCheckedOn(
                new Date(latestHealthCheck.analyzedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                }),
              )}
            </span>
          </>
        ) : (
          <>
            <KpiValue>—</KpiValue>
            <KpiSub>{t.dashboard.kpiNotChecked}</KpiSub>
          </>
        )}
      </KpiCard>

      {/* TODAY'S PLAN */}
      <KpiCard
        icon={CalendarCheck}
        title={t.dashboard.kpiTodayPlan}
        href="/planner"
        source={<DataSourceTag source="rules-based" />}
      >
        {tasks.length > 0 ? (
          <>
            <KpiValue>{t.dashboard.kpiDueDone(dueToday.length, completed.length)}</KpiValue>
            {nextTask ? (
              <KpiSub>{t.dashboard.kpiNextTask(nextTask.title)}</KpiSub>
            ) : (
              <KpiSub>{t.dashboard.kpiAllClear}</KpiSub>
            )}
          </>
        ) : (
          <>
            <KpiValue>—</KpiValue>
            <KpiSub>{t.dashboard.kpiGeneratePlan}</KpiSub>
          </>
        )}
      </KpiCard>
    </div>
  );
}
