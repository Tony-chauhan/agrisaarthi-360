/**
 * DETERMINISTIC VERIFICATION — crop health pipeline (Scenarios A–H).
 * Runs fully offline via fetch stubbing; no API key or network needed.
 * Usage: npx tsx scripts/verify-crop-health.ts
 */

import { runAnalysis } from "../lib/crop-health/provider";
import { normalizeAnalysis } from "../lib/crop-health/normalize-result";
import {
  DEMO_ANALYSIS,
  DEMO_PROVIDER_NAME,
  createDemoProvider,
} from "../lib/crop-health/demo-provider";
import type {
  AnalysisFarmContext,
  AnalysisProviderInput,
} from "../lib/crop-health/types";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

const ctx: AnalysisFarmContext = {
  selectedCrop: "Wheat",
  season: "rabi",
  location: "Nashik",
};

const input: AnalysisProviderInput = {
  imageBase64: "aGVsbG8=", // arbitrary bytes; providers never inspect it here
  imageMimeType: "image/jpeg",
  farmContext: ctx,
};

/* ------------------------------------------------------------------ */
/* Fetch stubbing helpers                                              */
/* ------------------------------------------------------------------ */

type FetchImpl = typeof fetch;
type FetchHandler = (url: unknown, init?: unknown) => Promise<Response>;
const originalFetch = globalThis.fetch;

function stubFetchOnce(handler: FetchHandler) {
  globalThis.fetch = handler as unknown as FetchImpl;
}
function restoreFetch() {
  globalThis.fetch = originalFetch;
}

function geminiOk(payload: unknown): Response {
  return new Response(
    JSON.stringify({
      candidates: [
        { content: { parts: [{ text: JSON.stringify(payload) }] } },
      ],
    }),
    { status: 200 }
  );
}

function withKey<T>(fn: () => Promise<T>): Promise<T> {
  process.env.GEMINI_API_KEY = "test-key";
  return fn().finally(() => {
    delete process.env.GEMINI_API_KEY;
  });
}

/* ------------------------------------------------------------------ */
/* A. Real provider request path (valid image + key configured)        */
/* ------------------------------------------------------------------ */
async function scenarioA() {
  console.log("Scenario A: key configured → real provider request path");
  await withKey(async () => {
    let calledUrl = "";
    let usedMethod = "";
    stubFetchOnce(async (_url, init) => {
      calledUrl = String(_url);
      usedMethod =
        (init as { method?: string } | undefined)?.method ?? "";
      return geminiOk({
        plant: "Wheat leaf",
        possibleCondition: "Rust-like spotting",
        likelihood: "possible",
        confidence: 0.82,
        observations: ["Small orange-brown pustules"],
        recommendedActions: ["Inspect nearby plants"],
        caveat: "Screening aid only",
        imageQuality: "acceptable",
      });
    });
    const result = await runAnalysis(input);
    restoreFetch();
    assert(calledUrl.includes("generativelanguage.googleapis.com"), "A1 calls Gemini endpoint");
    assert(usedMethod === "POST", "A2 uses POST");
    assert(result.sourceType === "provider", "A3 labeled as provider result");
    assert(result.source === "model-result", "A4 DataSource is model-result");
    assert(result.isFallback === false, "A5 not flagged as fallback");
    assert(result.confidence === 0.82, "A6 confidence passes through (0.82)");
  });
}

/* ------------------------------------------------------------------ */
/* B. Missing API key → demo fallback                                  */
/* ------------------------------------------------------------------ */
async function scenarioB() {
  console.log("Scenario B: missing API key → demo fallback");
  delete process.env.GEMINI_API_KEY;
  const result = await runAnalysis(input);
  assert(result.isFallback === true, "B1 result flagged as fallback");
  assert(result.source === "demo", "B2 DataSource is demo");
  assert(result.sourceType === "demo-fallback", "B3 sourceType demo-fallback");
  assert(result.confidence === undefined, "B4 no fabricated AI confidence");
}

/* ------------------------------------------------------------------ */
/* C. Provider failure (HTTP 500 / network / timeout) → demo fallback  */
/* ------------------------------------------------------------------ */
async function scenarioC() {
  console.log("Scenario C: provider failure → demo fallback");
  await withKey(async () => {
    stubFetchOnce(async () => new Response("boom", { status: 500 }));
    const r1 = await runAnalysis(input);
    restoreFetch();
    assert(r1.isFallback === true, "C1 HTTP 500 falls back to demo");

    stubFetchOnce(async () => {
      throw new Error("network down");
    });
    const r2 = await runAnalysis(input);
    restoreFetch();
    assert(r2.isFallback === true, "C2 network error falls back to demo");

    stubFetchOnce(async () => {
      throw Object.assign(new Error("aborted"), { name: "AbortError" });
    });
    const r3 = await runAnalysis(input);
    restoreFetch();
    assert(r3.isFallback === true, "C3 timeout/abort falls back to demo");
  });
}

/* ------------------------------------------------------------------ */
/* D. Invalid image rejected before any provider call                  */
/* ------------------------------------------------------------------ */
async function scenarioD() {
  console.log("Scenario D: invalid image rejected client-side");
  // Magic-byte gate lives in client-image.ts (browser File API).
  // Verified via a synthetic File in Node 20+ (File is global).
  const { detectMimeType } = await import("../lib/crop-health/client-image");

  const fakeExe = new File([new Uint8Array([0x4d, 0x5a, 0x00, 0x01])], "crop.exe");
  assert((await detectMimeType(fakeExe)) === null, "D1 EXE magic bytes rejected");

  const fakeJpeg = new File(
    [new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])],
    "photo.jpg"
  );
  assert(
    (await detectMimeType(fakeJpeg)) === "image/jpeg",
    "D2 JPEG magic bytes accepted despite name games"
  );

  const fakePng = new File(
    [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a])],
    "photo.dat"
  );
  assert(
    (await detectMimeType(fakePng)) === "image/png",
    "D3 PNG detected regardless of extension"
  );
}

/* ------------------------------------------------------------------ */
/* E. Malformed provider response → validation fails safely            */
/* ------------------------------------------------------------------ */
async function scenarioE() {
  console.log("Scenario E: malformed responses → safe fallback");
  await withKey(async () => {
    // E1: malformed JSON text inside the candidate
    stubFetchOnce(async () =>
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "{not json" }] } }],
        }),
        { status: 200 }
      )
    );
    const r1 = await runAnalysis(input);
    restoreFetch();
    assert(r1.isFallback === true, "E1 malformed JSON → demo fallback");

    // E2: valid JSON but missing required possibleCondition
    stubFetchOnce(async () => geminiOk({ plant: "Leaf" }));
    const r2 = await runAnalysis(input);
    restoreFetch();
    assert(r2.isFallback === true, "E2 missing possibleCondition → demo fallback");

    // E3: empty candidate text
    stubFetchOnce(async () =>
      new Response(JSON.stringify({ candidates: [] }), { status: 200 })
    );
    const r3 = await runAnalysis(input);
    restoreFetch();
    assert(r3.isFallback === true, "E3 empty candidate → demo fallback");
  });
}

/* ------------------------------------------------------------------ */
/* F. Demo result labeling                                             */
/* ------------------------------------------------------------------ */
async function scenarioF() {
  console.log("Scenario F: demo result correctly labeled");
  delete process.env.GEMINI_API_KEY;
  const result = await runAnalysis(input);
  assert(result.source === "demo", "F1 labeled Demo data");
  assert(
    result.possibleCondition === DEMO_ANALYSIS.possibleCondition,
    "F2 deterministic demo condition (no randomness)"
  );
  assert(result.observations.length > 0, "F3 demo observations present");

  const demo = createDemoProvider();
  assert(demo.name === DEMO_PROVIDER_NAME, "F4 demo provider identity");
  const p1 = await demo.analyze(input);
  const p2 = await demo.analyze(input);
  assert(
    JSON.stringify(p1) === JSON.stringify(p2),
    "F5 demo provider is deterministic"
  );
}

/* ------------------------------------------------------------------ */
/* G. Real result labeling                                             */
/* ------------------------------------------------------------------ */
async function scenarioG() {
  console.log("Scenario G: real result correctly labeled");
  await withKey(async () => {
    stubFetchOnce(async () =>
      geminiOk({
        plant: "Tomato leaf",
        possibleCondition: "Early blight-like visual pattern",
        likelihood: "possible",
        confidence: 0.7,
        observations: ["Leaf spotting"],
        recommendedActions: ["Monitor spread"],
        caveat: "Screening aid",
      })
    );
    const result = await runAnalysis(input);
    restoreFetch();
    assert(result.source === "model-result", "G1 labeled Model result");
    assert(result.cropName === "Tomato leaf", "G2 crop identification kept");
  });
}

/* ------------------------------------------------------------------ */
/* H. No selected crop → system does not invent crop context           */
/* ------------------------------------------------------------------ */
async function scenarioH() {
  console.log("Scenario H: no selected crop → no invented context");
  delete process.env.GEMINI_API_KEY;
  const noCropInput: AnalysisProviderInput = {
    ...input,
    farmContext: { location: "Nashik" },
  };
  const result = await runAnalysis(noCropInput);
  assert(
    !result.cropName || result.cropName.includes("fallback"),
    "H1 fallback never asserts a specific farm crop when none selected"
  );
  assert(result.isFallback === true, "H2 fallback path used without crop");

  // Also verify normalizer behavior directly for H.
  const normalized = normalizeAnalysis(
    { possibleCondition: "X" },
    { sourceType: "demo-fallback" }
  );
  assert(normalized !== null, "H3 minimal payload still normalizes safely");
}

/* ------------------------------------------------------------------ */
async function main() {
  try {
    await scenarioA();
    await scenarioB();
    await scenarioC();
    await scenarioD();
    await scenarioE();
    await scenarioF();
    await scenarioG();
    await scenarioH();
  } finally {
    restoreFetch();
    delete process.env.GEMINI_API_KEY;
  }
  console.log(
    failures === 0
      ? "\nALL CHECKS PASSED"
      : `\n${failures} CHECK(S) FAILED`
  );
  process.exit(failures === 0 ? 0 : 1);
}

void main();
