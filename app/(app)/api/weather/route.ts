import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getWeatherForFarm } from "@/lib/weather/weather-service";
import type { WeatherServiceResult } from "@/lib/weather/types";

/**
 * SERVER ROUTE — weather.
 *
 * Responsibilities: validate the farm location, serve cached or live
 * Open-Meteo data (geocoding + forecast), normalize it, and always return
 * source/fallback metadata. No secrets involved (Open-Meteo is keyless).
 * Provider failures never hang or crash — they resolve to demo fallback.
 */

export const runtime = "nodejs";

/** Max accepted location length (guards against abuse). */
const MAX_LOCATION_LENGTH = 120;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") ?? "";
  const refresh = searchParams.get("refresh") === "1";

  if (location.length > MAX_LOCATION_LENGTH) {
    return NextResponse.json<WeatherServiceResult>(
      { status: "unavailable" },
      { status: 400 }
    );
  }

  const result = await getWeatherForFarm(location, {
    bypassCache: refresh,
  });

  // Provider failures return a usable, labeled fallback snapshot (200);
  // truly empty input maps to "unavailable" → 400.
  if (result.status === "unavailable") {
    return NextResponse.json<WeatherServiceResult>(result, { status: 400 });
  }
  return NextResponse.json<WeatherServiceResult>(result);
}
