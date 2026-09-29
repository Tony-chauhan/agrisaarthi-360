import type {
  FarmWeatherAction,
  WeatherSnapshot,
} from "@/lib/weather/types";
import type { FarmProfile } from "@/lib/types";
import type { Lang } from "@/lib/i18n/types";
import { t as dict } from "@/lib/i18n";

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
 *
 * English is the deterministic default (verify suites assert English
 * strings); pass `lang` to receive the action in the selected UI language.
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
  profile: Pick<FarmProfile, "selectedCrop" | "irrigation" | "soilType">,
  lang: Lang = "en"
): FarmWeatherAction {
  const { current, forecast } = weather;
  const crop = profile.selectedCrop?.trim();
  const cropPhrase = crop ? ` for your ${crop}` : "";
  const cropSuffix = crop ? ` (${crop})` : "";

  /* --- Localized rule strings (English default) ------------------- */
  const L = lang === "hi" ? dict("hi").weatherLib : null;

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
    if (L) {
      return {
        title: L.excessWater.title,
        message: L.excessWater.message(crop),
        priority: "caution",
        category: "excess-water",
        reason: L.excessWater.reason(maxPrecipMm.toFixed(1)),
        recommendation: L.excessWater.recommendation(crop),
        caveat: L.standardCaveat,
      };
    }
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
    const isTomorrow = tomorrowRain > todayRain;
    if (L) {
      const irrigationNote =
        profile.irrigation === "rain-fed" ? "" : L.irrigation.irrigationDelayNote;
      return {
        title: L.irrigation.title,
        message: L.irrigation.message(
          isTomorrow ? L.dayWord.tomorrow : L.dayWord.today,
          Math.max(todayRain, tomorrowRain),
          crop,
        ),
        priority: "caution",
        category: "irrigation",
        reason: L.irrigation.reason(Math.max(todayRain, tomorrowRain)),
        recommendation: L.irrigation.recommendation(irrigationNote),
        caveat: L.standardCaveat,
      };
    }
    const day = isTomorrow ? "tomorrow" : "today";
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
    if (L) {
      return {
        title: L.heat.title,
        message: L.heat.message(Math.round(current.temperatureC), crop),
        priority: "caution",
        category: "heat",
        reason: L.heat.reason(ACTION_THRESHOLDS.heatTemperatureC),
        recommendation: L.heat.recommendation(crop),
        caveat: L.standardCaveat,
      };
    }
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
    if (L) {
      return {
        title: L.wind.title,
        message: L.wind.message(Math.round(current.windKmph)),
        priority: "caution",
        category: "operations",
        reason: L.wind.reason(ACTION_THRESHOLDS.strongWindKmph),
        recommendation: L.wind.recommendation,
        caveat: L.standardCaveat,
      };
    }
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
  if (L) {
    return {
      title: L.monitoring.title,
      message: L.monitoring.message,
      priority: "normal",
      category: "monitoring",
      reason: L.monitoring.reason(
        Math.round(current.temperatureC),
        Math.round(current.windKmph),
        maxRainPercent,
      ),
      recommendation: L.monitoring.recommendation(crop),
      caveat: L.standardCaveat,
    };
  }
  return {
    title: "Continue normal monitoring",
    message: "No major weather trigger detected by the current decision rules.",
    priority: "normal",
    category: "monitoring",
    reason: `Conditions are within configured thresholds: ${Math.round(current.temperatureC)}°C, ${Math.round(current.windKmph)} km/h wind, ${maxRainPercent}% max rain probability.`,
    recommendation: `Keep up routine crop observation${cropPhrase}. Re-check weather before scheduling major field work.`,
    caveat: STANDARD_CAVEAT,
  };
}
