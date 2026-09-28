import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  calendarSupportedCrops,
  getCalendarTemplates,
} from "@/lib/planner/crop-calendar";
import type { Season } from "@/lib/types";

/**
 * CALENDAR API ROUTE (P1.2)
 *
 * GET /api/calendar?crop=Wheat&season=rabi — stage/task template lookup.
 * Unknown crop+season returns an EMPTY templates array (honest) — the
 * calendar never fabricates agronomy.
 */

export const runtime = "nodejs";

const SEASONS: Season[] = ["kharif", "rabi", "zaid"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get("crop") ?? "";
  const season = searchParams.get("season") ?? "";

  if (crop.trim() === "" || crop.length > 60) {
    return NextResponse.json(
      { error: "invalid_request", message: "A crop name is required (max 60 chars)." },
      { status: 400 }
    );
  }
  if (!SEASONS.includes(season as Season)) {
    return NextResponse.json(
      { error: "invalid_request", message: "season must be kharif, rabi or zaid." },
      { status: 400 }
    );
  }

  const templates = getCalendarTemplates(crop, season as Season);

  return NextResponse.json(
    {
      crop: crop.trim(),
      season,
      templates,
      supportedCrops: calendarSupportedCrops(),
      source: "rules-based",
      caveat:
        "Indicative stages from the configured calendar — verify with local agronomic guidance.",
    },
    { status: 200 }
  );
}
