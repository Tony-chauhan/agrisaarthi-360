import type { DataSource } from "@/lib/types";
import type {
  AssistantResponse,
  AssistantTopic,
  ProviderAssistantPayload,
} from "./types";

/**
 * RESPONSE NORMALIZER — strict validation gate.
 * Provider payloads that fail validation never reach the UI; the
 * orchestrator converts them into the deterministic demo fallback.
 */

/** Maximum lengths — guards against runaway model output. */
const MAX_ANSWER_LENGTH = 1200;
const MAX_ACTIONS = 4;
const MAX_ACTION_LENGTH = 120;
const MAX_CAVEAT_LENGTH = 400;

/**
 * Validate a raw provider payload into an AssistantResponse.
 * Returns null when the payload is malformed — callers must fall back.
 */
export function normalizeAssistantResponse(
  payload: ProviderAssistantPayload,
  meta: { source: DataSource; isFallback: boolean; topic: AssistantTopic }
): AssistantResponse | null {
  if (payload === null || typeof payload !== "object") return null;

  const answerRaw = payload.answer;
  if (typeof answerRaw !== "string") return null;
  const answer = answerRaw.trim();
  if (answer.length === 0 || answer.length > MAX_ANSWER_LENGTH) return null;

  let actions: string[] = [];
  if (payload.actions !== undefined) {
    if (!Array.isArray(payload.actions)) return null;
    const allStrings = payload.actions.every((a) => typeof a === "string");
    if (!allStrings) return null;
    actions = (payload.actions as string[])
      .map((a) => a.trim())
      .filter((a) => a.length > 0 && a.length <= MAX_ACTION_LENGTH)
      .slice(0, MAX_ACTIONS);
  }

  let caveat: string | undefined;
  if (payload.caveat !== undefined) {
    if (typeof payload.caveat !== "string") return null;
    const trimmed = payload.caveat.trim();
    caveat = trimmed.length > 0 ? trimmed.slice(0, MAX_CAVEAT_LENGTH) : undefined;
  }

  return {
    answer,
    actions,
    caveat,
    source: meta.source,
    isFallback: meta.isFallback,
    topic: meta.topic,
  };
}
