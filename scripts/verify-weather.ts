/**
 * DETERMINISTIC VERIFICATION — weather pipeline + action engine (A–M).
 * Runs fully offline via fetch stubbing. Usage: npx tsx scripts/verify-weather.ts
 */

import {
  getWeatherForFarm,
  normalizeWeather,
  clearWeatherCache,
} from "../lib/weather/weather-service";
import { deriveFarmWeatherAction } from "../lib/weather/weather-actions";
import { getDemoWeather } from "../lib/weather/demo-provider";
import type {
  ResolvedLocation,
  WeatherSnapshot,
} from "../lib/weather/types";
import type { FarmProfile } from "../lib/types";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

/* ------------------------------------------------------------------ */
/* Fetch stubbing                                                      */
/* ------------------------------------------------------------------ */

type FetchHandler = (url: unknown, init?: unknown) => Promise<Response>;
const originalFetch = globalThis.fetch;
let fetchCalls = 0;

function stubFetch(handler: FetchHandler) {
  fetchCalls = 0;
  globalThis.fetch = (async (url: unknown, init?: unknown) => {
    fetchCalls += 1;
    return handler(url, init);
  }) as unknown as typeof fetch;
}
function restoreFetch() {
  globalThis.fetch = originalFetch;
}

const GEO_HOST = "geocoding-api.open-meteo.com";
const FORECAST_HOST = "api.open-meteo.com";

function geocodeOk(name: string): Response {
  return new Response(
    JSON.stringify({
      results: [
        {
          name,
          latitude: 29.39,
          longitude: 76.96,
          country: "India",
          admin1: "Haryana",
          timezone: "Asia/Kolkata",
        },
      ],
    }),
    { status: 200 }
  );
}

function forecastOk(): Response {
  return new Response(
    JSON.stringify({
      current: {
        temperature_2m: 31.2,
        apparent_temperature: 33.8,
        relative_humidity_2m: 41,
        precipitation: 0,
        rain: 0,
        wind_speed_10m: 9.5,
        weather_code: 1,
      },
      daily: {
        time: ["2026-01-10", "2026-01-11", "2026-01-12"],
        temperature_2m_max: [30, 28.5, 31],
        temperature_2m_min: [14, 13, 15],
        precipitation_probability_max: [10, 20, 5],
        precipitation_sum: [0, 1.2, 0],
        weather_code: [1, 2, 0],
      },
    }),
    { status: 200 }
  );
}

const PROFILE: Pick<FarmProfile, "selectedCrop" | "irrigation" | "soilType"> = {
  selectedCrop: "Wheat",
  irrigation: "drip",
  soilType: "black",
};

/* ------------------------------------------------------------------ */
/* A + B + L — live path: geocode → forecast → normalized Live API     */
/* ------------------------------------------------------------------ */
async function scenarioA_B_L() {
  console.log("Scenarios A/B/L: live path with geocoding + forecast");
  stubFetch((url) => {
    const u = String(url);
    if (u.includes(GEO_HOST)) return Promise.resolve(geocodeOk("Panipat"));
    if (u.includes(FORECAST_HOST)) return Promise.resolve(forecastOk());
    return Promise.reject(new Error("unexpected host"));
  });
  const result = await getWeatherForFarm("Panipat, Haryana");
  restoreFetch();

  assert(result.status === "success", "A1 service returns success");
  if (result.status !== "success") return;

  const s = result.snapshot;
  assert(s.isFallback === false, "B1 not flagged as fallback");
  assert(s.sourceType === "live", "B2 sourceType live");
  assert(s.source === "live-api", "L1 live source → live-api (Live API tag)");
  assert(s.location.name.includes("Panipat"), "A2 geocoded name retained");
  assert(s.location.latitude === 29.39, "A3 coordinates resolved");
  assert(s.current.temperatureC === 31.2, "B3 current temperature normalized");
  assert(s.current.condition === "Mainly clear", "B4 WMO code interpreted");
  assert(s.forecast.length === 3, "B5 3-day forecast normalized");
  assert(
    s.forecast[1].precipitationProbabilityPercent === 20,
    "B6 forecast rain probability preserved"
  );

  /* Cache: second call must not re-fetch */
  stubFetch(() => Promise.reject(new Error("should not be called")));
  const cached = await getWeatherForFarm("Panipat, Haryana");
  restoreFetch();
  assert(
    cached.status === "success" && fetchCalls === 0,
    "C-cache second identical request served from cache (no re-fetch)"
  );
  clearWeatherCache();
}

/* ------------------------------------------------------------------ */
/* C — geocoding failure → demo fallback                               */
/* ------------------------------------------------------------------ */
async function scenarioC() {
  console.log("Scenario C: geocoding failure → demo fallback");
  stubFetch(() => Promise.resolve(new Response("nope", { status: 500 })));
  const result = await getWeatherForFarm("Nowhere, Atlantis");
  restoreFetch();
  assert(result.status === "success", "C1 service still succeeds");
  if (result.status !== "success") return;
  assert(result.snapshot.isFallback === true, "C2 demo fallback flagged");
  assert(result.snapshot.source === "demo", "M1 fallback → demo tag source");
}

/* ------------------------------------------------------------------ */
/* D — forecast failure → demo fallback                                */
/* ------------------------------------------------------------------ */
async function scenarioD() {
  console.log("Scenario D: forecast API failure → demo fallback");
  stubFetch((url) => {
    const u = String(url);
    if (u.includes(GEO_HOST)) return Promise.resolve(geocodeOk("X"));
    return Promise.resolve(new Response("down", { status: 503 }));
  });
  const result = await getWeatherForFarm("D-test-location");
  restoreFetch();
  assert(result.status === "success", "D1 service survives forecast failure");
  if (result.status !== "success") return;
  assert(result.snapshot.isFallback === true, "D2 demo fallback used");
}

/* ------------------------------------------------------------------ */
/* E — malformed weather response → fallback                           */
/* ------------------------------------------------------------------ */
async function scenarioE() {
  console.log("Scenario E: malformed forecast response → fallback");
  stubFetch((url) => {
    const u = String(url);
    if (u.includes(GEO_HOST)) return Promise.resolve(geocodeOk("Y"));
    return Promise.resolve(
      new Response(JSON.stringify({ current: { temperature_2m: 25 } }), {
        status: 200,
      })
    );
  });
  const result = await getWeatherForFarm("E-test-location");
  restoreFetch();
  assert(result.status === "success", "E1 service survives malformed data");
  if (result.status !== "success") return;
  assert(result.snapshot.isFallback === true, "E2 malformed → demo fallback");

  // normalizeWeather direct check
  const loc: ResolvedLocation = {
    name: "Test",
    latitude: 0,
    longitude: 0,
  };
  assert(
    normalizeWeather({ current: {} }, loc, "live") === null,
    "E3 normalizeWeather rejects missing fields"
  );
}

/* ------------------------------------------------------------------ */
/* F — high rain probability → irrigation caution                      */
/* ------------------------------------------------------------------ */
function scenarioF() {
  console.log("Scenario F: high rain probability → irrigation caution");
  const weather = getDemoWeather(); // 65% today, 80% tomorrow
  const action = deriveFarmWeatherAction(weather, PROFILE);
  assert(action.category === "irrigation", "F1 irrigation rule triggered");
  assert(action.priority === "caution", "F2 caution priority");
  assert(
    /irrigat/i.test(action.title),
    "F3 action mentions irrigation (review, not command)"
  );
  assert(
    /Wheat/i.test(action.message),
    "F4 selected crop context used in wording"
  );
}

/* ------------------------------------------------------------------ */
/* G — high temperature → heat/water-stress action                     */
/* ------------------------------------------------------------------ */
function heatSnapshot(): WeatherSnapshot {
  const base = getDemoWeather();
  return {
    ...base,
    current: {
      ...base.current,
      temperatureC: 41,
      windKmph: 8,
    },
    forecast: base.forecast.map((d) => ({
      ...d,
      precipitationProbabilityPercent: 5,
      precipitationMm: 0,
    })),
  };
}

function scenarioG() {
  console.log("Scenario G: high temperature → heat monitoring");
  const action = deriveFarmWeatherAction(heatSnapshot(), PROFILE);
  assert(action.category === "heat", "G1 heat rule triggered");
  assert(
    /water stress/i.test(action.title),
    "G2 action monitors water stress"
  );
  assert(
    !/\d+\s*(mm|liters)\s+water/i.test(action.recommendation),
    "G3 no prescribed irrigation amounts"
  );
}

/* ------------------------------------------------------------------ */
/* H — strong wind → operations caution                                */
/* ------------------------------------------------------------------ */
function scenarioH() {
  console.log("Scenario H: strong wind → operations caution");
  const base = getDemoWeather();
  const windy: WeatherSnapshot = {
    ...base,
    current: { ...base.current, temperatureC: 25, windKmph: 32 },
    forecast: base.forecast.map((d) => ({
      ...d,
      precipitationProbabilityPercent: 5,
      precipitationMm: 0,
    })),
  };
  const action = deriveFarmWeatherAction(windy, PROFILE);
  assert(action.category === "operations", "H1 operations rule triggered");
  assert(action.priority === "caution", "H2 caution priority");
}

/* ------------------------------------------------------------------ */
/* I — no trigger → normal monitoring                                  */
/* ------------------------------------------------------------------ */
function scenarioI() {
  console.log("Scenario I: no trigger → normal monitoring");
  const base = getDemoWeather();
  const calm: WeatherSnapshot = {
    ...base,
    current: { ...base.current, temperatureC: 24, windKmph: 6 },
    forecast: base.forecast.map((d) => ({
      ...d,
      precipitationProbabilityPercent: 10,
      precipitationMm: 0,
    })),
  };
  const action = deriveFarmWeatherAction(calm, PROFILE);
  assert(action.category === "monitoring", "I1 monitoring fallback rule");
  assert(action.priority === "normal", "I2 normal priority");
}

/* ------------------------------------------------------------------ */
/* J — no selected crop → no invented crop                             */
/* ------------------------------------------------------------------ */
function scenarioJ() {
  console.log("Scenario J: no selected crop → generic language");
  const weather = getDemoWeather();
  const noCrop = { irrigation: "rain-fed" as const, soilType: "loamy" as const };
  const action = deriveFarmWeatherAction(weather, noCrop);
  assert(
    !/for your|undefined/i.test(action.message + action.recommendation),
    "J1 no crop phrase or undefined leakage"
  );
  assert(action.category === "irrigation", "J2 rule still triggers on weather");
}

/* ------------------------------------------------------------------ */
/* K — deterministic demo + engine                                     */
/* ------------------------------------------------------------------ */
function scenarioK() {
  console.log("Scenario K: determinism");
  const w1 = getDemoWeather();
  const w2 = getDemoWeather();
  const strip = (s: WeatherSnapshot) => JSON.stringify({ ...s, fetchedAt: 0 });
  assert(strip(w1) === strip(w2), "K1 demo snapshot deterministic");

  const a1 = deriveFarmWeatherAction(w1, PROFILE);
  const a2 = deriveFarmWeatherAction(w2, PROFILE);
  assert(JSON.stringify(a1) === JSON.stringify(a2), "K2 action engine deterministic");
}

/* ------------------------------------------------------------------ */
async function main() {
  try {
    await scenarioA_B_L();
    await scenarioC();
    await scenarioD();
    await scenarioE();
    scenarioF();
    scenarioG();
    scenarioH();
    scenarioI();
    scenarioJ();
    scenarioK();
  } finally {
    restoreFetch();
    clearWeatherCache();
  }
  console.log(
    failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`
  );
  process.exit(failures === 0 ? 0 : 1);
}

void main();
