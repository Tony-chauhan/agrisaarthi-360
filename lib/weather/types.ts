import type { DataSource } from "@/lib/types";

/**
 * WEATHER CONTRACT
 *
 * Raw Open-Meteo JSON never leaves the provider layer — the app consumes
 * WeatherSnapshot only. Live results are labeled "live-api"; deterministic
 * fallback results are labeled "demo" and flagged isFallback.
 */

/* ------------------------------------------------------------------ */
/* Location resolution                                                 */
/* ------------------------------------------------------------------ */

/** Lightweight geocoding result — no raw provider payloads retained. */
export interface ResolvedLocation {
  /** Human-readable place, e.g. "Panipat, Haryana, India". */
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

/* ------------------------------------------------------------------ */
/* Normalized weather model                                            */
/* ------------------------------------------------------------------ */

/** Normalized current conditions. */
export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC?: number;
  humidityPercent?: number;
  precipitationMm?: number;
  rainMm?: number;
  windKmph: number;
  weatherCode: number;
  /** Human-readable condition derived from the WMO code, e.g. "Partly cloudy". */
  condition: string;
}

/** One forecast day (normalized). */
export interface ForecastDay {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  /** Precipitation probability in percent (0–100), when available. */
  precipitationProbabilityPercent?: number;
  precipitationMm?: number;
  weatherCode: number;
  condition: string;
}

/** The application weather model — fully normalized and typed. */
export interface WeatherSnapshot {
  location: ResolvedLocation;
  current: CurrentWeather;
  /** Next 3 days, today first. */
  forecast: ForecastDay[];
  source: DataSource;
  sourceType: "live" | "demo-fallback";
  isFallback: boolean;
  /** ISO timestamp of fetch. */
  fetchedAt: string;
}

/** Outcome returned by the client-facing weather service. */
export type WeatherServiceResult =
  | { status: "success"; snapshot: WeatherSnapshot }
  | { status: "unavailable" };

/* ------------------------------------------------------------------ */
/* Weather → farm action                                               */
/* ------------------------------------------------------------------ */

export type ActionPriority = "caution" | "monitor" | "normal";

export type ActionCategory =
  | "irrigation"
  | "excess-water"
  | "heat"
  | "operations"
  | "monitoring";

/** Deterministic rules-engine output. */
export interface FarmWeatherAction {
  title: string;
  message: string;
  priority: ActionPriority;
  category: ActionCategory;
  /** Why this action was suggested (references the trigger). */
  reason: string;
  recommendation: string;
  caveat: string;
}

/* ------------------------------------------------------------------ */
/* Client hook state                                                   */
/* ------------------------------------------------------------------ */

export type WeatherStatus = "idle" | "loading" | "ready" | "unavailable";
