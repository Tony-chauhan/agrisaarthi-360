import type {
  AnalysisProvider,
  AnalysisProviderInput,
  ProviderAnalysisPayload,
} from "@/lib/crop-health/types";

/**
 * DETERMINISTIC FALLBACK PROVIDER — the safe fallback.
 * No randomness, no network, no fabricated AI confidence.
 * Always returns the same known fallback result so behavior is stable
 * and clearly labelled as fallback guidance upstream.
 */

export const DEMO_ANALYSIS: ProviderAnalysisPayload = {
  plant: "Leafy crop (fallback)",
  possibleCondition: "Early blight-like visual pattern (fallback guidance)",
  likelihood: "possible",
  observations: [
    "Visible leaf spotting in the supplied image.",
    "Discoloration pattern consistent with common leaf stress examples.",
  ],
  recommendedActions: [
    "Inspect nearby plants for similar symptoms.",
    "Capture another clearer image if this one is blurry or shaded.",
    "Monitor whether the affected area spreads over the next few days.",
    "Consult a qualified agriculture professional before any treatment.",
  ],
  caveat:
    "This is fallback guidance and not a confirmed diagnosis. Confirm with a qualified agriculture professional.",
  imageQuality: "acceptable",
};

export const DEMO_PROVIDER_NAME = "demo-fallback";

export function createDemoProvider(): AnalysisProvider {
  return {
    name: DEMO_PROVIDER_NAME,
    async analyze(
      _input: AnalysisProviderInput
    ): Promise<ProviderAnalysisPayload> {
      return DEMO_ANALYSIS;
    },
  };
}
