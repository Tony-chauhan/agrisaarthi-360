import type { FarmProfile } from "@/lib/types";

/**
 * SAMPLE FARM DATA — clearly separated from UI components.
 *
 * The golden sample profile is the single deterministic farm used for the
 * presentation run-through. It is compatible with the rules-based crop
 * engine (rabi + loamy soil + drip → Wheat full-matches season, soil and
 * irrigation rules and ranks first at 100/100 — Wheat prefers loamy soil
 * in the configured rule set, which is the only golden-profile value
 * changed for this; verified in scripts/verify-golden-demo.ts) and with
 * the machinery dataset (5 acres fits most suitable ranges).
 * It is available as a one-click "Use Sample Farm" data-entry convenience
 * — normal users can also create and edit their own profile.
 */

export const GOLDEN_DEMO_PROFILE: FarmProfile = {
  farmerName: "Ramesh Patil",
  location: "Nashik, Maharashtra",
  district: "Nashik",
  farmSizeAcres: 5,
  irrigation: "drip",
  /** Loamy — Wheat's preferred soil in the configured rule set so the golden run legitimately tops the engine. */
  soilType: "loamy",
  season: "rabi",
  /** Kept undefined — the crop is chosen live in the Crop Advisor golden path. */
  selectedCrop: undefined,
};

/** Backwards-compatible alias — the golden sample profile IS the default profile. */
export const DEMO_PROFILE = GOLDEN_DEMO_PROFILE;

/** Note shown where the untouched sample farm is displayed as such. */
export const DEMO_DATA_DISCLAIMER =
  "Sample farm data — replace with your own farm profile.";
