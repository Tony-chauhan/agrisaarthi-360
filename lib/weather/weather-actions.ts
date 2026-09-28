import type {
  FarmWeatherAction,
  WeatherSnapshot,
} from "@/lib/weather/types";
import type { FarmProfile } from "@/lib/types";

/**
 * WEATHER → FARM ACTION ENGINE (pure, deterministic rules)
 *
 * CONFIGURED THRESHOLDS — documented, NOT universal agronomic truths:
 *   Rain probability (today or tomorrow)  >= 60%   → irrigation caution
 *   Forecast precipitation (any of 3 days) >= 10mm → excess-water caution
 *   Current temperature                    >= 38°C → heat / water stress
 *   Current wind                           >= 25 km/h → operations caution
 *   No trigger                                     → normal monitoring
 *
 * Priority order: excess-water > irrigation > heat > operations > monitoring.
 * Conservative wording: "consider / review / monitor" — never commands.
 * Farm context personalizes wording only; the weather data is the trigger.
 * No crop is ever invented.
 */

/* ------------------------------------------------------------------ */
/* Thresholds (documented configured values)                            */
/* ------------------------------------------------------------------ */

export const ACTION_THRESHOLDS = {
  rainProbabilityPercent: 60,
  heavyPrecipitationMm: 10,
  heatTemperatureC: 38,
  strongWindKmph: 25,
} as const;

const STANDARD_CAVEAT =
  "Decision-engine rules — check field conditions, soil moisture and crop stage before acting. Not an expert agricultural guarantee.";

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export function deriveFarmWeatherAction(
  weather: WeatherSnapshot,
  profile: Pick<FarmProfile, "selectedCrop" | "irrigation" | "soilType">
): FarmWeatherAction {
  const { current, forecast } = weather;
  const crop = profile.selectedCrop?.trim();
  const cropPhrase = crop ? ` for your ${crop}` : "";
  const cropSuffix = crop ? ` (${crop})` : "";

  /* --- Rain probability across today + tomorrow ------------------- */
  const todayRain = forecast[0]?.precipitationProbabilityPercent ?? 0;
  const tomorrowRain = forecast[1]?.precipitationProbabilityPercent ?? 0;
  const maxRainPercent = Math.max(todayRain, tomorrowRain);

  /* --- Heavy precipitation across the 3-day window ---------------- */
  const maxPrecipMm = Math.max(
    ...forecast.map((d) => d.precipitationMm ?? 0),
    0
  );

  /* --- RULE B — heavy precipitation (highest priority) ------------ */
  if (maxPrecipMm >= ACTION_THRESHOLDS.heavyPrecipitationMm) {
    return {
      title: "Prepare for possible excess water",
      message: `Significant precipitation is forecast in the next 3 days${cropSuffix}.`,
      priority: "caution",
      category: "excess-water",
      reason: `Forecast shows up to ${maxPrecipMm.toFixed(1)} mm precipitation in the window.`,
      recommendation: `Review field drainage${cropPhrase}. Avoid scheduling new irrigation until conditions are clear.`,
      caveat: STANDARD_CAVEAT,
    };
  }

  /* --- RULE A — high rain probability ------------------------------ */
  if (maxRainPercent >= ACTION_THRESHOLDS.rainProbabilityPercent) {
    const day = tomorrowRain > todayRain ? "tomorrow" : "today";
    const irrigationNote =
      profile.irrigation === "rain-fed"
        ? ""
        : " Consider delaying the next irrigation cycle.";
    return {
      title: "Review planned irrigation",
      message: `Rain is likely ${day} (${Math.max(todayRain, tomorrowRain)}% probability)${cropSuffix}.`,
      priority: "caution",
      category: "irrigation",
      reason: `Precipitation probability reaches ${Math.max(todayRain, tomorrowRain)}% in the next 24–48 hours.`,
      recommendation: `Hold off on weather-sensitive field work if possible.${irrigationNote} Re-check the forecast before deciding.`,
      caveat: STANDARD_CAVEAT,
    };
  }

  /* --- RULE C — hot conditions ------------------------------------- */
  if (current.temperatureC >= ACTION_THRESHOLDS.heatTemperatureC) {
    return {
      title: "Monitor crop water stress",
      message: `High temperature of ${Math.round(current.temperatureC)}°C recorded${cropSuffix}.`,
      priority: "caution",
      category: "heat",
      reason: `Temperature is at or above the configured heat threshold (${ACTION_THRESHOLDS.heatTemperatureC}°C).`,
      recommendation: `Check soil moisture before irrigating${cropPhrase}. High heat can increase water demand — rely on field observation, not fixed schedules.`,
      caveat: STANDARD_CAVEAT,
    };
  }

  /* --- RULE D — strong wind ---------------------------------------- */
  if (current.windKmph >= ACTION_THRESHOLDS.strongWindKmph) {
    return {
      title: "Consider postponing vulnerable field operations",
      message: `Strong wind of ${Math.round(current.windKmph)} km/h recorded.`,
      priority: "caution",
      category: "operations",
      reason: `Wind is at or above the configured operations threshold (${ACTION_THRESHOLDS.strongWindKmph} km/h).`,
      recommendation:
        "Spraying and other wind-sensitive operations may be less suitable today. Assess on-site conditions first.",
      caveat: STANDARD_CAVEAT,
    };
  }

  /* --- RULE E — no meaningful trigger ------------------------------- */
  return {
    title: "Continue normal monitoring",
    message: "No major weather trigger detected by the current decision rules.",
    priority: "normal",
    category: "monitoring",
    reason: `Conditions are within configured thresholds: ${Math.round(current.temperatureC)}°C, ${Math.round(current.windKmph)} km/h wind, ${Math.max(todayRain, tomorrowRain)}% max rain probability.`,
    recommendation: `Keep up routine crop observation${cropPhrase}. Re-check weather before scheduling major field work.`,
    caveat: STANDARD_CAVEAT,
  };
}
