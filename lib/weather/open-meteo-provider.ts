import type { ResolvedLocation } from "@/lib/weather/types";

/**
 * OPEN-METEO PROVIDER — server-side only (called from the API route).
 * No API key required for non-commercial use; none is read or needed.
 * All failures throw WeatherProviderError and are converted to the demo
 * fallback by the service layer — never surfaced as raw errors.
 */

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

/** Timeout for each provider request (ms). */
const PROVIDER_TIMEOUT_MS = 10_000;

export class WeatherProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherProviderError";
  }
}

/* ------------------------------------------------------------------ */
/* Geocoding                                                           */
/* ------------------------------------------------------------------ */

interface GeocodingResult {
  name?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

/** Resolve a farm location string to coordinates. */
export async function geocodeLocation(
  location: string
): Promise<ResolvedLocation> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const url = `${GEOCODING_URL}?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      throw new WeatherProviderError(`Geocoding failed (${res.status})`);
    }

    const data = (await res.json()) as GeocodingResponse;
    const best = data.results?.[0];

    if (
      !best ||
      typeof best.latitude !== "number" ||
      typeof best.longitude !== "number"
    ) {
      throw new WeatherProviderError("No geocoding result for location");
    }

    return {
      name: [best.name, best.admin1, best.country].filter(Boolean).join(", "),
      latitude: best.latitude,
      longitude: best.longitude,
      country: best.country,
      admin1: best.admin1,
      timezone: best.timezone,
    };
  } catch (err) {
    if (err instanceof WeatherProviderError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new WeatherProviderError("Geocoding timed out");
    }
    throw new WeatherProviderError("Geocoding request failed");
  } finally {
    clearTimeout(timeout);
  }
}

/* ------------------------------------------------------------------ */
/* Forecast                                                            */
/* ------------------------------------------------------------------ */

/** Raw forecast response subset we consume (normalized afterwards). */
export interface RawForecastResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    rain?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
    weather_code?: number[];
  };
}

/**
 * Fetch current conditions + 3-day forecast for coordinates.
 * Requested units are metric; wind in km/h.
 */
export async function fetchForecast(
  latitude: number,
  longitude: number
): Promise<RawForecastResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code",
    forecast_days: "3",
    timezone: "auto",
    wind_speed_unit: "kmh",
  });

  try {
    const res = await fetch(`${FORECAST_URL}?${params.toString()}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new WeatherProviderError(`Forecast failed (${res.status})`);
    }

    const data = (await res.json()) as RawForecastResponse;
    if (!data || typeof data !== "object") {
      throw new WeatherProviderError("Malformed forecast response");
    }
    return data;
  } catch (err) {
    if (err instanceof WeatherProviderError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new WeatherProviderError("Forecast timed out");
    }
    throw new WeatherProviderError("Forecast request failed");
  } finally {
    clearTimeout(timeout);
  }
}
