import type {
  AssistantProvider,
  AssistantProviderResult,
  AssistantTopic,
} from "./types";
import type { Lang } from "@/lib/i18n/types";
import { buildSystemInstruction } from "./system-instruction";

/**
 * GEMINI TEXT PROVIDER — server-side only.
 *
 * Reads GEMINI_API_KEY (injected, never read from env inside the provider
 * so callers control resolution) and GEMINI_ASSISTANT_MODEL.
 * SECURITY: never imported into client components; the API key never
 * reaches the browser, NEXT_PUBLIC_*, or rendered HTML.
 */

/** Server-only, configurable model — default is a current Flash text model. */
export const GEMINI_ASSISTANT_MODEL =
  process.env.GEMINI_ASSISTANT_MODEL || "gemini-3.6-flash";

/** Conservative timeout for the provider call (ms). */
const PROVIDER_TIMEOUT_MS = 25_000;

export class AssistantProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssistantProviderError";
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

export function createGeminiAssistantProvider(
  apiKey: string,
  lang: Lang = "en"
): AssistantProvider {
  return {
    name: "gemini-assistant",

    async ask(input: {
      question: string;
      topic: AssistantTopic;
      context: import("./types").AssistantContextPacket;
    }): Promise<AssistantProviderResult> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_ASSISTANT_MODEL}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: buildSystemInstruction(input.topic, input.context, lang),
                  },
                ],
              },
              contents: [
                {
                  role: "user",
                  parts: [{ text: input.question }],
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
          // Never leak provider internals — classify and contain.
          return {
            status: "failed",
            reason: `Provider responded with status ${response.status}`,
          };
        }

        const data = (await response.json()) as GeminiResponse;

        const text = data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("")
          .trim();

        if (!text) {
          return { status: "failed", reason: "Provider returned no content" };
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          return {
            status: "failed",
            reason: "Provider returned malformed JSON",
          };
        }

        if (parsed === null || typeof parsed !== "object") {
          return {
            status: "failed",
            reason: "Provider response was not an object",
          };
        }

        return {
          status: "success",
          payload: parsed as import("./types").ProviderAssistantPayload,
        };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return { status: "failed", reason: "Provider timed out" };
        }
        return { status: "failed", reason: "Provider request failed" };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

/** Typed JSON schema for structured output (Gemini responseSchema format). */
function buildResponseSchema() {
  return {
    type: "object",
    properties: {
      answer: { type: "string" },
      actions: { type: "array", items: { type: "string" } },
      caveat: { type: "string" },
    },
    required: ["answer"],
  };
}
