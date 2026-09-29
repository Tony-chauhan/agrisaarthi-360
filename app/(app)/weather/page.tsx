"use client";

import { CloudRain, CloudSun, Cloudy, Sun, RefreshCw, Wind } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, DataSourceTag } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/states";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";
import { useFarmProfile } from "@/lib/farm-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { WeatherSnapshot } from "@/lib/weather/types";

/* Accessible icon per WMO-style condition string */
function ConditionIcon({ condition }: { condition: string }) {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) {
    return <CloudRain className="h-5 w-5" aria-hidden />;
  }
  if (c.includes("clear") || c.includes("mainly")) {
    return <Sun className="h-5 w-5" aria-hidden />;
  }
  if (c.includes("cloud") || c.includes("overcast")) {
    return <Cloudy className="h-5 w-5" aria-hidden />;
  }
  return <CloudSun className="h-5 w-5" aria-hidden />;
}

export default function WeatherPage() {
  const { profile } = useFarmProfile();
  const { snapshot, status, refresh } = useWeather(profile.location);
  const { t, lang } = useLanguage();

  const loading = status === "idle" || status === "loading";

  function forecastDayLabel(isoDate: string, index: number): string {
    if (index === 0) return t.common.today;
    if (index === 1) return t.common.tomorrow;
    const d = new Date(isoDate);
    return d.toLocaleDateString(lang === "hi" ? "hi-IN" : undefined, {
      weekday: "long",
    });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow={t.weather.eyebrow}
        title={t.weather.title}
        description={t.weather.description}
      />

      {/* 1 + 2 + 3 — Location, current conditions, farm action */}
      {loading ? (
        <SkeletonCard className="h-64" />
      ) : !snapshot ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.weather.unavailableTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3 text-sm text-loam-600">
            <p>{t.weather.unavailableBody}</p>
            <Button size="sm" variant="secondary" onClick={refresh}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              {t.common.retry}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {snapshot.isFallback ? (
            <p className="rounded-xl bg-harvest-500/10 px-4 py-3 text-sm font-medium text-harvest-600">
              {t.weather.fallbackBanner}
            </p>
          ) : null}

          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t.weather.conditionsTitle}</CardTitle>
                <CardDescription>
                  {t.weather.weatherFor(snapshot.location.name)}
                  {snapshot.location.timezone
                    ? ` · ${snapshot.location.timezone}`
                    : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DataSourceTag source={snapshot.source} />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={refresh}
                  leftIcon={<RefreshCw className="h-4 w-4" aria-hidden />}
                >
                  {t.weather.refreshWeather}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-canopy-50 text-canopy-700">
                    <ConditionIcon condition={snapshot.current.condition} />
                  </span>
                  <div>
                    <p className="font-display text-4xl font-semibold tracking-tight text-canopy-950">
                      {Math.round(snapshot.current.temperatureC)}°C
                    </p>
                    <p className="text-sm text-loam-600">
                      {snapshot.current.condition}
                    </p>
                  </div>
                </div>
                <dl className="grid flex-1 grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div className="rounded-xl bg-loam-50 px-3 py-2.5">
                    <dt className="text-xs font-medium uppercase tracking-wide text-loam-500">
                      {t.weather.feelsLike}
                    </dt>
                    <dd className="mt-0.5 font-semibold text-canopy-900">
                      {snapshot.current.apparentTemperatureC !== undefined
                        ? `${Math.round(snapshot.current.apparentTemperatureC)}°C`
                        : "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-loam-50 px-3 py-2.5">
                    <dt className="text-xs font-medium uppercase tracking-wide text-loam-500">
                      {t.weather.humidity}
                    </dt>
                    <dd className="mt-0.5 font-semibold text-canopy-900">
                      {snapshot.current.humidityPercent !== undefined
                        ? `${Math.round(snapshot.current.humidityPercent)}%`
                        : "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-loam-50 px-3 py-2.5">
                    <dt className="text-xs font-medium uppercase tracking-wide text-loam-500">
                      {t.weather.precipitation}
                    </dt>
                    <dd className="mt-0.5 font-semibold text-canopy-900">
                      {snapshot.current.precipitationMm !== undefined
                        ? `${snapshot.current.precipitationMm.toFixed(1)} mm`
                        : "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-loam-50 px-3 py-2.5">
                    <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-loam-500">
                      <Wind className="h-3 w-3" aria-hidden />
                      {t.weather.wind}
                    </dt>
                    <dd className="mt-0.5 font-semibold text-canopy-900">
                      {Math.round(snapshot.current.windKmph)} km/h
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Farm action — rules-based, the visual centerpiece */}
              {(() => {
                const action = deriveFarmWeatherAction(snapshot, profile, lang);
                return (
                  <div className="mt-5 rounded-xl border-l-4 border-terracotta-600 bg-terracotta-500/5 px-5 py-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-terracotta-600">
                      {t.weather.farmAction}
                      <Badge tone="accent">{t.weather.decisionEngine}</Badge>
                      {action.priority === "caution" ? (
                        <Badge tone="warning">{t.weather.caution}</Badge>
                      ) : (
                        <Badge tone="neutral">{t.weather.normal}</Badge>
                      )}
                    </p>
                    <p className="mt-2 font-display text-lg font-semibold text-canopy-950">
                      {action.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-loam-700">
                      {action.message}
                    </p>
                    <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-loam-500">
                          {t.weather.why}
                        </dt>
                        <dd className="text-loam-700">{action.reason}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-loam-500">
                          {t.weather.recommendation}
                        </dt>
                        <dd className="text-loam-700">
                          {action.recommendation}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-loam-500">
                          {t.weather.caveat}
                        </dt>
                        <dd className="text-loam-700">{action.caveat}</dd>
                      </div>
                    </dl>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* 4 — 3-day forecast */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t.weather.outlookTitle}</CardTitle>
                <CardDescription>
                  {snapshot.isFallback
                    ? t.weather.outlookFallback
                    : t.weather.outlookLive}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {snapshot.forecast.map((day, i) => (
                  <li
                    key={day.date}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-canopy-100 px-4 py-3"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-canopy-600">
                        <ConditionIcon condition={day.condition} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-canopy-900">
                          {forecastDayLabel(day.date, i)}
                        </span>
                        <span className="block text-xs text-loam-600">
                          {day.condition}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-canopy-900">
                        {Math.round(day.temperatureMinC)}–
                        {Math.round(day.temperatureMaxC)}°C
                      </span>
                      <span className="flex items-center gap-1 text-loam-600">
                        <CloudRain className="h-3.5 w-3.5" aria-hidden />
                        {day.precipitationProbabilityPercent !== undefined
                          ? `${day.precipitationProbabilityPercent}%`
                          : "—"}
                      </span>
                      <span className="hidden w-16 text-right text-xs text-loam-500 sm:inline">
                        {day.precipitationMm !== undefined
                          ? `${day.precipitationMm.toFixed(1)} mm`
                          : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-loam-500">
                {snapshot.isFallback
                  ? t.featureCards.weatherFallbackFooter
                  : t.weather.liveFetched(
                      new Date(snapshot.fetchedAt).toLocaleTimeString(lang === "hi" ? "hi-IN" : undefined),
                    )}
                {" · "}
                {t.weather.thresholdsNote}
              </p>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
