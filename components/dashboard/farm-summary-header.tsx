"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Ruler,
  CalendarDays,
  Sprout,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { useFarmProfile } from "@/lib/farm-context";
import { usePlanner } from "@/lib/planner/task-store";
import { useWeather } from "@/lib/weather/use-weather";

/**
 * FARM SUMMARY HEADER — "Good morning, Ramesh" premium panel.
 * Every value comes from the real FarmProvider / planner / weather state.
 * Nothing is fabricated: unavailable data says so.
 */

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const SEASON_LABEL: Record<string, string> = {
  kharif: "Kharif",
  rabi: "Rabi",
  zaid: "Zaid",
};

export function FarmSummaryHeader() {
  const { profile, isProfileEmpty, latestHealthCheck, latestOperation } =
    useFarmProfile();
  const { tasks } = usePlanner();
  const { snapshot } = useWeather(profile.location);

  /* Time-based greeting set after mount — keeps SSR and the first client
     render identical (no hydration mismatch), then personalizes. */
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => {
    setGreeting(greetingFor(new Date()));
  }, []);

  if (isProfileEmpty) {
    return (
      <section className="dashboard-enter rounded-2xl bg-emerald-ink px-6 py-8 shadow-deep sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lime">
          Welcome to AgriSaarthi 360
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
          One farm context. Every decision connected.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/75">
          Create your farm profile once — crop advice, weather actions, crop
          health and operations all build on it.
        </p>
        <Link
          href="/farm-profile"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-terracotta-600 px-5 text-sm font-semibold text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-terracotta-700"
        >
          <ClipboardList className="h-4 w-4" aria-hidden />
          Set up your farm profile
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    );
  }

  const firstName = profile.farmerName.split(" ")[0];
  const today = new Date().toISOString().slice(0, 10);
  const active = tasks.filter((t) => t.status !== "completed");
  const dueToday = active.filter((t) => t.dueAt <= today);
  const nextAction = dueToday[0] ?? active[0] ?? null;

  const chips = [
    { icon: MapPin, text: profile.location },
    { icon: Ruler, text: `${profile.farmSizeAcres} acres` },
    { icon: CalendarDays, text: `${SEASON_LABEL[profile.season] ?? profile.season} season` },
    { icon: Sprout, text: profile.selectedCrop ?? "No crop selected" },
  ];

  const status = [
    { label: "Farm configured", done: true, href: "/farm-profile" },
    { label: profile.selectedCrop ?? "Crop not selected", done: Boolean(profile.selectedCrop), href: "/crop-advisor" },
    {
      label: snapshot
        ? `${Math.round(snapshot.current.temperatureC)}°C · ${snapshot.current.condition}`
        : "Weather loading…",
      done: Boolean(snapshot),
      href: "/weather",
    },
    {
      label: nextAction ? `Next: ${nextAction.title}` : "Plan not generated yet",
      done: Boolean(nextAction),
      href: "/planner",
    },
  ];

  return (
    <section className="dashboard-enter rounded-2xl bg-emerald-ink px-6 py-8 shadow-deep sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lime">
            Farm overview
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
            {greeting}, {firstName}
          </h1>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Farm context">
            {chips.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90"
              >
                <Icon className="h-3.5 w-3.5 text-lime" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
        {profile.selectedCrop ? null : (
          <Link
            href="/crop-advisor"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/25 transition-colors hover:bg-white/20"
          >
            <Sprout className="h-4 w-4 text-lime" aria-hidden />
            Choose a crop to personalise guidance
          </Link>
        )}
      </div>

      {/* Compact contextual summary */}
      <ul
        className="mt-6 grid gap-2 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Farm status"
      >
        {status.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="group flex min-h-11 items-center justify-between gap-2 rounded-xl bg-white/5 px-3.5 py-2.5 ring-1 ring-white/10 transition-colors hover:bg-white/10"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    item.done ? "bg-lime" : "bg-white/30"
                  }`}
                />
                <span className="truncate text-sm text-white/85">{item.label}</span>
              </span>
              <ArrowRight
                className="h-3.5 w-3.5 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>

      {(latestHealthCheck || latestOperation) && (
        <p className="mt-4 text-xs text-white/60">
          {latestHealthCheck
            ? `Last health check: ${latestHealthCheck.crop} — ${latestHealthCheck.possibleCondition} (${latestHealthCheck.likelihood})`
            : null}
          {latestHealthCheck && latestOperation ? " · " : null}
          {latestOperation ? `Latest operation: ${latestOperation.operationName}` : null}
        </p>
      )}
    </section>
  );
}
