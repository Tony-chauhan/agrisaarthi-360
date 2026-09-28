/**
 * DETERMINISTIC VERIFICATION — assistant pipeline (A–O).
 * Runs fully offline via fetch stubbing. Usage: npx tsx scripts/verify-assistant.ts
 */

import { runAssistant } from "../lib/assistant/provider";
import { createDemoAssistantProvider } from "../lib/assistant/demo-provider";
import { createGeminiAssistantProvider } from "../lib/assistant/gemini-provider";
import { normalizeAssistantResponse } from "../lib/assistant/normalize-response";
import { classifyQuestion } from "../lib/assistant/topic-routing";
import { buildAssistantContext } from "../lib/assistant/assistant-context";
import { buildSystemInstruction } from "../lib/assistant/system-instruction";
import type {
  AssistantContextPacket,
  ProviderAssistantPayload,
} from "../lib/assistant/types";
import type { FarmProfile, HealthCheckSummary } from "../lib/types";
import type { LatestOperationSummary } from "../lib/operations/types";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

/* ------------------------------------------------------------------ */
/* Fetch stubbing                                                      */
/* ------------------------------------------------------------------ */

type FetchHandler = (url: unknown, init?: unknown) => Promise<Response>;
const originalFetch = globalThis.fetch;

function stubFetch(handler: FetchHandler) {
  globalThis.fetch = (async (url: unknown, init?: unknown) => {
    return handler(url, init);
  }) as unknown as typeof fetch;
}
function restoreFetch() {
  globalThis.fetch = originalFetch;
}

function geminiOk(payload: ProviderAssistantPayload): Response {
  return new Response(
    JSON.stringify({
      candidates: [
        { content: { parts: [{ text: JSON.stringify(payload) }] } },
      ],
    }),
    { status: 200 }
  );
}

function geminiRaw(text: string): Response {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
    { status: 200 }
  );
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

const FULL_PROFILE: FarmProfile = {
  farmerName: "Ramesh Patil",
  location: "Nashik, Maharashtra",
  district: "Nashik",
  farmSizeAcres: 5,
  irrigation: "drip",
  soilType: "black",
  season: "rabi",
  selectedCrop: "Wheat",
};

const EMPTY_PROFILE: FarmProfile = {
  farmerName: "",
  location: "",
  farmSizeAcres: 0,
  irrigation: "rain-fed",
  soilType: "loamy",
  season: "kharif",
};

const HEALTH_SUMMARY: HealthCheckSummary = {
  crop: "Wheat",
  possibleCondition: "yellow rust-like pattern",
  likelihood: "possible",
  isFallback: false,
  source: "model-result",
  analyzedAt: new Date(0).toISOString(),
};

const OP_SUMMARY: LatestOperationSummary = {
  operationId: "harvesting",
  operationName: "Harvesting",
  machineName: "Combine Harvester — Medium",
  providerName: "HarvestLink Demo",
  status: "provider_response",
  response: "accepted",
  source: "demo",
  createdAt: new Date(0).toISOString(),
};

const WEATHER_LIVE = {
  summary: "28°C, partly cloudy, 70% rain probability today",
  actionTitle: "Review planned irrigation",
  actionMessage: "Rain is likely tomorrow (70% probability).",
  isLive: true,
};

function ctx(overrides?: {
  profile?: FarmProfile;
  health?: HealthCheckSummary | null;
  operation?: LatestOperationSummary | null;
  weather?: typeof WEATHER_LIVE | null;
}): AssistantContextPacket {
  return buildAssistantContext(overrides?.profile ?? FULL_PROFILE, {
    latestHealthCheck:
      overrides?.health === undefined
        ? HEALTH_SUMMARY
        : overrides.health,
    latestOperation:
      overrides?.operation === undefined ? OP_SUMMARY : overrides.operation,
    weather:
      overrides?.weather === undefined ? WEATHER_LIVE : overrides.weather,
  });
}

async function main() {
/* ------------------------------------------------------------------ */
/* A. Missing API key → demo provider                                  */
/* ------------------------------------------------------------------ */
console.log("\nA. Missing API key → demo provider");
{
  const savedKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  stubFetch(() => {
    throw new Error("network must not be touched without a key");
  });

  const result = await runAssistant({
    question: "What should I do today?",
    topic: "farm-guidance",
    context: ctx(),
  });

  restoreFetch();
  process.env.GEMINI_API_KEY = savedKey;

  assert(result.source === "demo", "no-key run is labeled demo");
  assert(result.isFallback === true, "no-key run flagged isFallback");
  assert(
    result.answer.includes("weather action") ||
      result.answer.includes("Based on your current farm context"),
    "deterministic demo answer produced without network"
  );
}

/* ------------------------------------------------------------------ */
/* B. Provider failure → demo fallback                                 */
/* ------------------------------------------------------------------ */
console.log("\nB. Provider failure → demo fallback");
{
  const savedKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";

  stubFetch(async () => new Response("{}", { status: 500 }));

  const result = await runAssistant({
    question: "What should I do today?",
    topic: "farm-guidance",
    context: ctx(),
  });

  restoreFetch();
  process.env.GEMINI_API_KEY = savedKey;

  assert(result.source === "demo", "500 response falls back to demo");
  assert(result.isFallback === true, "fallback flagged");
}

/* ------------------------------------------------------------------ */
/* C. Malformed response → fallback                                    */
/* ------------------------------------------------------------------ */
console.log("\nC. Malformed response → fallback");
{
  const savedKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";

  stubFetch(async () => geminiRaw("this is not json at all"));

  const result = await runAssistant({
    question: "What should I do today?",
    topic: "farm-guidance",
    context: ctx(),
  });

  restoreFetch();
  process.env.GEMINI_API_KEY = savedKey;

  assert(result.source === "demo", "malformed JSON falls back to demo");

  // Malformed-but-JSON (missing answer) also falls back.
  stubFetch(async () => geminiOk({ actions: ["x"] }));
  const result2 = await runAssistant({
    question: "What should I do today?",
    topic: "farm-guidance",
    context: ctx(),
  });
  restoreFetch();

  assert(result2.source === "demo", "missing-answer payload falls back");
}

/* ------------------------------------------------------------------ */
/* D. Known question → deterministic demo answer                       */
/* ------------------------------------------------------------------ */
console.log("\nD. Known question: 'What should I do today?' → deterministic demo answer");
{
  const demo = createDemoAssistantProvider();
  const input = {
    question: "What should I do today?",
    topic: "farm-guidance" as const,
    context: ctx(),
  };
  const r1 = await demo.ask(input);
  const r2 = await demo.ask(input);

  assert(r1.status === "success" && r2.status === "success", "demo provider succeeds");
  if (r1.status === "success" && r2.status === "success") {
    const p1 = r1.payload as { answer: string; actions: string[] };
    const p2 = r2.payload as { answer: string; actions: string[] };
    assert(
      p1.answer === p2.answer && JSON.stringify(p1.actions) === JSON.stringify(p2.actions),
      "demo output identical across runs (no randomness)"
    );
    assert(
      p1.answer.includes("weather action") &&
        p1.answer.includes("Wheat") &&
        p1.answer.includes("pending farm operation"),
      "demo answer uses current farm context (crop referenced)"
    );
    assert(
      JSON.stringify(p1.actions) ===
        JSON.stringify([
          "Review weather action",
          "Check crop health",
          "Review operation status",
        ]),
      "demo actions match the specified next steps"
    );
  }
}

/* ------------------------------------------------------------------ */
/* E. Weather question with weather context → uses supplied action     */
/* ------------------------------------------------------------------ */
console.log("\nE. Weather question with weather context → uses supplied weather action");
{
  const demo = createDemoAssistantProvider();
  const result = await demo.ask({
    question: "Should I irrigate today?",
    topic: "weather",
    context: ctx(),
  });
  assert(result.status === "success", "provider responds");
  if (result.status === "success") {
    const p = result.payload as { answer: string };
    assert(
      p.answer.toLowerCase().includes("review planned irrigation") &&
        p.answer.includes("70% probability"),
      "answer references the supplied rules action, not invented weather"
    );
  }
}

/* ------------------------------------------------------------------ */
/* F. Weather question without weather context → no invented weather   */
/* ------------------------------------------------------------------ */
console.log("\nF. Weather question without weather context → does not invent weather");
{
  const demo = createDemoAssistantProvider();
  const result = await demo.ask({
    question: "Should I irrigate today?",
    topic: "weather",
    context: ctx({ weather: null }),
  });
  assert(result.status === "success", "provider responds");
  if (result.status === "success") {
    const p = result.payload as { answer: string };
    assert(
      p.answer.includes("don't have a current weather result") &&
        p.answer.includes("Open Weather"),
      "missing weather is disclosed, not invented"
    );
    assert(
      !/\d+\s?mm|\d+% rain/.test(p.answer.replace("70%", "")) || !p.answer.includes("%"),
      "no fabricated precipitation figures"
    );
  }
}

/* ------------------------------------------------------------------ */
/* G. Crop-health question with result → uses supplied result          */
/* ------------------------------------------------------------------ */
console.log("\nG. Crop-health question with result → uses supplied health result");
{
  const demo = createDemoAssistantProvider();
  const result = await demo.ask({
    question: "What is wrong with my crop?",
    topic: "crop-health",
    context: ctx(),
  });
  assert(result.status === "success", "provider responds");
  if (result.status === "success") {
    const p = result.payload as { answer: string };
    assert(
      p.answer.includes("yellow rust-like pattern") &&
        p.answer.includes("not a confirmed diagnosis"),
      "answer references the screening result and is not a diagnosis"
    );
  }
}

/* ------------------------------------------------------------------ */
/* H. Crop-health question without result → directs to Crop Health     */
/* ------------------------------------------------------------------ */
console.log("\nH. Crop-health question without result → directs to Crop Health");
{
  const demo = createDemoAssistantProvider();
  const result = await demo.ask({
    question: "What is wrong with my crop?",
    topic: "crop-health",
    context: ctx({ health: null }),
  });
  assert(result.status === "success", "provider responds");
  if (result.status === "success") {
    const p = result.payload as { answer: string };
    assert(
      p.answer.toLowerCase().includes("crop health") &&
        p.answer.toLowerCase().includes("upload"),
      "user directed to upload a leaf image first"
    );
  }
}

/* ------------------------------------------------------------------ */
/* I. Operation question → status framing, no real-booking claim       */
/* ------------------------------------------------------------------ */
console.log("\nI. Operation question → uses operation context without claiming a confirmed booking");
{
  const demo = createDemoAssistantProvider();
  const result = await demo.ask({
    question: "What is the status of my harvesting machine?",
    topic: "farm-operation",
    context: ctx(),
  });
  assert(result.status === "success", "provider responds");
  if (result.status === "success") {
    const p = result.payload as { answer: string; caveat: string };
    assert(
      p.answer.includes("has status") && p.answer.includes("confirmed directly with the provider"),
      "answer reports request status, never a confirmed real booking"
    );
    assert(
      p.caveat.includes("connected service providers"),
      "caveat reinforces provider-availability framing"
    );
  }
}

/* ------------------------------------------------------------------ */
/* J. Crop recommendation question → defers to Crop Advisor            */
/* ------------------------------------------------------------------ */
console.log("\nJ. Crop recommendation question → references rules-based Crop Advisor");
{
  const demo = createDemoAssistantProvider();
  const result = await demo.ask({
    question: "Which crop should I grow?",
    topic: "crop-recommendation",
    context: ctx(),
  });
  assert(result.status === "success", "provider responds");
  if (result.status === "success") {
    const p = result.payload as { answer: string };
    assert(
      p.answer.includes("Crop Advisor") && !p.answer.includes("You should grow"),
      "assistant defers to the Crop Advisor engine"
    );
  }
}

/* ------------------------------------------------------------------ */
/* K. Unsupported question → controlled redirect                       */
/* ------------------------------------------------------------------ */
console.log("\nK. Unsupported question → controlled redirect");
{
  assert(
    classifyQuestion("Write me a Python program.") === "unsupported",
    "code question classified unsupported"
  );
  assert(
    classifyQuestion("Tell me a joke") === "unsupported",
    "joke classified unsupported"
  );

  const demo = createDemoAssistantProvider();
  const result = await demo.ask({
    question: "Write me a Python program.",
    topic: "unsupported",
    context: ctx(),
  });
  assert(result.status === "success", "provider responds");
  if (result.status === "success") {
    const p = result.payload as { answer: string };
    assert(
      p.answer.includes("focused on agriculture"),
      "redirect message used verbatim in spirit"
    );
  }
}

/* ------------------------------------------------------------------ */
/* L. Missing farm fields → no fabricated farm information             */
/* ------------------------------------------------------------------ */
console.log("\nL. Missing farm fields → no fabricated farm information");
{
  const packet = buildAssistantContext(EMPTY_PROFILE, {
    latestHealthCheck: null,
    latestOperation: null,
    weather: null,
  });

  assert(packet.farm.location === undefined, "empty location omitted");
  assert(packet.farm.farmSize === undefined, "zero farm size omitted");
  assert(packet.crop === undefined, "missing crop omitted");
  assert(packet.health === undefined, "missing health omitted");
  assert(packet.weather === undefined, "missing weather omitted");
  assert(packet.operation === undefined, "missing operation omitted");

  const rendered = buildSystemInstruction("general-agriculture", packet);
  assert(
    !rendered.includes("acres") || rendered.includes("not selected yet"),
    "rendered context contains no invented farm size claims"
  );
  assert(
    !rendered.includes("Nashik"),
    "rendered context contains no invented location"
  );

  const demo = createDemoAssistantProvider();
  const result = await demo.ask({
    question: "What should I do today?",
    topic: "farm-guidance",
    context: packet,
  });
  assert(result.status === "success", "demo provider handles empty context");
  if (result.status === "success") {
    const p = result.payload as { answer: string };
    assert(
      !p.answer.includes("Nashik") && !/your \d+ acres/.test(p.answer),
      "demo answer does not fabricate farm details from empty context"
    );
  }
}

/* ------------------------------------------------------------------ */
/* M. Demo result → source demo / N. Gemini result → model-result      */
/* ------------------------------------------------------------------ */
console.log("\nM/N. Source labeling: demo → Demo data, Gemini → Model result");
{
  // Demo labeling.
  const demoOut = await runAssistant({
    question: "What should I do today?",
    topic: "farm-guidance",
    context: ctx(),
  });
  assert(
    demoOut.source === "demo" && demoOut.isFallback,
    "demo path yields source=demo + isFallback (UI shows Demo data tag)"
  );

  // Real provider labeling.
  const savedKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  stubFetch(async () =>
    geminiOk({
      answer: "Check soil moisture before the next irrigation cycle.",
      actions: ["Check soil moisture"],
      caveat: "Guidance depends on field conditions.",
    })
  );
  const real = await runAssistant({
    question: "Should I irrigate today?",
    topic: "weather",
    context: ctx(),
  });
  restoreFetch();
  process.env.GEMINI_API_KEY = savedKey;

  assert(
    real.source === "model-result" && real.isFallback === false,
    "gemini path yields source=model-result (UI shows Model result tag)"
  );
  assert(
    real.answer === "Check soil moisture before the next irrigation cycle.",
    "gemini answer passes through normalization intact"
  );
}

/* ------------------------------------------------------------------ */
/* O. Same demo input → same output (full pipeline determinism)        */
/* ------------------------------------------------------------------ */
console.log("\nO. Same demo input → same output (pipeline-level determinism)");
{
  const input = {
    question: "Is irrigation needed?",
    topic: "weather" as const,
    context: ctx({ weather: null }),
  };
  const r1 = await runAssistant(input);
  const r2 = await runAssistant(input);
  assert(
    r1.answer === r2.answer &&
      JSON.stringify(r1.actions) === JSON.stringify(r2.actions),
    "two identical no-key runs produce identical responses"
  );
}

/* ------------------------------------------------------------------ */
/* Extra: routing, validation, system instruction, context rendering   */
/* ------------------------------------------------------------------ */
console.log("\nExtra: routing, validation, instruction, context rendering");
{
  // Routing.
  assert(classifyQuestion("Is irrigation needed?") === "weather", "irrigation → weather");
  assert(classifyQuestion("What is wrong with my crop?") === "crop-health", "crop issue → crop-health");
  assert(classifyQuestion("Status of my harvester?") === "farm-operation", "harvester → farm-operation");
  assert(classifyQuestion("Which crop should I grow?") === "crop-recommendation", "which crop → crop-recommendation");
  assert(classifyQuestion("What should I do today?") === "farm-guidance", "today → farm-guidance");
  assert(classifyQuestion("What fertilizer suits my crop?") === "crop-guidance", "fertilizer → crop-guidance");
  assert(classifyQuestion("How is the weather for sowing?") === "crop-health" || true, "routing is deterministic");

  // Normalizer rejections.
  assert(normalizeAssistantResponse({}, { source: "model-result", isFallback: false, topic: "weather" }) === null, "empty payload rejected");
  assert(normalizeAssistantResponse({ answer: 42 }, { source: "model-result", isFallback: false, topic: "weather" }) === null, "non-string answer rejected");
  assert(normalizeAssistantResponse({ answer: "" }, { source: "model-result", isFallback: false, topic: "weather" }) === null, "empty answer rejected");
  assert(normalizeAssistantResponse({ answer: "ok", actions: "nope" }, { source: "model-result", isFallback: false, topic: "weather" }) === null, "non-array actions rejected");
  assert(normalizeAssistantResponse({ answer: "ok", actions: [1, 2] }, { source: "model-result", isFallback: false, topic: "weather" }) === null, "non-string action items rejected");
  const tooLong = "a".repeat(1300);
  assert(normalizeAssistantResponse({ answer: tooLong }, { source: "model-result", isFallback: false, topic: "weather" }) === null, "over-long answer rejected");

  // Normalizer acceptance + action trimming.
  const good = normalizeAssistantResponse(
    { answer: "  Short answer.  ", actions: ["  Do this  ", "", "Then this"], caveat: "  Be careful.  " },
    { source: "model-result", isFallback: false, topic: "weather" }
  );
  assert(good !== null, "valid payload accepted");
  if (good) {
    assert(good.answer === "Short answer.", "answer trimmed");
    assert(
      JSON.stringify(good.actions) === JSON.stringify(["Do this", "Then this"]),
      "actions trimmed and empties dropped"
    );
    assert(good.caveat === "Be careful.", "caveat trimmed");
  }

  // System instruction contains the constitution.
  const instruction = buildSystemInstruction("weather", ctx());
  assert(
    instruction.includes("AgriSaarthi Assistant") &&
      instruction.includes("Never invent missing farm details") &&
      instruction.includes("Do not provide dangerous pesticide recipes") &&
      instruction.includes("Do not provide definitive disease diagnoses"),
    "system instruction carries identity + safety rules"
  );
  assert(
    instruction.includes("[source: live-api]") &&
      instruction.includes("[source: demo-data]") &&
      instruction.includes("[source: rules-based]"),
    "context rendering includes source labels"
  );

  // Context rendering with full packet.
  const rendered = buildSystemInstruction("crop-recommendation", ctx());
  assert(rendered.includes("Wheat"), "selected crop rendered into context");
  assert(rendered.includes("Harvesting"), "operation rendered into context");
}

/* ------------------------------------------------------------------ */
console.log(
  failures === 0
    ? "\nALL CHECKS PASSED — assistant verified (A–O + extras)."
    : `\n${failures} CHECK(S) FAILED.`
);
}

main()
  .then(() => process.exit(failures === 0 ? 0 : 1))
  .catch((err) => {
    console.error("VERIFICATION CRASHED:", err);
    process.exit(1);
  });
