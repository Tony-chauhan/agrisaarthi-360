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
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-loam-500">
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

  const weatherAction = snapshot ? deriveFarmWeatherAction(snapshot, profile) : null;

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
        title="Weather"
        href="/weather"
        source={
          snapshot ? (
            <DataSourceTag source={snapshot.source} />
          ) : weatherStatus === "unavailable" ? (
            <span className="text-[11px] font-medium text-harvest-600">Unavailable</span>
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
              ? "Weather unavailable right now."
              : "Loading conditions…"}
          </KpiSub>
        )}
      </KpiCard>

      {/* CROP */}
      <KpiCard
        icon={Sprout}
        title="Crop"
        href="/crop-advisor"
        source={<DataSourceTag source="rules-based" />}
      >
        {profile.selectedCrop ? (
          <>
            <KpiValue>{profile.selectedCrop}</KpiValue>
            <KpiSub>
              {SEASON_LABEL[profile.season] ?? profile.season} season ·{" "}
              {profile.soilType} soil
            </KpiSub>
          </>
        ) : topRecommendation ? (
          <>
            <KpiValue>{topRecommendation.crop}</KpiValue>
            <KpiSub>Recommended · {topRecommendation.suitability} suitability</KpiSub>
          </>
        ) : (
          <>
            <KpiValue>—</KpiValue>
            <KpiSub>No crop selected yet</KpiSub>
          </>
        )}
      </KpiCard>

      {/* CROP HEALTH */}
      <KpiCard
        icon={ScanHeart}
        title="Crop Health"
        href="/crop-health"
        source={latestHealthCheck ? <DataSourceTag source={latestHealthCheck.source} /> : null}
      >
        {latestHealthCheck ? (
          <>
            <KpiValue>{latestHealthCheck.crop}</KpiValue>
            <KpiSub>
              {latestHealthCheck.possibleCondition} · {latestHealthCheck.likelihood}
            </KpiSub>
            <span className="text-[11px] text-loam-500">
              Checked{" "}
              {new Date(latestHealthCheck.analyzedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </>
        ) : (
          <>
            <KpiValue>—</KpiValue>
            <KpiSub>Not available yet — run a check in Crop Health.</KpiSub>
          </>
        )}
      </KpiCard>

      {/* TODAY'S PLAN */}
      <KpiCard
        icon={CalendarCheck}
        title="Today's Plan"
        href="/planner"
        source={<DataSourceTag source="rules-based" />}
      >
        {tasks.length > 0 ? (
          <>
            <KpiValue>
              {dueToday.length} due · {completed.length} done
            </KpiValue>
            {nextTask ? (
              <KpiSub>Next: {nextTask.title}</KpiSub>
            ) : (
              <KpiSub>All clear for today.</KpiSub>
            )}
          </>
        ) : (
          <>
            <KpiValue>—</KpiValue>
            <KpiSub>Not available yet — generate your farm plan.</KpiSub>
          </>
        )}
      </KpiCard>
    </div>
  );
}
