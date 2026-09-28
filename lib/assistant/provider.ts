import type {
  AssistantProviderResult,
  AssistantResponse,
  AssistantTopic,
} from "./types";
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
export function resolveAssistantProvider(): {
  provider: import("./types").AssistantProvider;
  isRealProvider: boolean;
} {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return { provider: createDemoAssistantProvider(), isRealProvider: false };
  }
  return {
    provider: createGeminiAssistantProvider(apiKey),
    isRealProvider: true,
  };
}

/**
 * Run one assistant request with automatic fallback.
 * Server-side only (needs process.env for the real provider).
 */
export async function runAssistant(input: {
  question: string;
  topic: AssistantTopic;
  context: import("./types").AssistantContextPacket;
}): Promise<AssistantResponse> {
  const { provider, isRealProvider } = resolveAssistantProvider();

  if (!isRealProvider) {
    // No key configured — deterministic demo path, labeled as such.
    const demo = createDemoAssistantProvider();
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
    return await demoFallback(input);
  } catch {
    // Timeout, network failure, etc. — contained, never leaked.
    return await demoFallback(input);
  }
}

async function demoFallback(input: {
  question: string;
  topic: AssistantTopic;
  context: import("./types").AssistantContextPacket;
}): Promise<AssistantResponse> {
  const demo = createDemoAssistantProvider();
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
