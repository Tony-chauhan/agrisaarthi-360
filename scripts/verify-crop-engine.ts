import { recommendCrops } from "../lib/crop-recommendation";
import type { CropAdvisorInputs } from "../lib/types";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

const base: CropAdvisorInputs = {
  location: "Nashik, Maharashtra",
  season: "rabi",
  farmSizeAcres: 5,
  irrigation: "drip",
  soilType: "black",
};

/* ------------------------------------------------------------------ */
/* Scenario A — irrigated farm + suitable season + compatible soil:    */
/* a relevant crop appears among recommendations.                      */
/* ------------------------------------------------------------------ */
console.log("Scenario A: rabi + black soil + drip (Nashik)");
const A = recommendCrops(base);
assert(A.incompleteProfile === false, "A1 profile treated as complete");
assert(A.recommendations.length >= 2 && A.recommendations.length <= 3,
  `A2 returns 2-3 recommendations (got ${A.recommendations.length})`);
assert(
  A.recommendations.some((r) => r.crop.startsWith("Chickpea")),
  "A3 chickpea (black-soil rabi crop) appears"
);
assert(A.recommendations[0].score >= A.recommendations[1].score,
  "A4 results sorted by score descending");
assert(A.recommendations.every((r) => r.whyItMatches.length > 0),
  "A5 every recommendation has explainable reasons");

/* ------------------------------------------------------------------ */
/* Scenario B — different season/soil changes the ranking.             */
/* ------------------------------------------------------------------ */
console.log("Scenario B: kharif + clay + canal vs base");
const B = recommendCrops({ ...base, season: "kharif", soilType: "clay", irrigation: "canal" });
const bCrops = B.recommendations.map((r) => r.crop);
const aCrops = A.recommendations.map((r) => r.crop);
assert(bCrops.join("|") !== aCrops.join("|"), "B1 ranking changed vs Scenario A");
assert(bCrops.some((c) => c.includes("Rice")), "B2 rice appears for kharif+clay+canal");
assert(!bCrops.includes("Wheat"), "B3 wheat (rabi-only) absent in kharif");
assert(B.recommendations.every((r) => r.seasonFit.length > 0 && r.soilFit.length > 0 && r.irrigationFit.length > 0),
  "B4 fit strings present on every result");

/* ------------------------------------------------------------------ */
/* Scenario C — incomplete profile: no misleading confident results.   */
/* ------------------------------------------------------------------ */
console.log("Scenario C: incomplete profile");
const C1 = recommendCrops({ ...base, farmSizeAcres: 0 });
assert(C1.incompleteProfile === true, "C1 zero farm size flagged incomplete");
assert(C1.recommendations.length === 0, "C2 no recommendations when incomplete");
assert(C1.missingInputs.some((m) => m.toLowerCase().includes("farm size")),
  "C3 missing-input message names the problem");
const C2 = recommendCrops({ ...base, location: "  " });
assert(C2.incompleteProfile === true, "C4 blank location flagged incomplete");

/* ------------------------------------------------------------------ */
/* Scenario D-adjacent — engine determinism.                           */
/* (Select-crop → context update is React state, verified in smoke test.) */
/* ------------------------------------------------------------------ */
console.log("Scenario D: determinism");
const D1 = recommendCrops(base);
assert(
  JSON.stringify(D1) === JSON.stringify(A),
  "D1 identical inputs produce identical outputs (pure/deterministic)"
);

/* Edge: tiny farm still returns usable results (no forced crops). */
console.log("Edge: tiny farm");
const E = recommendCrops({ ...base, farmSizeAcres: 0.3 });
assert(
  E.recommendations.every((r) => r.crop !== "Cotton"),
  "E1 cotton (min 1 acre) excluded for 0.3-acre farm"
);

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
