/**
 * DETERMINISTIC VERIFICATION — golden demo end-to-end flow (Step 7).
 *
 * Simulates the judge-facing journey with the REAL app logic (no network):
 *   Load Demo Farm → Crop Advisor → select crop → machinery match →
 *   Assistant "What should I do today?" → reset contract → source-label audit.
 *
 * Usage: npx tsx scripts/verify-golden-demo.ts
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  GOLDEN_DEMO_PROFILE,
  DEMO_PROFILE,
  DEMO_DATA_DISCLAIMER,
} from "../lib/demo-data";
import { recommendCrops } from "../lib/crop-recommendation";
import {
  matchMachinery,
  demoResponseFor,
} from "../lib/operations/machine-matching";
import { classifyQuestion } from "../lib/assistant/topic-routing";
import { buildAssistantContext } from "../lib/assistant/assistant-context";
import { runAssistant } from "../lib/assistant/provider";
import type {
  CropAdvisorInputs,
  FarmProfile,
  HealthCheckSummary,
} from "../lib/types";
import type { LatestOperationSummary } from "../lib/operations/types";

/* Golden demo must run without a Gemini key — force the demo provider. */
delete process.env.GEMINI_API_KEY;

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

/** Recursively collect .ts/.tsx sources (skips dot-dirs and node_modules). */
function collectTsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      collectTsFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const projectRoot = join(__dirname, "..");

  /* ---------------------------------------------------------------- */
  /* A. Golden demo profile contract                                   */
  /* ---------------------------------------------------------------- */
  console.log("\nA. Golden demo profile contract");
  {
    assert(
      GOLDEN_DEMO_PROFILE.farmerName === "Ramesh Patil",
      "farmer name is the deterministic demo farmer"
    );
    assert(
      GOLDEN_DEMO_PROFILE.location === "Nashik, Maharashtra",
      "location is an Indian demo location"
    );
    assert(
      GOLDEN_DEMO_PROFILE.farmSizeAcres === 5,
      "farm size is 5 acres (fits demo machinery ranges)"
    );
    assert(GOLDEN_DEMO_PROFILE.irrigation === "drip", "irrigation = drip");
    assert(
      GOLDEN_DEMO_PROFILE.soilType === "loamy",
      "soil = loamy (Wheat's preferred demo soil for the golden run)"
    );
    assert(GOLDEN_DEMO_PROFILE.season === "rabi", "season = rabi");
    assert(
      GOLDEN_DEMO_PROFILE.selectedCrop === undefined,
      "selectedCrop undefined — crop is chosen live in Crop Advisor"
    );
    assert(
      DEMO_PROFILE === GOLDEN_DEMO_PROFILE,
      "DEMO_PROFILE alias points at the golden profile (single source of truth)"
    );
    assert(
      DEMO_DATA_DISCLAIMER.includes("Sample farm data"),
      "sample-farm note labels the data as sample data"
    );
  }

  /* ---------------------------------------------------------------- */
  /* B. Crop Advisor golden path — deterministic Wheat-first result    */
  /* ---------------------------------------------------------------- */
  console.log("\nB. Crop Advisor golden path (profile → recommendations)");
  const advisorInputs: CropAdvisorInputs = {
    location: GOLDEN_DEMO_PROFILE.location,
    season: GOLDEN_DEMO_PROFILE.season,
    farmSizeAcres: GOLDEN_DEMO_PROFILE.farmSizeAcres,
    irrigation: GOLDEN_DEMO_PROFILE.irrigation,
    soilType: GOLDEN_DEMO_PROFILE.soilType,
  };
  let topCrop = "";
  {
    const result = recommendCrops(advisorInputs);
    assert(
      result.incompleteProfile === false && result.missingInputs.length === 0,
      "golden profile is complete for the engine"
    );
    assert(result.recommendations.length > 0, "recommendations returned");
    const top = result.recommendations[0];
    assert(
      top.crop === "Wheat",
      "Wheat ranks first for the golden profile (deterministic engine result)"
    );
    assert(top.suitability === "high", "top crop presented as high suitability");
    assert(top.score === 100, "Wheat scores 100/100 on the golden profile");
    assert(
      top.scoreBasis.soil.points === top.scoreBasis.soil.max,
      "Wheat full-matches the soil rule (loamy is a preferred soil)"
    );
    assert(
      result.recommendations.some((r) => r.crop === "Wheat"),
      "Wheat still appears within the returned recommendations"
    );
    assert(
      result.recommendations.every((r) => r.source === "rules-based"),
      "every recommendation carries source = rules-based"
    );
    const again = recommendCrops(advisorInputs);
    assert(
      JSON.stringify(result.recommendations.map((r) => [r.crop, r.score])) ===
        JSON.stringify(again.recommendations.map((r) => [r.crop, r.score])),
      "identical inputs → identical deterministic output"
    );
    topCrop = top.crop;
  }

  /* ---------------------------------------------------------------- */
  /* C. Machinery golden path — available first, crop context, demo    */
  /* ---------------------------------------------------------------- */
  console.log("\nC. Machinery golden path (selected crop → operations)");
  const profileWithCrop: FarmProfile = {
    ...GOLDEN_DEMO_PROFILE,
    selectedCrop: topCrop,
  };
  {
    const matches = matchMachinery("harvesting", profileWithCrop);
    assert(matches.length > 0, "harvesting returns machinery matches");
    assert(
      matches[0].provider.availabilityStatus === "available",
      "first match is the available machine (demo ordering rule)"
    );
    assert(
      demoResponseFor(matches[0].provider.availabilityStatus) === "accepted",
      "top available machine yields accepted demo response"
    );
    assert(
      matches.every((m) => m.provider.source === "demo"),
      "every machinery match is labelled demo"
    );
    assert(
      matches.some((m) => m.matchBasis.some((b) => b.includes(topCrop))),
      "selected crop propagates into machinery match basis"
    );
    const ids = matches.map((m) => m.provider.id);
    assert(
      JSON.stringify(ids) ===
        JSON.stringify(matchMachinery("harvesting", profileWithCrop).map((m) => m.provider.id)),
      "machinery ordering is deterministic"
    );
  }

  /* ---------------------------------------------------------------- */
  /* D. Assistant golden path — "What should I do today?"              */
  /* ---------------------------------------------------------------- */
  console.log("\nD. Assistant golden path (context packet + demo answer)");
  const weatherContext = {
    summary: "27.4°C, partly cloudy, low rain chance (demo weather)",
    actionTitle: "Irrigate in the morning",
    actionMessage:
      "Demo rule: light morning irrigation suits current demo conditions.",
    isLive: false,
  };
  {
    const question = "What should I do today?";
    const topic = classifyQuestion(question);
    assert(typeof topic === "string", "question classifies to a valid topic");

    const ctx1 = buildAssistantContext(profileWithCrop, {
      latestHealthCheck: null,
      latestOperation: null,
      weather: weatherContext,
    });
    assert(
      ctx1.crop?.selectedCrop.value === topCrop,
      "context packet carries the selected crop"
    );
    assert(
      ctx1.weather?.actionSourceLabel === "rules-based",
      "weather action is labelled rules-based in the packet"
    );

    const resp1 = await runAssistant({ question, topic, context: ctx1 });
    assert(
      resp1.source === "demo" && resp1.isFallback === true,
      "no Gemini key → deterministic demo response (labelled demo)"
    );
    assert(
      resp1.answer.includes(topCrop),
      "demo answer references the selected crop by name"
    );
    assert(
      /weather action/i.test(resp1.answer),
      "demo answer references the weather action"
    );
    assert(
      resp1.actions.length > 0 && resp1.actions.length <= 4,
      "1–4 structured next actions"
    );
    assert(
      Boolean(resp1.caveat && resp1.caveat.length > 0),
      "caveat present on demo response"
    );
    assert(resp1.answer.length <= 1200, "answer within the 1200-char contract");

    const resp2 = await runAssistant({ question, topic, context: ctx1 });
    assert(
      resp2.answer === resp1.answer,
      "same question + context → identical demo answer (no randomness)"
    );

    /* No crop selected yet → no invented crop in the answer. */
    const ctx0 = buildAssistantContext(GOLDEN_DEMO_PROFILE, {
      latestHealthCheck: null,
      latestOperation: null,
      weather: weatherContext,
    });
    const resp0 = await runAssistant({ question, topic, context: ctx0 });
    assert(
      !/wheat/i.test(resp0.answer),
      "no crop selected → answer does not name a specific crop"
    );
  }

  /* ---------------------------------------------------------------- */
  /* E. Assistant context packet — health/operation propagation        */
  /* ---------------------------------------------------------------- */
  console.log("\nE. Context packet carries health + operation summaries");
  {
    const health: HealthCheckSummary = {
      crop: topCrop,
      possibleCondition: "possible fungal stress pattern",
      likelihood: "possible",
      isFallback: true,
      source: "demo",
      analyzedAt: new Date(0).toISOString(),
    };
    const opSummary: LatestOperationSummary = {
      operationId: "harvesting",
      operationName: "Harvesting",
      machineName: "Demo Combine Harvester",
      providerName: "AgriServe Demo",
      status: "provider_response",
      response: "accepted",
      source: "demo",
      createdAt: new Date(0).toISOString(),
    };
    const ctx = buildAssistantContext(profileWithCrop, {
      latestHealthCheck: health,
      latestOperation: opSummary,
      weather: weatherContext,
    });
    assert(
      ctx.health?.sourceLabel === "demo-data",
      "health summary labelled demo-data"
    );
    assert(
      ctx.health?.isFallback === true,
      "health fallback flag propagates"
    );
    assert(
      ctx.operation !== undefined &&
        ctx.operation.statusText.includes("dataset outcome"),
      "operation status text is explicit about the dataset outcome"
    );
    assert(
      ctx.operation?.sourceLabel === "demo-data",
      "operation summary labelled demo-data"
    );
    const serialized = JSON.stringify(ctx);
    assert(
      !serialized.includes("base64") && !serialized.includes("landPhotoUrl"),
      "packet contains no image data or raw payloads"
    );
  }

  /* ---------------------------------------------------------------- */
  /* F. Reset contract                                                 */
  /* ---------------------------------------------------------------- */
  console.log("\nF. Demo reset contract");
  {
    const resetProfile: FarmProfile = {
      ...GOLDEN_DEMO_PROFILE,
      selectedCrop: undefined,
    };
    assert(
      resetProfile.farmerName === GOLDEN_DEMO_PROFILE.farmerName &&
        resetProfile.selectedCrop === undefined,
      "reset restores the demo profile and clears the crop"
    );
    assert(
      GOLDEN_DEMO_PROFILE.selectedCrop === undefined &&
        GOLDEN_DEMO_PROFILE.farmSizeAcres === 5,
      "golden profile itself is never mutated (spread semantics)"
    );
  }

  /* ---------------------------------------------------------------- */
  /* G. Source transparency + stale-data audit (filesystem)            */
  /* ---------------------------------------------------------------- */
  console.log("\nG. Source transparency + stale-data audit");
  {
    const selfPath = join(__dirname, "verify-golden-demo.ts");
    const files = collectTsFiles(projectRoot).filter((f) => f !== selfPath);
    assert(files.length > 0, "source files collected for audit");

    const removedConstants = [
      "DEMO_TODAY_ACTIONS",
      "DEMO_CROP_RECOMMENDATIONS",
      "DEMO_MACHINES",
      "DEMO_CHAT_HISTORY",
      "DEMO_SUGGESTED_QUESTIONS",
      "DEMO_ASSISTANT_REPLY",
      "DEMO_OPERATION_LABELS",
    ];
    for (const token of removedConstants) {
      assert(
        !files.some((f) => readFileSync(f, "utf8").includes(token)),
        `no references to removed constant ${token}`
      );
    }

    assert(
      !files.some((f) => /lorem ipsum/i.test(readFileSync(f, "utf8"))),
      "no lorem ipsum placeholder text"
    );

    const badgeSrc = readFileSync(
      join(projectRoot, "components", "ui", "badge.tsx"),
      "utf8"
    );
    for (const label of [
      "LIVE API",
      "AI MODEL",
      "DECISION ENGINE",
      "SERVICE DATA",
      "FALLBACK",
    ]) {
      assert(
        badgeSrc.includes(label),
        `DataSourceTag covers "${label}"`
      );
    }

    const opsSrc = readFileSync(
      join(projectRoot, "app", "(app)", "operations", "page.tsx"),
      "utf8"
    );
    assert(
      opsSrc.includes("Availability depends on connected service providers."),
      "operations page carries a neutral provider-availability note"
    );
    assert(
      !opsSrc.includes("prototype") && !opsSrc.includes("Prototype"),
      "operations page has no prototype wording"
    );

    const heroSrc = readFileSync(
      join(projectRoot, "components", "dashboard", "farm-summary-header.tsx"),
      "utf8"
    );
    assert(
      heroSrc.includes("greetingFor(new Date())") &&
        heroSrc.includes("profile.farmerName.split"),
      "dashboard hero greets the farmer by name"
    );
    assert(
      !heroSrc.includes("Demo farm") && !heroSrc.includes("Prototype"),
      "dashboard hero has no demo/prototype labels"
    );

    const profileSrc = readFileSync(
      join(projectRoot, "app", "(app)", "farm-profile", "page.tsx"),
      "utf8"
    );
    assert(
      profileSrc.includes("Use Sample Farm"),
      "Farm Profile exposes a Use Sample Farm convenience action"
    );
    assert(
      profileSrc.includes("Clear session"),
      "Farm Profile exposes a Clear session action"
    );
    assert(
      !profileSrc.includes("prototype"),
      "Farm Profile has no prototype wording"
    );

    const shellSrc = readFileSync(
      join(projectRoot, "components", "layout", "app-shell.tsx"),
      "utf8"
    );
    assert(
      !shellSrc.includes("Prototype") && !shellSrc.includes("prototype"),
      "app shell has no prototype wording"
    );

    const assistantSrc = readFileSync(
      join(projectRoot, "app", "(app)", "assistant", "page.tsx"),
      "utf8"
    );
    assert(
      assistantSrc.includes("What should I do today?"),
      "Assistant offers 'What should I do today?' as a suggested question"
    );
  }

  /* ---------------------------------------------------------------- */
  console.log(
    failures === 0
      ? "\nALL CHECKS PASSED — golden demo flow verified end-to-end."
      : `\n${failures} CHECK(S) FAILED.`
  );
  process.exit(failures === 0 ? 0 : 1);
}

void main();
