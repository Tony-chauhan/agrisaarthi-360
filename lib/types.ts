/**
 * Core domain types for AgriSaarthi 360.
 * These interfaces are the contract future API steps will implement —
 * UI components consume these types only, so swapping sample data for
 * live API data later requires no UI redesign.
 */

/* ------------------------------------------------------------------ */
/* Data transparency                                                   */
/* ------------------------------------------------------------------ */

/** Every piece of data shown in the UI must declare how it was produced. */
export type DataSource =
  | "live-api" // verified live external source
  | "model-result" // AI/ML output (always uncertain)
  | "rules-based" // transparent deterministic logic
  | "demo" // curated sample data
  | "illustrative"; // placeholder, not real at all

/* ------------------------------------------------------------------ */
/* Farm profile                                                        */
/* ------------------------------------------------------------------ */

export type IrrigationType =
  | "rain-fed"
  | "canal"
  | "borewell"
  | "drip"
  | "sprinkler";

export type SoilType =
  | "black"
  | "alluvial"
  | "loamy"
  | "sandy"
  | "clay"
  | "red"
  | "laterite";

export type Season = "kharif" | "rabi" | "zaid";

export interface FarmProfile {
  farmerName: string;
  location: string;
  district?: string;
  farmSizeAcres: number;
  irrigation: IrrigationType;
  soilType: SoilType;
  season: Season;
  /** Chosen after crop advisor selection; undefined until then. */
  selectedCrop?: string;
  /** Optional contextual land photograph (object URL during demo). */
  landPhotoUrl?: string;
}

/* ------------------------------------------------------------------ */
/* Crop knowledge base (demo rules)                                    */
/* ------------------------------------------------------------------ */

export type WaterRequirement = "low" | "moderate" | "high";

/** One curated crop entry in the demo knowledge base. */
export interface CropKnowledgeEntry {
  crop: string;
  /** Seasons this crop suits in the demo rule set. */
  seasons: Season[];
  /** Soil types with full compatibility. */
  preferredSoils: SoilType[];
  /** Soils that still work with a partial penalty (demo rule). */
  toleratedSoils?: SoilType[];
  /** Irrigation types with full compatibility. */
  preferredIrrigation: IrrigationType[];
  /** Irrigation types that still work with a partial penalty (demo rule). */
  toleratedIrrigation?: IrrigationType[];
  waterRequirement: WaterRequirement;
  durationDays: string;
  /** Farm sizes (acres) where this demo rule considers the crop practical. */
  farmSizeRange: { min: number; max: number };
  caveat: string;
}

/* ------------------------------------------------------------------ */
/* Crop recommendation                                                 */
/* ------------------------------------------------------------------ */

export type Suitability = "high" | "moderate" | "exploratory";

export interface CropRecommendation {
  crop: string;
  suitability: Suitability;
  /** Transparent, human-readable reasons tied to the farm profile. */
  whyItMatches: string[];
  waterRequirement: WaterRequirement;
  durationDays: string;
  caveat: string;
  source: DataSource;
}

/** How one scoring dimension resolved for a crop. */
export interface FitDetail {
  /** Points awarded for this dimension out of its maximum weight. */
  points: number;
  max: number;
  /** Human-readable basis, e.g. "Rabi matches wheat's season profile". */
  basis: string;
}

export interface CropAdvisorInputs {
  location: string;
  season: Season;
  farmSizeAcres: number;
  irrigation: IrrigationType;
  soilType: SoilType;
  landPhotoUrl?: string;
}

/** Full engine output — extends the UI-facing recommendation. */
export interface EngineCropRecommendation extends CropRecommendation {
  /** Configured weight total, max 100. NOT a scientific accuracy measure. */
  score: number;
  /** Per-dimension breakdown for transparency. */
  scoreBasis: {
    season: FitDetail;
    soil: FitDetail;
    irrigation: FitDetail;
    location: FitDetail;
    farmSize: FitDetail;
  };
  seasonFit: string;
  soilFit: string;
  irrigationFit: string;
}

export interface CropRecommendationResult {
  recommendations: EngineCropRecommendation[];
  /** True when the profile lacks required context for reliable scoring. */
  incompleteProfile: boolean;
  /** Human-readable list of what is missing (empty when complete). */
  missingInputs: string[];
}

/* ------------------------------------------------------------------ */
/* Crop health                                                         */
/* ------------------------------------------------------------------ */

export type HealthLikelihood = "likely" | "possible" | "uncertain";
export interface CropHealthResult {
  possibleCondition: string;
  likelihood: HealthLikelihood;
  /** Percent shown as "model confidence", always framed cautiously. */
  confidencePercent: number;
  explanation: string;
  visualNote: string;
  recommendedNextStep: string;
  expertConfirmationRequired: boolean;
  source: DataSource;
}

/**
 * Lightweight crop-health summary for the Dashboard card.
 * Deliberately tiny — never holds image data or full analysis payloads.
 */
export interface HealthCheckSummary {
  crop: string;
  possibleCondition: string;
  likelihood: HealthLikelihood;
  isFallback: boolean;
  source: DataSource;
  /** ISO timestamp of the analysis. */
  analyzedAt: string;
}

/* ------------------------------------------------------------------ */
/* Weather → Action (normalized model lives in lib/weather/types.ts)   */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Farm operations / machinery                                         */
/* Normalized operation + machinery models live in lib/operations/.    */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Assistant                                                           */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  role: "farmer" | "assistant";
  text: string;
  /** Timestamp not required for demo; kept optional for future logging. */
  sentAt?: string;
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export interface FarmOverviewItem {
  label: string;
  value: string;
}

export interface TodayAction {
  id: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  priority: "now" | "today" | "this-week";
}
