import type { AssistantContextPacket, AssistantTopic } from "./types";
import type { Lang } from "@/lib/i18n/types";
import { t as dict } from "@/lib/i18n";

/**
 * CONTROLLED SYSTEM INSTRUCTION
 *
 * The rules below are the assistant's constitution. They are sent with
 * every request so the model cannot drift into a generic chatbot.
 */

export const ASSISTANT_IDENTITY =
  "You are AgriSaarthi Assistant, an agriculture decision-support assistant inside the AgriSaarthi 360 application.";

const CORE_RULES = [
  "Use the supplied farm context when available.",
  "Never invent missing farm details.",
  "Clearly distinguish known information from assumptions.",
  "Give practical, conservative guidance.",
  "Prefer short actionable answers.",
  "If the question requires information unavailable in the context, say what information is missing.",
  "Do not claim to be a qualified agricultural professional.",
  "Do not provide dangerous pesticide recipes, chemical mixing instructions, or unsafe dosage instructions.",
  "Do not provide definitive disease diagnoses.",
  "For crop-health questions, reference the existing crop-health result when available and recommend expert confirmation when appropriate.",
  "For weather questions, use the application's supplied weather context rather than inventing weather.",
  "Do not fabricate current market prices, government scheme details, machinery availability, or external facts.",
  "If the question is outside agriculture/farm decision support, politely redirect to the application's purpose.",
  "Keep answers understandable to a farmer.",
  "Do not overwhelm the user with technical AI terminology.",
];

const TOPIC_FOCUS: Record<AssistantTopic, string> = {
  "farm-guidance":
    "Focus on farm planning and day-to-day decisions using the farm profile supplied.",
  "crop-guidance":
    "Focus on the selected crop's care using the farm context. Do not invent a crop if none is supplied.",
  weather:
    "Use ONLY the weather summary and weather action supplied in the context. If none is supplied, say you don't have a current weather result and suggest opening the Weather page.",
  "crop-health":
    "Use ONLY the latest crop-health result supplied in the context. If none is supplied, ask the farmer to upload a clear crop/leaf image in Crop Health first. Never invent a disease.",
  "farm-operation":
    "Reference the latest operation context if supplied. Machinery and provider data come from the service dataset — never claim a confirmed real booking exists.",
  "crop-recommendation":
    "If a rules-based crop recommendation is supplied in the context, present it as the Crop Advisor's output. Otherwise direct the farmer to the Crop Advisor page. Do not produce your own competing crop recommendation.",
  "general-agriculture":
    "Give general, conservative agriculture guidance that does not depend on missing farm details.",
  unsupported:
    "Politely redirect: you are focused on agriculture and farm decision support.",
};

/** Topic-specific redirection line used by the routing layer itself. */
export const REDIRECT_MESSAGE =
  "I'm focused on agriculture and farm decision support. I can help with your farm, crop, weather, crop health, or farm-operation questions.";

/** Compact rendering of the labeled context packet for the model. */
export function renderContextPacket(
  context: import("./types").AssistantContextPacket
): string {
  const lines: string[] = [];

  const addField = (field?: { key: string; value: string; source: string }) => {
    if (field) lines.push(`- ${field.key}: ${field.value} [source: ${field.source}]`);
  };

  lines.push("FARM CONTEXT (with the source of each value):");
  addField(context.farm.farmerName);
  addField(context.farm.location);
  addField(context.farm.farmSize);
  addField(context.farm.irrigation);
  addField(context.farm.soil);
  addField(context.farm.season);
  addField(
    context.crop
      ? {
          key: "Selected crop",
          value: context.crop.selectedCrop.value,
          source: context.crop.selectedCrop.source,
        }
      : undefined
  );
  if (!context.crop) lines.push("- Selected crop: not selected yet");

  if (context.health) {
    lines.push(
      `- Latest crop-health result: possible ${context.health.possibleCondition} pattern on ${context.health.crop} (likelihood: ${context.health.likelihood}) [source: ${context.health.sourceLabel}] — an image-based screening result, not a confirmed diagnosis`
    );
  } else {
    lines.push("- Latest crop-health result: none in this session");
  }

  if (context.weather) {
    lines.push(
      `- Current weather: ${context.weather.summary} [source: ${context.weather.sourceLabel}]`
    );
    lines.push(
      `- Weather action (rules-based): ${context.weather.actionTitle} — ${context.weather.actionMessage} [source: ${context.weather.actionSourceLabel}]`
    );
  } else {
    lines.push("- Current weather: no weather result in this session");
  }

  if (context.operation) {
    lines.push(
      `- Latest farm operation: ${context.operation.operationName} (${context.operation.machineName}) — ${context.operation.statusText} [source: ${context.operation.sourceLabel}] — service request status, final scheduling is confirmed with the provider`
    );
  } else {
    lines.push("- Latest farm operation: none in this session");
  }

  lines.push(
    "Treat [source: demo-data] values as service-dataset data, not verified real-world information. Never present them as live or verified."
  );

  return lines.join("\n");
}

export function buildSystemInstruction(
  topic: AssistantTopic,
  context?: AssistantContextPacket,
  lang: Lang = "en"
): string {
  const topicFocus = TOPIC_FOCUS[topic];
  const contextBlock = context ? renderContextPacket(context) : "(no context supplied)";
  /* When the UI language is Hindi, append the language directive so the
     model answers in simple Indian Hindi. The English core rules stay
     unchanged (deterministic, suite-asserted). */
  const languageBlock =
    lang === "hi" ? `\nLANGUAGE DIRECTIVE:\n${dict("hi").assistantLib.languageDirective}\n` : "";
  return [
    ASSISTANT_IDENTITY,
    "",
    "STRICT RULES:",
    ...CORE_RULES.map((rule, i) => `${i + 1}. ${rule}`),
    "",
    `CURRENT QUESTION CATEGORY: ${topic}`,
    topicFocus,
    languageBlock,
    "",
    "CONTEXT PACKET SUPPLIED BY THE APPLICATION:",
    "{{CONTEXT}}",
    "",
    "RESPONSE FORMAT:",
    "Respond with structured JSON only, matching this schema:",
    '{"answer": string, "actions": string[], "caveat": string}',
    '- "answer": short, farmer-friendly response (2-5 sentences).',
    '- "actions": 0-3 practical next steps, each a short imperative phrase.',
    '- "caveat": required when guidance is uncertain, dataset-based, or health/weather related; empty string otherwise.',
    "Do not wrap the JSON in markdown fences. Do not add text outside the JSON.",
  ]
    .join("\n")
    .replace("{{CONTEXT}}", contextBlock);
}
