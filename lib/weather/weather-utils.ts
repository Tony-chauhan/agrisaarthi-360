import type { CurrentWeather, ForecastDay } from "@/lib/weather/types";

/**
 * WMO WEATHER CODES + small validation helpers.
 * Shared by the Open-Meteo provider (interpretation) and the demo provider
 * ( believable fixed codes). Deterministic mapping only — no randomness.
 */

/** WMO weather interpretation codes (0–99). */
export function describeWeatherCode(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 56 || code === 57) return "Freezing drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code === 66 || code === 67) return "Freezing rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code === 80 || code === 81 || code === 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Thunderstorm with hail";
  return "Mixed conditions";
}

/** Rainy WMO codes used by the action rules. */
export function isRainyCode(code: number): boolean {
  return (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    code === 95 ||
    code === 96 ||
    code === 99
  );
}

/** Validate a number field; undefined when missing/non-finite. */
export function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Validate a required number; null when missing/non-finite. */
export function requiredNumber(value: unknown): number | null {
  return asNumber(value) !== undefined ? (value as number) : null;
}

/** Normalize one raw forecast day; null when required fields are missing. */
export function normalizeForecastDay(raw: {
  date?: unknown;
  temperatureMaxC?: unknown;
  temperatureMinC?: unknown;
  precipitationProbabilityPercent?: unknown;
  precipitationMm?: unknown;
  weatherCode?: unknown;
}): ForecastDay | null {
  const date = typeof raw.date === "string" ? raw.date : null;
  const temperatureMaxC = requiredNumber(raw.temperatureMaxC);
  const temperatureMinC = requiredNumber(raw.temperatureMinC);
  const weatherCode = asNumber(raw.weatherCode);

  if (
    !date ||
    temperatureMaxC === null ||
    temperatureMinC === null ||
    weatherCode === undefined
  ) {
    return null;
  }

  return {
    date,
    temperatureMaxC,
    temperatureMinC,
    precipitationProbabilityPercent: asNumber(raw.precipitationProbabilityPercent),
    precipitationMm: asNumber(raw.precipitationMm),
    weatherCode,
    condition: describeWeatherCode(weatherCode),
  };
}

/** Normalize current weather; null when required fields are missing. */
export function normalizeCurrent(raw: {
  temperatureC?: unknown;
  apparentTemperatureC?: unknown;
  humidityPercent?: unknown;
  precipitationMm?: unknown;
  rainMm?: unknown;
  windKmph?: unknown;
  weatherCode?: unknown;
}): CurrentWeather | null {
  const temperatureC = requiredNumber(raw.temperatureC);
  const windKmph = requiredNumber(raw.windKmph);
  const weatherCode = asNumber(raw.weatherCode);

  if (temperatureC === null || windKmph === null || weatherCode === undefined) {
    return null;
  }

  return {
    temperatureC,
    apparentTemperatureC: asNumber(raw.apparentTemperatureC),
    humidityPercent: asNumber(raw.humidityPercent),
    precipitationMm: asNumber(raw.precipitationMm),
    rainMm: asNumber(raw.rainMm),
    windKmph,
    weatherCode,
    condition: describeWeatherCode(weatherCode),
  };
}
