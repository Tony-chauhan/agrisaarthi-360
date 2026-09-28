import type {
  AssistantProvider,
  AssistantProviderResult,
  AssistantTopic,
} from "./types";

/**
 * FALLBACK ASSISTANT PROVIDER — deterministic, no randomness, no AI claim.
 * Handles known questions with the current farm context; unknown questions
 * get a conservative context-based answer. Every response is labeled as
 * fallback upstream — never presented as AI-generated.
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

export function createDemoAssistantProvider(): AssistantProvider {
  return {
    name: "demo-assistant",

    async ask(input: {
      question: string;
      topic: AssistantTopic;
      context: import("./types").AssistantContextPacket;
    }): Promise<AssistantProviderResult> {
      return { status: "success", payload: demoReply(input) };
    },
  };
}

function demoReply(input: {
  question: string;
  topic: AssistantTopic;
  context: import("./types").AssistantContextPacket;
}): DemoReply {
  const { context } = input;
  const crop = context.crop?.selectedCrop.value;
  const location = context.farm.location?.value;
  const size = context.farm.farmSize?.value;
  const q = input.question.toLowerCase();

  /* --- Known demo question 1: "What should I do today?" ------------- */
  if (q.includes("what should i do today")) {
    const parts: string[] = [
      "Based on your current farm context, review today's weather action,",
    ];
    parts.push(
      crop
        ? `check your ${crop} for visible stress,`
        : "check your crop for visible stress,"
    );
    parts.push("and review any pending farm operation.");
    const actions = [
      "Review weather action",
      "Check crop health",
      "Review operation status",
    ];
    return {
      answer: parts.join(" "),
      actions,
      caveat:
        "Fallback guidance built from the current app context — not AI-generated advice.",
    };
  }

  /* --- Known question 2: "Is irrigation needed?" ---------------------- */
  if (q.includes("irrigation") || q.includes("irrigate")) {
    if (context.weather) {
      return {
        answer: `The current weather rule suggests: ${context.weather.actionTitle.toLowerCase()}. ${context.weather.actionMessage}`,
        actions: [
          "Open Weather for the full forecast",
          "Check soil moisture before deciding",
        ],
        caveat:
          "Weather action comes from the decision engine; check field conditions before acting.",
      };
    }
    return {
      answer:
        "I don't have a current weather result in this session. Open Weather to load the latest farm weather, then ask again.",
      actions: ["Open Weather page"],
      caveat: "Fallback response — no weather data was available.",
    };
  }

  /* --- Known question 3: "What should I check in my crop?" ------------ */
  if (q.includes("what should i check in my crop")) {
    return {
      answer: crop
        ? `Walk your ${crop} field and look for visible stress: yellowing leaves, spots, wilting or unusual growth. If you notice anything unusual, upload a clear leaf photo in Crop Health for an image-based screening.`
        : "Walk your field and look for visible stress: yellowing leaves, spots, wilting or unusual growth. Select a crop in your Farm Profile for more specific guidance.",
      actions: crop
        ? [
            "Walk the field and observe",
            "Upload a leaf photo in Crop Health",
          ]
        : ["Select a crop in Farm Profile", "Observe the field regularly"],
      caveat:
        "Visual observation guidance only — not a diagnosis. Confirm with a qualified agriculture professional.",
    };
  }

  /* --- Weather questions with/without context ------------------------ */
  if (input.topic === "weather") {
    if (context.weather) {
      return {
        answer: `The current weather rule suggests: ${context.weather.actionTitle.toLowerCase()}. ${context.weather.actionMessage}`,
        actions: ["Open Weather for the full forecast"],
        caveat:
          "Weather information is supplied by the app — it is not invented here.",
      };
    }
    return {
      answer:
        "I don't have a current weather result in this session. Open Weather to load the latest farm weather.",
      actions: ["Open Weather page"],
      caveat: "Fallback response — no weather data was available.",
    };
  }

  /* --- Crop-health questions ----------------------------------------- */
  if (input.topic === "crop-health") {
    if (context.health) {
      return {
        answer: `The latest image check indicates a possible ${context.health.possibleCondition} pattern on ${context.health.crop}. That is an image-based screening result, not a confirmed diagnosis.`,
        actions: [
          "Open Crop Health for details",
          "Consult a qualified agriculture professional",
        ],
        caveat: "Image-based screening is not a diagnosis.",
      };
    }
    return {
      answer: "Upload a clear crop/leaf image in Crop Health first. I can then reference the screening result here — I cannot diagnose from text alone.",
      actions: ["Open Crop Health page"],
      caveat: "No crop-health result exists in this session.",
    };
  }

  /* --- Operation questions ------------------------------------------- */
  if (input.topic === "farm-operation") {
    if (context.operation) {
      return {
        answer: `Your latest operation request (${context.operation.operationName} — ${context.operation.machineName}) has status: ${context.operation.statusText}. Final scheduling is confirmed directly with the provider.`,
        actions: ["Open Farm Operations to view the workflow"],
        caveat: "Machinery availability depends on connected service providers.",
      };
    }
    return {
      answer:
        "No farm operation has been planned in this session yet. You can choose an operation and review suitable machinery in Farm Operations.",
      actions: ["Open Farm Operations page"],
      caveat: "Machinery availability depends on connected service providers.",
    };
  }

  /* --- Crop recommendation questions ---------------------------------- */
  if (input.topic === "crop-recommendation") {
    return {
      answer:
        "Your Crop Advisor currently generates recommendations from the configured farm profile using transparent rules. Open Crop Advisor to see them — this assistant does not replace that engine.",
      actions: ["Open Crop Advisor page"],
      caveat:
        "Recommendations come from the decision engine; check against local agronomic and market conditions.",
    };
  }

  /* --- Unsupported questions ------------------------------------------ */
  if (input.topic === "unsupported") {
    return {
      answer:
        "I'm focused on agriculture and farm decision support. I can help with your farm, crop, weather, crop health, or farm-operation questions.",
      actions: [],
      caveat: "",
    };
  }

  /* --- Generic fallback for any other question ------------------------ */
  const contextLine = hasContextField(context, (farm) => farm.location)
    ? `For your farm${location ? ` in ${location}` : ""}${size ? ` (${size})` : ""}${crop ? ` growing ${crop}` : ""}, `
    : "";

  return {
    answer: `${contextLine}here is general, conservative guidance based on the context available in this session: review your weather action, observe your crop for visible stress, and plan field work around the forecast. Details are limited to the app's current context.`,
    actions: ["Review weather action", "Observe crop", "Check farm operations"],
    caveat:
      "Fallback guidance built from the current app context — not AI-generated advice.",
  };
}
