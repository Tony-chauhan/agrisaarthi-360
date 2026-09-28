import type {
  NormalizedAnalysis,
  ProviderAnalysisPayload,
} from "@/lib/crop-health/types";
import type { HealthLikelihood } from "@/lib/types";

/**
 * STRICT PAYLOAD VALIDATION
 *
 * A provider payload is only accepted if required fields validate.
 * Anything malformed → validation fails → the orchestrator falls back.
 * Never throws; never lets unvalidated strings reach the UI.
 */

const LIKELIHOOD_VALUES: HealthLikelihood[] = [
  "likely",
  "possible",
  "uncertain",
];

const SEVERITY_VALUES = ["low", "moderate", "high", "unclear"] as const;

/** Type guards */
function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

function asStringArray(value: unknown, maxItems: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((v) => v.trim());
  return items.length > 0 ? items.slice(0, maxItems) : undefined;
}

function asLikelihood(value: unknown): HealthLikelihood {
  return asString(value) && LIKELIHOOD_VALUES.includes(asString(value) as HealthLikelihood)
    ? (asString(value) as HealthLikelihood)
    : "uncertain";
}

function asSeverity(
  value: unknown
): "low" | "moderate" | "high" | "unclear" | undefined {
  const s = asString(value);
  return s && (SEVERITY_VALUES as readonly string[]).includes(s)
    ? (s as "low" | "moderate" | "high" | "unclear")
    : undefined;
}

/** Confidence must be a finite number in [0, 1]; otherwise omitted. */
function asConfidence(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1
    ? value
    : undefined;
}

/* ------------------------------------------------------------------ */
/* Normalizer                                                          */
/* ------------------------------------------------------------------ */

export function normalizeAnalysis(
  payload: ProviderAnalysisPayload,
  meta: { sourceType: "provider" | "demo-fallback" }
): NormalizedAnalysis | null {
  // Required field: a cautious possible-condition string must exist.
  const possibleCondition = asString(payload.possibleCondition);
  if (!possibleCondition) return null;

  const observations = asStringArray(payload.observations, 6);
  const recommendedActions = asStringArray(payload.recommendedActions, 6);

  return {
    cropName: asString(payload.plant),
    possibleCondition,
    likelihood: asLikelihood(payload.likelihood),
    confidence: asConfidence(payload.confidence),
    severity: asSeverity(payload.severity),
    observations: observations ?? ["No specific visual observations returned."],
    recommendedActions: recommendedActions ?? [
      "Consult a qualified agriculture professional.",
    ],
    caveat:
      asString(payload.caveat) ??
      "Image-based screening only — confirm with a qualified agriculture professional.",
    source: meta.sourceType === "provider" ? "model-result" : "demo",
    sourceType: meta.sourceType,
    isFallback: meta.sourceType === "demo-fallback",
    analyzedAt: new Date().toISOString(),
    imageQualityInsufficient:
      asString(payload.imageQuality) === "insufficient",
  };
}
