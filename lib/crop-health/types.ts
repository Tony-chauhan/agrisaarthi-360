import type {
  DataSource,
  HealthLikelihood,
  Season,
  IrrigationType,
  SoilType,
} from "@/lib/types";

/**
 * CROP HEALTH ANALYSIS CONTRACT
 *
 * The UI never knows which provider produced a result — it consumes
 * NormalizedAnalysis only. Real provider results are labeled "model-result";
 * deterministic fallback results are labeled "demo" and flagged isFallback.
 */

/* ------------------------------------------------------------------ */
/* Farm context (supporting info — the image is the primary input)     */
/* ------------------------------------------------------------------ */

/** Lightweight farm context sent alongside an analysis request. */
export interface AnalysisFarmContext {
  selectedCrop?: string;
  season?: Season;
  location?: string;
  irrigation?: IrrigationType;
  soilType?: SoilType;
}

/* ------------------------------------------------------------------ */
/* Provider payloads                                                   */
/* ------------------------------------------------------------------ */

/**
 * Raw structured payload expected from a vision provider.
 * Validated by normalize-result.ts before it may reach the UI.
 */
export interface ProviderAnalysisPayload {
  plant?: unknown;
  possibleCondition?: unknown;
  likelihood?: unknown;
  confidence?: unknown;
  severity?: unknown;
  observations?: unknown;
  recommendedActions?: unknown;
  caveat?: unknown;
  imageQuality?: unknown;
}

/** The normalized, UI-ready analysis result. */
export interface NormalizedAnalysis {
  /** Crop/plant identification, if the image allowed one. */
  cropName?: string;
  /** Cautious phrasing, e.g. "Early blight-like visual pattern". */
  possibleCondition: string;
  likelihood: HealthLikelihood;
  /**
   * Model confidence (0–1). Present ONLY for real model results.
   * Demo fallbacks must NOT fabricate confidence.
   */
  confidence?: number;
  severity?: "low" | "moderate" | "high" | "unclear";
  observations: string[];
  recommendedActions: string[];
  caveat: string;
  source: DataSource;
  sourceType: "provider" | "demo-fallback";
  isFallback: boolean;
  /** ISO timestamp of analysis. */
  analyzedAt: string;
  /** Set when image quality was insufficient for reliable assessment. */
  imageQualityInsufficient?: boolean;
}

/* ------------------------------------------------------------------ */
/* Provider interface + client result                                  */
/* ------------------------------------------------------------------ */

/** Input passed to any analysis provider. */
export interface AnalysisProviderInput {
  /** Image as base64 (no data: prefix) with its MIME type. */
  imageBase64: string;
  imageMimeType: string;
  farmContext: AnalysisFarmContext;
}

/** Outcome of calling the analysis pipeline from the browser. */
export type AnalysisOutcome =
  | { status: "success"; analysis: NormalizedAnalysis }
  | { status: "invalid-image"; reason: string }
  | { status: "provider-unavailable" };

/** Any crop-health analysis provider. */
export interface AnalysisProvider {
  readonly name: string;
  analyze(input: AnalysisProviderInput): Promise<ProviderAnalysisPayload>;
}

/** Accepted image MIME types. */
export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Maximum upload size (5 MB) — validated client-side before send. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Minimum pixel width/height for a usable visual assessment. */
export const MIN_IMAGE_DIMENSION = 200;
