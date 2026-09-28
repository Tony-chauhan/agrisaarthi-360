import type {
  AnalysisOutcome,
  AnalysisProviderInput,
  AnalysisProvider,
  NormalizedAnalysis,
} from "@/lib/crop-health/types";
import { createGeminiVisionProvider } from "@/lib/crop-health/vision-provider";
import { createDemoProvider } from "@/lib/crop-health/demo-provider";
import { normalizeAnalysis } from "@/lib/crop-health/normalize-result";

/**
 * PROVIDER ORCHESTRATOR
 *
 * Resolves the analysis provider (real Gemini when configured, deterministic
 * demo otherwise) and guarantees the caller always receives a well-formed
 * AnalysisOutcome. Provider failures NEVER crash the app — they become a
 * clearly-labelled demo fallback.
 */

/** Resolve the provider available in this environment. */
export function resolveProvider(): {
  provider: AnalysisProvider;
  isRealProvider: boolean;
} {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return { provider: createDemoProvider(), isRealProvider: false };
  }
  return {
    provider: createGeminiVisionProvider(apiKey),
    isRealProvider: true,
  };
}

/**
 * Run an analysis with automatic fallback.
 * Runs server-side (needs process.env for the real provider).
 */
export async function runAnalysis(
  input: AnalysisProviderInput
): Promise<NormalizedAnalysis> {
  const { provider, isRealProvider } = resolveProvider();

  try {
    const payload = await provider.analyze(input);
    const normalized = normalizeAnalysis(payload, {
      sourceType: isRealProvider ? "provider" : "demo-fallback",
    });
    if (!normalized) {
      // Malformed/incomplete provider payload → demo fallback.
      return await fallbackAnalysis(input);
    }
    return normalized;
  } catch {
    // Network failure, timeout, rate limit, invalid response, etc.
    return await fallbackAnalysis(input);
  }
}

/** Deterministic demo path — used when the real provider is unavailable. */
async function fallbackAnalysis(
  input: AnalysisProviderInput
): Promise<NormalizedAnalysis> {
  const demo = createDemoProvider();
  const payload = await demo.analyze(input);
  // Demo payload is static and known-good; normalize for consistent shape.
  const normalized = normalizeAnalysis(payload, {
    sourceType: "demo-fallback",
  });
  if (!normalized) {
    // Should be unreachable (demo payload is fixed); kept as a hard guarantee.
    return {
      possibleCondition: "Analysis unavailable (fallback guidance)",
      likelihood: "uncertain",
      observations: ["No visual observations available in fallback mode."],
      recommendedActions: [
        "Consult a qualified agriculture professional.",
      ],
      caveat: "This is fallback guidance and not a confirmed diagnosis.",
      source: "demo",
      sourceType: "demo-fallback",
      isFallback: true,
      analyzedAt: new Date().toISOString(),
    };
  }
  return normalized;
}

/** Convenience type re-export for route handlers. */
export type { AnalysisOutcome };
