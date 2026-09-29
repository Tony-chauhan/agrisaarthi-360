import type {
  AssistantProviderResult,
  AssistantResponse,
  AssistantTopic,
} from "./types";
import type { Lang } from "@/lib/i18n/types";
import { createGeminiAssistantProvider } from "./gemini-provider";
import { createDemoAssistantProvider } from "./demo-provider";
import { normalizeAssistantResponse } from "./normalize-response";

/**
 * ASSISTANT PROVIDER ORCHESTRATOR — server-side only.
 *
 * Resolves the assistant provider (real Gemini when GEMINI_API_KEY is set,
 * deterministic demo otherwise) and guarantees the caller always receives
 * a well-formed AssistantResponse. Provider failures NEVER crash the app
 * and NEVER leak raw errors — they become a clearly-labeled demo fallback.
 */

/** Resolve the provider available in this environment. */
export function resolveAssistantProvider(lang: Lang = "en"): {
  provider: import("./types").AssistantProvider;
  isRealProvider: boolean;
} {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return { provider: createDemoAssistantProvider(lang), isRealProvider: false };
  }
  return {
    provider: createGeminiAssistantProvider(apiKey, lang),
    isRealProvider: true,
  };
}

/**
 * Run one assistant request with automatic fallback.
 * Server-side only (needs process.env for the real provider).
 * `lang` is the UI language: it selects the demo-reply language and is
 * forwarded to the Gemini provider so it can honor the language directive.
 */
export async function runAssistant(input: {
  question: string;
  topic: AssistantTopic;
  context: import("./types").AssistantContextPacket;
  lang?: Lang;
}): Promise<AssistantResponse> {
  const lang = input.lang ?? "en";
  const { provider, isRealProvider } = resolveAssistantProvider(lang);

  if (!isRealProvider) {
    // No key configured — deterministic demo path, labeled as such.
    const demo = createDemoAssistantProvider(lang);
    const demoResult = await demo.ask(input);
    const normalized = normalizeAssistantResponse(demoResult.status === "success" ? demoResult.payload : {}, {
      source: "demo",
      isFallback: true,
      topic: input.topic,
    });
    if (normalized) return normalized;
    return hardFallback(input.topic);
  }

  try {
    const result: AssistantProviderResult = await provider.ask(input);
    if (result.status === "success") {
      const normalized = normalizeAssistantResponse(result.payload, {
        source: "model-result",
        isFallback: false,
        topic: input.topic,
      });
      if (normalized) return normalized;
    }
    // Malformed/failed provider output → deterministic demo fallback.
    return await demoFallback(input, lang);
  } catch {
    // Timeout, network failure, etc. — contained, never leaked.
    return await demoFallback(input, lang);
  }
}

async function demoFallback(
  input: {
    question: string;
    topic: AssistantTopic;
    context: import("./types").AssistantContextPacket;
  },
  lang: Lang = "en"
): Promise<AssistantResponse> {
  const demo = createDemoAssistantProvider(lang);
  const result = await demo.ask(input);
  const normalized = normalizeAssistantResponse(
    result.status === "success" ? result.payload : {},
    { source: "demo", isFallback: true, topic: input.topic }
  );
  if (normalized) return normalized;
  return hardFallback(input.topic);
}

/** Last-resort static response — unreachable in practice, kept as a guarantee. */
function hardFallback(topic: AssistantTopic): AssistantResponse {
  return {
    answer:
      "I'm focused on agriculture and farm decision support. I can help with your farm, crop, weather, crop health, or farm-operation questions.",
    actions: [],
    caveat: "Fallback guidance — the assistant is temporarily unavailable.",
    source: "demo",
    isFallback: true,
    topic,
  };
}
