import type {
  AssistantProvider,
  AssistantProviderResult,
  AssistantTopic,
} from "./types";
import type { Lang } from "@/lib/i18n/types";
import { t as dict } from "@/lib/i18n";

/**
 * FALLBACK ASSISTANT PROVIDER — deterministic, no randomness, no AI claim.
 * Handles known questions with the current farm context; unknown questions
 * get a conservative context-based answer. Every response is labeled as
 * fallback upstream — never presented as AI-generated.
 *
 * English is the deterministic default (verify suites assert exact English
 * strings); pass `lang` to produce the reply in the selected UI language.
 */

/** Known demo questions → deterministic response builders. */
type DemoReply = {
  answer: string;
  actions: string[];
  caveat: string;
};

function hasContextField(
  context: import("./types").AssistantContextPacket,
  get: (farm: import("./types").AssistantContextPacket["farm"]) =>
    | { value: string }
    | undefined
): boolean {
  return Boolean(get(context.farm));
}

export function createDemoAssistantProvider(lang: Lang = "en"): AssistantProvider {
  return {
    name: "demo-assistant",

    async ask(input: {
      question: string;
      topic: AssistantTopic;
      context: import("./types").AssistantContextPacket;
    }): Promise<AssistantProviderResult> {
      return { status: "success", payload: demoReply(input, lang) };
    },
  };
}

function demoReply(
  input: {
    question: string;
    topic: AssistantTopic;
    context: import("./types").AssistantContextPacket;
  },
  lang: Lang = "en"
): DemoReply {
  const { context } = input;
  const crop = context.crop?.selectedCrop.value;
  const location = context.farm.location?.value;
  const size = context.farm.farmSize?.value;
  const q = input.question.toLowerCase();

  /* English strings (deterministic defaults asserted by suites). */
  const A = dict("en").assistantLib;
  /* Hindi strings when requested. */
  const H = lang === "hi" ? dict("hi").assistantLib : null;

  /* --- Known demo question 1: "What should I do today?" ------------- */
  if (q.includes("what should i do today") || (H && q.includes("आज मैं क्या करूं"))) {
    return {
      answer: (H ?? A).todayAnswer(crop),
      actions: (H ?? A).todayActions,
      caveat: (H ?? A).todayCaveat,
    };
  }

  /* --- Known question 2: "Is irrigation needed?" ---------------------- */
  if (
    q.includes("irrigation") ||
    q.includes("irrigate") ||
    (H && (q.includes("सिंचाई") || q.includes("पानी देना")))
  ) {
    if (context.weather) {
      return {
        answer: (H ?? A).weatherWithContext(
          context.weather.actionTitle,
          context.weather.actionMessage,
        ),
        actions: (H ?? A).weatherActions,
        caveat: (H ?? A).weatherCaveat,
      };
    }
    return {
      answer: (H ?? A).weatherNoData,
      actions: (H ?? A).weatherNoDataActions,
      caveat: (H ?? A).weatherNoDataCaveat,
    };
  }

  /* --- Known question 3: "What should I check in my crop?" ------------ */
  if (
    q.includes("what should i check in my crop") ||
    (H && q.includes("फसल में क्या जांचूं"))
  ) {
    return {
      answer: (H ?? A).cropCheckAnswer(crop),
      actions: crop
        ? (H ?? A).cropCheckActionsWithCrop
        : (H ?? A).cropCheckActionsWithoutCrop,
      caveat: (H ?? A).cropCheckCaveat,
    };
  }

  /* --- Weather questions with/without context ------------------------ */
  if (input.topic === "weather") {
    if (context.weather) {
      return {
        answer: (H ?? A).weatherWithContextSingle(
          context.weather.actionTitle,
          context.weather.actionMessage,
        ),
        actions: [(H ?? A).weatherActions[0]],
        caveat: (H ?? A).weatherLiveCaveat,
      };
    }
    return {
      answer: (H ?? A).weatherNoDataShort,
      actions: (H ?? A).weatherNoDataActions,
      caveat: (H ?? A).weatherNoDataCaveat,
    };
  }

  /* --- Crop-health questions ----------------------------------------- */
  if (input.topic === "crop-health") {
    if (context.health) {
      return {
        answer: (H ?? A).healthWithResult(
          context.health.possibleCondition,
          context.health.crop,
        ),
        actions: (H ?? A).healthWithResultActions,
        caveat: (H ?? A).healthCaveat,
      };
    }
    return {
      answer: (H ?? A).healthNoResult,
      actions: (H ?? A).healthNoResultActions,
      caveat: (H ?? A).healthNoResultCaveat,
    };
  }

  /* --- Operation questions ------------------------------------------- */
  if (input.topic === "farm-operation") {
    if (context.operation) {
      return {
        answer: (H ?? A).operationWithResult(
          context.operation.operationName,
          context.operation.machineName,
          context.operation.statusText,
        ),
        actions: (H ?? A).operationActions,
        caveat: (H ?? A).operationCaveat,
      };
    }
    return {
      answer: (H ?? A).operationNoResult,
      actions: (H ?? A).operationNoResultActions,
      caveat: (H ?? A).operationCaveat,
    };
  }

  /* --- Crop recommendation questions ---------------------------------- */
  if (input.topic === "crop-recommendation") {
    return {
      answer: (H ?? A).recommendationAnswer,
      actions: (H ?? A).recommendationActions,
      caveat: (H ?? A).recommendationCaveat,
    };
  }

  /* --- Unsupported questions ------------------------------------------ */
  if (input.topic === "unsupported") {
    return {
      answer: (H ?? A).redirect,
      actions: [],
      caveat: "",
    };
  }

  /* --- Generic fallback for any other question ------------------------ */
  const contextLine = hasContextField(context, (farm) => farm.location)
    ? (H ?? A).genericContextLine(location, size, crop)
    : "";

  return {
    answer: `${contextLine}${(H ?? A).genericAnswer}`,
    actions: (H ?? A).genericActions,
    caveat: (H ?? A).todayCaveat,
  };
}
