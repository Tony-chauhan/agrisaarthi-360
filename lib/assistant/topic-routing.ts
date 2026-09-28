import type { AssistantTopic } from "./types";

/**
 * QUESTION ROUTING — simple deterministic keyword layer (no ML).
 * Used to focus the system instruction; never used to answer directly.
 */

interface TopicRule {
  topic: AssistantTopic;
  /** Lowercase keywords; a question matching any is routed to the topic. */
  keywords: string[];
}

/** Ordered — first match wins. Weather/health/operation checked early. */
const RULES: TopicRule[] = [
  {
    topic: "crop-health",
    keywords: [
      "disease",
      "leaf",
      "spot",
      "rust",
      "blight",
      "pest",
      "insect",
      "yellow",
      "wilt",
      "fungus",
      "what is wrong with my crop",
      "wrong with my crop",
      "crop health",
    ],
  },
  {
    topic: "weather",
    keywords: [
      "weather",
      "rain",
      "irrigate",
      "irrigation",
      "water today",
      "temperature",
      "forecast",
      "humidity",
      "wind",
      "heat",
    ],
  },
  {
    topic: "farm-operation",
    keywords: [
      "machinery",
      "machine",
      "tractor",
      "harvester",
      "operation",
      "booking",
      "provider",
      "trolley",
      "sprayer",
      "transport",
    ],
  },
  {
    topic: "crop-recommendation",
    keywords: [
      "which crop",
      "what crop",
      "which crop should i grow",
      "crop should i grow",
      "grow this season",
      "recommend a crop",
      "crop recommendation",
    ],
  },
  {
    topic: "crop-guidance",
    keywords: [
      "my crop",
      "sowing",
      "seed",
      "fertilizer",
      "harvest",
      "yield",
      "field",
      "crop care",
    ],
  },
  {
    topic: "farm-guidance",
    keywords: [
      "today",
      "what should i do",
      "plan",
      "checklist",
      "farm",
      "soil",
      "profile",
    ],
  },
];

/** Questions clearly outside agriculture decision support. */
const UNSUPPORTED_PATTERNS = [
  /python|javascript|code|program|algorithm/i,
  /stock|crypto|bitcoin|share market/i,
  /movie|song|celebrity|game|recipe for cake/i,
  /joke|poem|story|essay/i,
  /president|election|politics/i,
];

export function classifyQuestion(question: string): AssistantTopic {
  const q = question.toLowerCase();

  for (const pattern of UNSUPPORTED_PATTERNS) {
    if (pattern.test(q)) return "unsupported";
  }

  for (const rule of RULES) {
    if (rule.keywords.some((k) => q.includes(k))) {
      return rule.topic;
    }
  }

  return "general-agriculture";
}
