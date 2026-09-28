import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generatePlan } from "@/lib/planner/planner-engine";
import type { PlannerEngineInput } from "@/lib/planner/types";
import type { Season } from "@/lib/types";
import type { ActionCategory } from "@/lib/weather/types";

/**
 * PLANNER API ROUTE (P1.1)
 *
 * POST /api/planner/generate — deterministic plan computation from farm
 * context. Stateless: the UI generates plans client-side via the same
 * pure engine; this route exists for API consumers and future persistence.
 * Follows the P0 validation style (enum checks, length caps, typed errors).
 */

export const runtime = "nodejs";

const SEASONS: Season[] = ["kharif", "rabi", "zaid"];
const ACTION_CATEGORIES: ActionCategory[] = [
  "irrigation",
  "excess-water",
  "heat",
  "operations",
  "monitoring",
];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const raw = body as Partial<PlannerEngineInput>;
  if (typeof raw !== "object" || raw === null) {
    return NextResponse.json(
      { error: "invalid_request", message: "A request body is required." },
      { status: 400 }
    );
  }

  const profile = raw.profile;
  if (
    typeof profile !== "object" ||
    profile === null ||
    typeof profile.location !== "string" ||
    profile.location.trim() === "" ||
    profile.location.length > 120 ||
    typeof profile.farmSizeAcres !== "number" ||
    !Number.isFinite(profile.farmSizeAcres) ||
    profile.farmSizeAcres <= 0 ||
    !SEASONS.includes(profile.season)
  ) {
    return NextResponse.json(
      { error: "invalid_request", message: "A valid farm profile is required." },
      { status: 400 }
    );
  }

  const selectedCrop =
    typeof profile.selectedCrop === "string" && profile.selectedCrop.trim() !== ""
      ? profile.selectedCrop
      : undefined;
  if (selectedCrop !== undefined && selectedCrop.length > 60) {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid crop name." },
      { status: 400 }
    );
  }

  // Weather action: only whitelisted fields are accepted.
  let weatherAction: PlannerEngineInput["weatherAction"] = null;
  if (raw.weatherAction && typeof raw.weatherAction === "object") {
    const wa = raw.weatherAction as Record<string, unknown>;
    if (
      typeof wa.title === "string" &&
      typeof wa.message === "string" &&
      typeof wa.reason === "string" &&
      typeof wa.recommendation === "string" &&
      typeof wa.category === "string" &&
      ACTION_CATEGORIES.includes(wa.category as ActionCategory) &&
      (wa.priority === "caution" || wa.priority === "monitor" || wa.priority === "normal")
    ) {
      weatherAction = {
        title: wa.title.slice(0, 120),
        message: wa.message.slice(0, 300),
        reason: wa.reason.slice(0, 300),
        recommendation: wa.recommendation.slice(0, 300),
        category: wa.category as ActionCategory,
        priority: wa.priority,
      };
    }
  }

  const input: PlannerEngineInput = {
    profile: {
      location: profile.location.trim(),
      farmSizeAcres: profile.farmSizeAcres,
      season: profile.season,
      selectedCrop: selectedCrop?.trim(),
    },
    weatherAction,
    calendarStartDate: raw.calendarStartDate,
    now: raw.now,
  };

  const plan = generatePlan(input);
  return NextResponse.json(plan, { status: 200 });
}
