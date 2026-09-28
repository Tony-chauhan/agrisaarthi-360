import type {
  ForecastDay,
  ResolvedLocation,
  WeatherServiceResult,
  WeatherSnapshot,
} from "@/lib/weather/types";
import {
  geocodeLocation,
  fetchForecast,
  WeatherProviderError,
  type RawForecastResponse,
} from "@/lib/weather/open-meteo-provider";
import { getDemoWeather } from "@/lib/weather/demo-provider";
import {
  normalizeCurrent,
  normalizeForecastDay,
} from "@/lib/weather/weather-utils";

/**
 * WEATHER SERVICE — orchestrates geocoding + forecast and guarantees the
 * caller always receives a usable WeatherServiceResult. Any provider
 * failure (geocoding, forecast, timeout, malformed data) becomes the
 * deterministic demo fallback. Never throws to the caller.
 */

/* ------------------------------------------------------------------ */
/* Normalization                                                       */
/* ------------------------------------------------------------------ */

/** Normalize a raw Open-Meteo forecast response into WeatherSnapshot. */
export function normalizeWeather(
  raw: RawForecastResponse,
  location: ResolvedLocation,
  sourceType: "live" | "demo-fallback"
): WeatherSnapshot | null {
  const current = normalizeCurrent({
    temperatureC: raw.current?.temperature_2m,
    apparentTemperatureC: raw.current?.apparent_temperature,
    humidityPercent: raw.current?.relative_humidity_2m,
    precipitationMm: raw.current?.precipitation,
    rainMm: raw.current?.rain,
    windKmph: raw.current?.wind_speed_10m,
    weatherCode: raw.current?.weather_code,
  });

  if (!current) return null;

  const times = raw.daily?.time ?? [];
  const forecast = times
    .slice(0, 3)
    .map((date, i): ForecastDay | null =>
      normalizeForecastDay({
        date,
        temperatureMaxC: raw.daily?.temperature_2m_max?.[i],
        temperatureMinC: raw.daily?.temperature_2m_min?.[i],
        precipitationProbabilityPercent:
          raw.daily?.precipitation_probability_max?.[i],
        precipitationMm: raw.daily?.precipitation_sum?.[i],
        weatherCode: raw.daily?.weather_code?.[i],
      })
    )
    .filter((d): d is ForecastDay => d !== null);

  if (forecast.length === 0) return null;

  return {
    location,
    current,
    forecast,
    source: sourceType === "live" ? "live-api" : "demo",
    sourceType,
    isFallback: sourceType === "demo-fallback",
    fetchedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Live fetch                                                          */
/* ------------------------------------------------------------------ */

/** Internal live fetch — throws WeatherProviderError on any failure. */
async function fetchLiveWeather(
  location: string
): Promise<WeatherSnapshot> {
  const resolved = await geocodeLocation(location);
  const raw = await fetchForecast(resolved.latitude, resolved.longitude);
  const snapshot = normalizeWeather(raw, resolved, "live");
  if (!snapshot) {
    throw new WeatherProviderError("Malformed weather data");
  }
  return snapshot;
}

/* ------------------------------------------------------------------ */
/* Fallback                                                            */
/* ------------------------------------------------------------------ */

/** Deterministic demo snapshot — labeled demo, never random. */
export function getDemoSnapshot(): WeatherSnapshot {
  return getDemoWeather();
}

/* ------------------------------------------------------------------ */
/* Small server-side cache (dedupes geocoding + forecast)              */
/* ------------------------------------------------------------------ */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { snapshot: WeatherSnapshot; at: number }>();

function cacheKey(location: string): string {
  return location.trim().toLowerCase();
}

export function getCachedWeather(location: string): WeatherSnapshot | null {
  const entry = cache.get(cacheKey(location));
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(cacheKey(location));
    return null;
  }
  return entry.snapshot;
}

export function setCachedWeather(
  location: string,
  snapshot: WeatherSnapshot
): void {
  // Only cache live results; demo fallbacks stay cheap to recompute.
  if (snapshot.sourceType !== "live") return;
  cache.set(cacheKey(location), { snapshot, at: Date.now() });
}

/** Manual cache clear (used by refresh when bypassing cache). */
export function clearWeatherCache(location?: string): void {
  if (location) {
    cache.delete(cacheKey(location));
  } else {
    cache.clear();
  }
}

/* ------------------------------------------------------------------ */
/* Public entry — never throws                                         */
/* ------------------------------------------------------------------ */

/**
 * Get weather for a farm location.
 * `bypassCache` supports the manual "Refresh weather" button.
 */
export async function getWeatherForFarm(
  location: string,
  options: { bypassCache?: boolean } = {}
): Promise<WeatherServiceResult> {
  const trimmed = location.trim();

  // Empty location: do NOT fabricate coordinates or guess a default
  // farm — report unavailable (the API route maps this to 400).
  if (trimmed === "") {
    return { status: "unavailable" };
  }

  try {
    if (!options.bypassCache) {
      const cached = getCachedWeather(trimmed);
      if (cached) {
        return { status: "success", snapshot: cached };
      }
    }

    const snapshot = await fetchLiveWeather(trimmed);
    setCachedWeather(trimmed, snapshot);
    return { status: "success", snapshot };
  } catch {
    // Geocoding failure, forecast failure, timeout, malformed data, etc.
    return { status: "success", snapshot: getDemoSnapshot() };
  }
}
