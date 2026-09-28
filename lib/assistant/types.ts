import type { DataSource } from "@/lib/types";

/**
 * ASSISTANT CONTRACT
 *
 * The UI consumes AssistantResponse only. Real Gemini results are labeled
 * "model-result"; deterministic fallbacks are labeled "demo" and flagged
 * isFallback. The provider layer never leaks raw errors to the UI.
 */

/* ------------------------------------------------------------------ */
/* Context packet — compact, typed, source-labeled                     */
/* ------------------------------------------------------------------ */

/** How to treat a context value. Demo context must never be treated as verified. */
export type ContextSourceLabel =
  | "user-provided"
  | "demo-data"
  | "rules-based"
  | "model-result"
  | "live-api";

/** One labeled context line sent to the model. */
export interface ContextField {
  /** Human-readable key, e.g. "Location". */
  key: string;
  /** The value as known in this session. */
  value: string;
  /** Where this value came from — controls how the model may use it. */
  source: ContextSourceLabel;
}

/** Latest crop-health summary the assistant may reference (optional). */
export interface AssistantHealthContext {
  crop: string;
  possibleCondition: string;
  likelihood: string;
  isFallback: boolean;
  sourceLabel: ContextSourceLabel;
}

/** Latest weather summary + rules action the assistant may use (optional). */
export interface AssistantWeatherContext {
  /** e.g. "27.4°C, partly cloudy, 65% rain probability tomorrow". */
  summary: string;
  actionTitle: string;
  actionMessage: string;
  sourceLabel: ContextSourceLabel;
  /** The weather action itself is always rules-based. */
  actionSourceLabel: ContextSourceLabel;
}

/** Latest demo operation summary the assistant may reference (optional). */
export interface AssistantOperationContext {
  operationName: string;
  machineName: string;
  statusText: string;
  sourceLabel: ContextSourceLabel;
}

/**
 * The complete compact context packet. Every present field was actually
 * available at request time — the packet NEVER invents placeholders.
 */
export interface AssistantContextPacket {
  farm: {
    farmerName?: ContextField;
    location?: ContextField;
    farmSize?: ContextField;
    irrigation?: ContextField;
    soil?: ContextField;
    season?: ContextField;
  };
  crop?: {
    selectedCrop: ContextField;
  };
  health?: AssistantHealthContext;
  weather?: AssistantWeatherContext;
  operation?: AssistantOperationContext;
}

/** Client → API request body. */
export interface AssistantRequest {
  question: string;
  context: AssistantContextPacket;
}

/** Compact latest-interaction summary for the Dashboard card. */
export interface LatestAssistantInteraction {
  question: string;
  answerPreview: string;
  source: DataSource;
  isFallback: boolean;
  /** ISO timestamp of the interaction. */
  at: string;
}

/* ------------------------------------------------------------------ */
/* Question routing (deterministic keyword layer — no ML)              */
/* ------------------------------------------------------------------ */

export type AssistantTopic =
  | "farm-guidance"
  | "crop-guidance"
  | "weather"
  | "crop-health"
  | "farm-operation"
  | "crop-recommendation"
  | "general-agriculture"
  | "unsupported";

/* ------------------------------------------------------------------ */
/* Response contract                                                   */
/* ------------------------------------------------------------------ */

/**
 * Normalized, validated assistant response. Structured — the UI renders
 * fields directly without markdown parsing.
 */
export interface AssistantResponse {
  answer: string;
  actions: string[];
  caveat?: string;
  source: DataSource;
  isFallback: boolean;
  /** Deterministic topic classification (mirrors routing). */
  topic: AssistantTopic;
}

/** Raw structured payload expected from the text provider. */
export interface ProviderAssistantPayload {
  answer?: unknown;
  actions?: unknown;
  caveat?: unknown;
}

/** What a provider implementation must return. */
export type AssistantProviderResult =
  | { status: "success"; payload: ProviderAssistantPayload }
  | { status: "failed"; reason: string };

/** Any assistant provider implementation. */
export interface AssistantProvider {
  readonly name: string;
  ask(input: {
    question: string;
    topic: AssistantTopic;
    context: AssistantContextPacket;
  }): Promise<AssistantProviderResult>;
}
