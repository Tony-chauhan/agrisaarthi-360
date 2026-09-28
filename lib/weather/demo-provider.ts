import type { WeatherSnapshot } from "@/lib/weather/types";
import { describeWeatherCode } from "@/lib/weather/weather-utils";

/**
 * DETERMINISTIC DEMO WEATHER PROVIDER
 *
 * Fixed, believable dataset — never random, never changes between refreshes
 * so the golden demo stays predictable. Labeled "demo" with isFallback true.
 * Values chosen to trigger the rain rule (high rain probability tomorrow),
 * matching the classic demo narrative: "delay irrigation".
 */

const DEMO_LOCATION_NAME = "Nashik, Maharashtra, India";

/** Date helper: today's date in ISO, offset by N days. */
function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const DEMO_WEATHER_SNAPSHOT: WeatherSnapshot = {
  location: {
    name: DEMO_LOCATION_NAME,
    latitude: 20.0113,
    longitude: 73.7898,
    country: "India",
    admin1: "Maharashtra",
    timezone: "Asia/Kolkata",
  },
  current: {
    temperatureC: 27.4,
    apparentTemperatureC: 29.1,
    humidityPercent: 58,
    precipitationMm: 0,
    rainMm: 0,
    windKmph: 11.2,
    weatherCode: 2, // Partly cloudy
    condition: describeWeatherCode(2),
  },
  forecast: [
    {
      date: isoDay(0),
      temperatureMaxC: 29,
      temperatureMinC: 16,
      precipitationProbabilityPercent: 65,
      precipitationMm: 4.2,
      weatherCode: 61,
      condition: describeWeatherCode(61), // Rain
    },
    {
      date: isoDay(1),
      temperatureMaxC: 26,
      temperatureMinC: 15,
      precipitationProbabilityPercent: 80,
      precipitationMm: 8.1,
      weatherCode: 63,
      condition: describeWeatherCode(63), // Rain
    },
    {
      date: isoDay(2),
      temperatureMaxC: 30,
      temperatureMinC: 17,
      precipitationProbabilityPercent: 15,
      precipitationMm: 0,
      weatherCode: 1,
      condition: describeWeatherCode(1), // Mainly clear
    },
  ],
  source: "demo",
  sourceType: "demo-fallback",
  isFallback: true,
  fetchedAt: new Date().toISOString(),
};

/** Return the fixed demo snapshot (deterministic except the fetch timestamp). */
export function getDemoWeather(): WeatherSnapshot {
  return {
    ...DEMO_WEATHER_SNAPSHOT,
    fetchedAt: new Date().toISOString(),
  };
}
