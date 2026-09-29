"use client";

import {
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  ArrowRight,
  RefreshCw,
  CloudSun,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DataSourceTag } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/states";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";
import { useFarmProfile } from "@/lib/farm-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type {
  FarmWeatherAction,
  WeatherSnapshot,
} from "@/lib/weather/types";

/**
 * WeatherActionCard — weather is never a dead end.
 * State-driven: loading skeleton → live (LIVE API) or fallback (FALLBACK).
 * The Farm Action block is the visual centerpiece.
 */

function ActionBlock({ action }: { action: FarmWeatherAction }) {
  const { t } = useLanguage();
  return (
    <div className="mt-4 rounded-xl border-l-4 border-terracotta-600 bg-terracotta-500/5 px-4 py-3.5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terracotta-600">
        {t.featureCards.actionBlockLabel}
      </p>
      <p className="mt-1 font-display text-base font-semibold text-canopy-950">
        {action.title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-loam-700">
        {action.message}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-loam-600">
        <span className="font-semibold text-canopy-800">{t.featureCards.actionWhy}</span>
        {action.reason}
      </p>
    </div>
  );
}

function WeatherBody({
  snapshot,
  action,
  compact,
}: {
  snapshot: WeatherSnapshot;
  action: FarmWeatherAction;
  compact: boolean;
}) {
  const { t } = useLanguage();
  const metrics = [
    {
      icon: Thermometer,
      label: t.featureCards.metricTemperature,
      value: `${Math.round(snapshot.current.temperatureC)}°C`,
    },
    {
      icon: CloudRain,
      label: t.featureCards.metricRainChance,
      value: `${
        snapshot.forecast[0]?.precipitationProbabilityPercent ?? 0
      }%`,
    },
    {
      icon: Droplets,
      label: t.featureCards.metricHumidity,
      value:
        snapshot.current.humidityPercent !== undefined
          ? `${Math.round(snapshot.current.humidityPercent)}%`
          : "—",
    },
    {
      icon: Wind,
      label: t.featureCards.metricWind,
      value: `${Math.round(snapshot.current.windKmph)} km/h`,
    },
  ];

  return (
    <>
      <div
        className={
          compact
            ? "grid grid-cols-2 gap-2"
            : "grid grid-cols-2 gap-3 sm:grid-cols-4"
        }
      >
        {metrics.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl bg-loam-50 px-3 py-3 text-center"
          >
            <Icon className="mx-auto h-4 w-4 text-canopy-600" aria-hidden />
            <p className="mt-1.5 text-lg font-semibold text-canopy-900">
              {value}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-loam-500">
              {label}
            </p>
          </div>
        ))}
      </div>
      <ActionBlock action={action} />
    </>
  );
}

export function WeatherActionCard({ compact = false }: { compact?: boolean }) {
  const { profile } = useFarmProfile();
  const { snapshot, status, refresh } = useWeather(profile.location);
  const { t, lang } = useLanguage();
  const action =
    snapshot !== null
      ? deriveFarmWeatherAction(snapshot, profile, lang)
      : null;

  /* ---------------- Loading ---------------- */
  if (status === "idle" || status === "loading" || !snapshot || !action) {
    if (status === "unavailable") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t.featureCards.weatherTitle}</CardTitle>
            <DataSourceTag source="demo" />
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-loam-600">
            <CloudSun className="h-5 w-5 text-canopy-600" aria-hidden />
            {t.featureCards.weatherUnavailable}
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.featureCards.weatherTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonCard className="border-none shadow-none" />
        </CardContent>
      </Card>
    );
  }

  /* ---------------- Ready (live or demo) ---------------- */
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{t.featureCards.weatherTitle}</CardTitle>
          <p className="mt-0.5 text-sm text-loam-600">
            {snapshot.location.name} · {snapshot.current.condition}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceTag source={snapshot.source} />
          <button
            type="button"
            onClick={refresh}
            aria-label={t.featureCards.weatherRefreshAria}
            title={t.featureCards.weatherRefreshAria}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-canopy-200 bg-white text-canopy-700 transition-colors hover:bg-canopy-50"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {snapshot.isFallback ? (
          <p className="mb-3 rounded-lg bg-harvest-500/10 px-3 py-2 text-xs font-medium text-harvest-600">
            {t.featureCards.weatherFallbackNote}
          </p>
        ) : null}
        <WeatherBody snapshot={snapshot} action={action} compact={compact} />
      </CardContent>

      {!compact ? (
        <CardFooter>
          <p className="text-xs text-loam-500">
            {snapshot.isFallback
              ? t.featureCards.weatherFallbackFooter
              : t.featureCards.weatherLiveFooter(new Date(snapshot.fetchedAt).toLocaleTimeString(lang === "hi" ? "hi-IN" : undefined))}
          </p>
          <Link
            href="/weather"
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
          >
            {t.featureCards.weatherFullView}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
