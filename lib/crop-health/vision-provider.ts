import type {
  AnalysisProvider,
  AnalysisProviderInput,
  ProviderAnalysisPayload,
} from "@/lib/crop-health/types";

/**
 * GEMINI VISION PROVIDER — server-side only.
 *
 * Reads GEMINI_API_KEY and GEMINI_VISION_MODEL from the environment.
 * Model is configurable so obsolete names can be updated without code
 * changes. Never throws on provider errors: throws AnalysisProviderError
 * which the orchestrator converts to a safe fallback.
 *
 * SECURITY: GEMINI_API_KEY is read with process.env only here — never
 * imported into client components, never prefixed with NEXT_PUBLIC_.
 */

/** Server-only model configuration. */
export const GEMINI_VISION_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-3.6-flash";

/** Conservative agriculture image-analysis system instruction. */
const SYSTEM_INSTRUCTION = `You are an agricultural visual-assistance system.
Analyze the supplied crop/leaf image conservatively.
Do not claim certainty.
If the image does not provide enough visual evidence, explicitly say so.
Identify:
1. likely crop/plant if visually possible
2. possible visible condition
3. confidence/likelihood
4. visible observations
5. practical next steps
6. important caveat
Do not invent symptoms that are not visible.
Do not recommend hazardous chemical quantities or unsafe pesticide instructions.
If uncertain, recommend local expert confirmation.
Base every statement only on what is visible in the image. Farm context is supporting information only — never use it to invent a diagnosis.
Respond with structured JSON only.`;

/** Timeout for the provider call (ms). */
const PROVIDER_TIMEOUT_MS = 30_000;

export class AnalysisProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisProviderError";
  }
}

interface GeminiCandidatePart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiCandidatePart[] };
    finishReason?: string;
  }>;
  error?: { message?: string; status?: string };
}

export function createGeminiVisionProvider(
  apiKey: string
): AnalysisProvider {
  return {
    name: "gemini-vision",

    async analyze(input: AnalysisProviderInput): Promise<ProviderAnalysisPayload> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_VISION_MODEL}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      inlineData: {
                        mimeType: input.imageMimeType,
                        data: input.imageBase64,
                      },
                    },
                    {
                      text: buildContextLine(input.farmContext),
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: buildResponseSchema(),
              },
            }),
          }
        );

        if (!response.ok) {
          // Do not leak provider internals; classify and throw.
          throw new AnalysisProviderError(
            `Provider responded with status ${response.status}`
          );
        }

        const data = (await response.json()) as GeminiResponse;

        const text = data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("")
          .trim();

        if (!text) {
          throw new AnalysisProviderError("Provider returned no content");
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new AnalysisProviderError(
            "Provider returned malformed JSON"
          );
        }

        if (parsed === null || typeof parsed !== "object") {
          throw new AnalysisProviderError(
            "Provider response was not an object"
          );
        }

        return parsed as ProviderAnalysisPayload;
      } catch (err) {
        if (err instanceof AnalysisProviderError) throw err;
        if (err instanceof Error && err.name === "AbortError") {
          throw new AnalysisProviderError("Provider timed out");
        }
        throw new AnalysisProviderError("Provider request failed");
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function buildContextLine(ctx: AnalysisProviderInput["farmContext"]): string {
  const lines: string[] = [];
  // Crop context supports interpretation but must never manufacture findings.
  if (ctx.selectedCrop) lines.push(`Selected crop: ${ctx.selectedCrop}`);
  if (ctx.season) lines.push(`Season: ${ctx.season}`);
  if (ctx.location) lines.push(`Location: ${ctx.location}`);
  if (ctx.irrigation) lines.push(`Irrigation: ${ctx.irrigation}`);
  lines.push(
    "Analyze only what is visible in the image. If evidence is insufficient, say so."
  );
  return lines.join("\n");
}

/** Typed JSON schema for structured output (Gemini responseSchema format). */
function buildResponseSchema() {
  return {
    type: "object",
    properties: {
      plant: { type: "string" },
      possibleCondition: { type: "string" },
      likelihood: {
        type: "string",
        enum: ["likely", "possible", "uncertain"],
      },
      confidence: { type: "number" },
      severity: {
        type: "string",
        enum: ["low", "moderate", "high", "unclear"],
      },
      observations: { type: "array", items: { type: "string" } },
      recommendedActions: { type: "array", items: { type: "string" } },
      caveat: { type: "string" },
      imageQuality: {
        type: "string",
        enum: ["acceptable", "insufficient"],
      },
    },
    required: ["possibleCondition"],
  };
}
