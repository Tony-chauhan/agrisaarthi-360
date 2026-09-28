import type { Season } from "@/lib/types";
import type { CropCalendarTemplate } from "@/lib/planner/types";

/**
 * CROP CALENDAR KNOWLEDGE BASE (P1.2)
 *
 * A small, configurable, extensible set of stage-anchored task templates.
 * Same conventions as lib/crop-knowledge.ts: curated data, centralized
 * here, NOT universal agricultural truth. Stages are indicative — farmers
 * verify locally. Adding crop support = adding entries to this array.
 */

export const CROP_CALENDAR_BASE: CropCalendarTemplate[] = [
  /* --------------------------- WHEAT · RABI --------------------------- */
  {
    id: "wheat-rabi-sowing",
    crop: "Wheat",
    season: "rabi",
    stage: "Sowing",
    taskTemplate: {
      title: "Sow wheat",
      description:
        "Prepare a fine seedbed and sow at the recommended row spacing for your variety. Confirm seed availability with your local agriculture officer.",
      category: "sowing",
      priority: "high",
    },
    relativeDay: 0,
    weatherCondition: undefined,
    notes: "Anchor task — the calendar counts from this date.",
  },
  {
    id: "wheat-rabi-first-irrigation",
    crop: "Wheat",
    season: "rabi",
    stage: "Crown root initiation",
    taskTemplate: {
      title: "First irrigation — crown root initiation",
      description:
        "Apply light irrigation at the crown root initiation stage (about 20–21 days after sowing). Check soil moisture before irrigating.",
      category: "irrigation",
      priority: "high",
    },
    relativeDay: 20,
    weatherCondition: "irrigation",
    notes: "Most moisture-sensitive stage of the wheat cycle.",
  },
  {
    id: "wheat-rabi-tillering-check",
    crop: "Wheat",
    season: "rabi",
    stage: "Tillering",
    taskTemplate: {
      title: "Field check — tillering stage",
      description:
        "Walk the field and check tiller density, uniform growth and early weed pressure. Upload a leaf photo in Crop Health if you see yellowing or spots.",
      category: "monitoring",
      priority: "medium",
    },
    relativeDay: 30,
    weatherCondition: undefined,
    notes: undefined,
  },
  {
    id: "wheat-rabi-weeding",
    crop: "Wheat",
    season: "rabi",
    stage: "Tillering",
    taskTemplate: {
      title: "Weed control",
      description:
        "Remove weeds or plan weeding at the tillering stage — early removal protects yield. Prefer manual or mechanical removal; follow label guidance for any herbicide.",
      category: "crop-care",
      priority: "medium",
    },
    relativeDay: 35,
    weatherCondition: undefined,
    notes: undefined,
  },
  {
    id: "wheat-rabi-second-irrigation",
    crop: "Wheat",
    season: "rabi",
    stage: "Late jointing",
    taskTemplate: {
      title: "Second irrigation — late jointing",
      description:
        "Apply the second irrigation around 40–45 days after sowing, adjusted for rainfall and soil moisture. Re-check the forecast before deciding.",
      category: "irrigation",
      priority: "medium",
    },
    relativeDay: 42,
    weatherCondition: "irrigation",
    notes: undefined,
  },
  {
    id: "wheat-rabi-grain-fill-check",
    crop: "Wheat",
    season: "rabi",
    stage: "Grain filling",
    taskTemplate: {
      title: "Field check — grain filling",
      description:
        "Monitor for rust-like symptoms, lodging and moisture stress during grain filling. Strong wind or heat in this window deserves a Weather check.",
      category: "monitoring",
      priority: "medium",
    },
    relativeDay: 75,
    weatherCondition: "heat",
    notes: undefined,
  },
  {
    id: "wheat-rabi-harvest-prep",
    crop: "Wheat",
    season: "rabi",
    stage: "Maturity",
    taskTemplate: {
      title: "Prepare for harvest",
      description:
        "Confirm grain moisture, arrange combine harvester capacity in Farm Operations, and plan threshing floor or storage.",
      category: "harvest",
      priority: "high",
    },
    relativeDay: 105,
    weatherCondition: "operations",
    notes: "Links naturally to Farm Operations machinery requests.",
  },
];

/**
 * Calendar lookup. Unknown crop+season combinations return an EMPTY array —
 * the planner never fabricates agronomy for crops it has no template for.
 */
export function getCalendarTemplates(
  crop: string,
  season: Season
): CropCalendarTemplate[] {
  const normalized = crop.trim().toLowerCase();
  if (!normalized) return [];
  return CROP_CALENDAR_BASE.filter(
    (t) => t.crop.toLowerCase() === normalized && t.season === season
  );
}

/** Whether any template exists for this crop+season combination. */
export function hasCalendarSupport(crop: string, season: Season): boolean {
  return getCalendarTemplates(crop, season).length > 0;
}

/** All crops with at least one template (for empty-state guidance). */
export function calendarSupportedCrops(): string[] {
  return Array.from(new Set(CROP_CALENDAR_BASE.map((t) => t.crop)));
}
