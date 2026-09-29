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

/** Ordered — first match wins. Weather/health/operation checked early.
 *  Hindi keywords included so Hindi questions route identically. */
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
      // Hindi
      "बीमारी",
      "रोग",
      "पत्ती",
      "धब्बा",
      "कीट",
      "फफूंद",
      "पीली",
      "मुरझा",
      "फसल स्वास्थ्य",
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
      // Hindi
      "मौसम",
      "बारिश",
      "सिंचाई",
      "तापमान",
      "पूर्वानुमान",
      "नमी",
      "हवा",
      "गर्मी",
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
      // Hindi
      "मशीन",
      "ट्रैक्टर",
      "हार्वेस्टर",
      "ट्रॉली",
      "स्प्रेयर",
      "परिवहन",
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
      // Hindi
      "कौन सी फसल",
      "कौन-सी फसल",
      "फसल सलाह",
      "फसल की सिफारिश",
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
      // Hindi
      "मेरी फसल",
      "बुवाई",
      "बीज",
      "खाद",
      "कटाई",
      "उपज",
      "खेत",
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
      // Hindi
      "आज",
      "मैं क्या करूं",
      "योजना",
      "खेत",
      "मिट्टी",
      "प्रोफ़ाइल",
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
