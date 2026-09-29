"use client";

import Link from "next/link";
import { ArrowRight, Thermometer, Wind, Droplets, Umbrella, RefreshCw } from "lucide-react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { useFarmProfile } from "@/lib/farm-context";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * WEATHER → ACTION — the differentiator, shown as DATA → DECISION.
 * Left: real live conditions (the app's own API). Right: the actual
 * decision-rule output. Live vs cached is labeled; nothing is invented.
 */
export function WeatherAction() {
  const { profile } = useFarmProfile();
  const { snapshot, status, refresh } = useWeather(profile.location);
  const { t, lang } = useLanguage();
  const action = snapshot ? deriveFarmWeatherAction(snapshot, profile, lang) : null;
  const L = t.landing;

  const metrics = snapshot
    ? [
        {
          icon: Thermometer,
          label: t.featureCards.metricTemperature,
          value: `${Math.round(snapshot.current.temperatureC)}°C`,
        },
        {
          icon: Umbrella,
          label: t.featureCards.metricRainChance,
          value:
            snapshot.forecast[0]?.precipitationProbabilityPercent !== undefined
              ? `${snapshot.forecast[0].precipitationProbabilityPercent}%`
              : "—",
        },
        {
          icon: Wind,
          label: t.featureCards.metricWind,
          value: `${Math.round(snapshot.current.windKmph)} km/h`,
        },
        {
          icon: Droplets,
          label: t.featureCards.metricHumidity,
          value:
            snapshot.current.humidityPercent !== undefined
              ? `${Math.round(snapshot.current.humidityPercent)}%`
              : "—",
        },
      ]
    : [];

  return (
    <section
      id="intelligence"
      aria-labelledby="weather-heading"
      className="section-anchor bg-ivory px-4 py-28 sm:px-6 lg:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow">
              <span aria-hidden className="h-px w-8 bg-terracotta-600" />
              {L.weatherAction.eyebrow}
            </p>
          </Reveal>
          <SplitText
            id="weather-heading"
            as="h2"
            lines={[...L.weatherAction.headlineLines]}
            className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-canopy-950 sm:text-6xl lg:text-7xl"
          />
          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-loam-700 sm:text-lg">
              {L.weatherAction.body}
            </p>
          </Reveal>
        </div>

        {/* DATA → DECISION composition */}
        <Reveal delay={260}>
          <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
            {/* WEATHER data */}
            <div className="rounded-2xl border border-canopy-200 bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-canopy-100 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-loam-500">
                  {L.weatherPanelLabel}
                </p>
                {snapshot ? (
                  <span className="flex items-center gap-2">
                    <span className="source-tag border-canopy-200 bg-canopy-50 text-canopy-700">
                      {snapshot.isFallback
                        ? L.weatherAction.dataFallback
                        : L.weatherAction.dataLive}
                    </span>
                    <button
                      type="button"
                      onClick={refresh}
                      aria-label={t.featureCards.weatherRefreshAria}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-canopy-200 text-canopy-700 transition-colors hover:bg-canopy-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </span>
                ) : null}
              </div>
              <div className="px-6 py-6">
                {snapshot ? (
                  <>
                    <p className="font-display text-4xl font-semibold tracking-tight text-canopy-950">
                      {Math.round(snapshot.current.temperatureC)}°C
                    </p>
                    <p className="mt-1 text-sm text-loam-600">
                      {snapshot.current.condition} · {profile.location}
                    </p>
                    <ul className="mt-5 grid grid-cols-2 gap-3">
                      {metrics.slice(1).map(({ icon: Icon, label, value }) => (
                        <li key={label} className="rounded-xl bg-loam-50 px-3 py-2.5">
                          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-loam-500">
                            <Icon className="h-3.5 w-3.5 text-canopy-600" aria-hidden />
                            {label}
                          </span>
                          <span className="mt-0.5 block font-display text-lg font-semibold text-canopy-950">
                            {value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="py-6 text-sm text-loam-600">
                    {status === "unavailable"
                      ? L.weatherUnavailableNote
                      : L.weatherLoadingNote}
                  </p>
                )}
              </div>
            </div>

            {/* Transform */}
            <div className="flex items-center justify-center">
              <span
                aria-hidden
                className="flex h-12 w-12 rotate-90 items-center justify-center rounded-full bg-terracotta-600 text-white shadow-lift lg:rotate-0"
              >
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>

            {/* FARM ACTION */}
            <div className="rounded-2xl bg-canopy-950 text-white shadow-deep">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                  {L.actionPanelLabel}
                </p>
            <span className="source-tag border-white/25 bg-white/10 text-white/80">
                  Decision Engine
                </span>
              </div>
              <div className="px-6 py-6">
                {action ? (
                  <>
                    <p className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                      {action.title}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-canopy-100/85">
                      {action.message}
                    </p>
                    <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/55">
                      <span className="font-semibold text-white/75">
                        {L.actionWhyPrefix}
                      </span>
                      {action.reason}
                    </p>
                  </>
                ) : (
                  <p className="py-6 text-sm text-white/65">
                    {status === "unavailable"
                      ? L.actionAwaitingNote
                      : L.actionLoadingNote}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-4">
            <Link
              href="/weather"
              className="group inline-flex min-h-12 items-center gap-2 text-base font-semibold text-terracotta-700"
            >
              {L.weatherAction.cta}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
