"use client";

import Link from "next/link";
import { ArrowRight, Thermometer, Wind, Droplets, Umbrella, RefreshCw } from "lucide-react";
import { WEATHER_ACTION } from "../copy";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { useFarmProfile } from "@/lib/farm-context";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";

/**
 * WEATHER → ACTION — the differentiator, shown as DATA → DECISION.
 * Left: real live conditions (the app's own API). Right: the actual
 * decision-rule output. Live vs cached is labeled; nothing is invented.
 */
export function WeatherAction() {
  const { profile } = useFarmProfile();
  const { snapshot, status, refresh } = useWeather(profile.location);
  const action = snapshot ? deriveFarmWeatherAction(snapshot, profile) : null;

  const metrics = snapshot
    ? [
        {
          icon: Thermometer,
          label: "Temperature",
          value: `${Math.round(snapshot.current.temperatureC)}°C`,
        },
        {
          icon: Umbrella,
          label: "Rain chance",
          value:
            snapshot.forecast[0]?.precipitationProbabilityPercent !== undefined
              ? `${snapshot.forecast[0].precipitationProbabilityPercent}%`
              : "—",
        },
        {
          icon: Wind,
          label: "Wind",
          value: `${Math.round(snapshot.current.windKmph)} km/h`,
        },
        {
          icon: Droplets,
          label: "Humidity",
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
              {WEATHER_ACTION.eyebrow}
            </p>
          </Reveal>
          <SplitText
            id="weather-heading"
            as="h2"
            lines={WEATHER_ACTION.headlineLines}
            className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-canopy-950 sm:text-6xl lg:text-7xl"
          />
          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-loam-700 sm:text-lg">
              {WEATHER_ACTION.body}
            </p>
          </Reveal>
        </div>

        {/* DATA → DECISION composition */}
        <Reveal delay={260}>
          <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
            {/* WEATHER data */}
            <div className="rounded-2xl border border-canopy-200 bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-canopy-100 px-6 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-loam-500">
                  Weather
                </p>
                {snapshot ? (
                  <span className="flex items-center gap-2">
                    <span className="source-tag border-canopy-200 bg-canopy-50 text-canopy-700">
                      {snapshot.isFallback
                        ? WEATHER_ACTION.dataLabels.fallback
                        : WEATHER_ACTION.dataLabels.live}
                    </span>
                    <button
                      type="button"
                      onClick={refresh}
                      aria-label="Refresh weather"
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
                          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-loam-500">
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
                      ? "Weather is unavailable right now — the action panel shows the rule that would apply."
                      : "Loading live conditions…"}
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                  Farm action
                </p>
                <span className="source-tag border-lime/30 bg-lime/10 text-lime">
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
                      <span className="font-semibold text-white/75">Why: </span>
                      {action.reason}
                    </p>
                  </>
                ) : (
                  <p className="py-6 text-sm text-white/65">
                    {status === "unavailable"
                      ? "Awaiting conditions — the transparent rules compare rain, heat and wind thresholds before suggesting anything."
                      : "Reading conditions…"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-10">
            <Link
              href={WEATHER_ACTION.cta.href}
              className="group inline-flex min-h-12 items-center gap-2 text-base font-semibold text-terracotta-700"
            >
              {WEATHER_ACTION.cta.label}
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
