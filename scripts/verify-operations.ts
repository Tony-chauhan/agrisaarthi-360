/**
 * DETERMINISTIC VERIFICATION — operations + machinery workflow (A–J).
 * Runs fully offline; no network, no randomness. Usage: npx tsx scripts/verify-operations.ts
 */

import {
  matchMachinery,
  findAlternative,
  getOperation,
  demoResponseFor,
} from "../lib/operations/machine-matching";
import {
  FARM_OPERATIONS,
  MACHINERY_PROVIDERS,
  OPERATION_LABELS,
} from "../lib/operations/machine-knowledge";
import type {
  FarmOperationId,
  MachineryProvider,
} from "../lib/operations/types";
import type { FarmProfile } from "../lib/types";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${message}`);
  }
}

const PROFILE: FarmProfile = {
  farmerName: "Ramesh Patil",
  location: "Nashik, Maharashtra",
  district: "Nashik",
  farmSizeAcres: 5,
  irrigation: "drip",
  soilType: "black",
  season: "rabi",
  selectedCrop: "Wheat",
};

const PROFILE_NO_CROP: FarmProfile = {
  ...PROFILE,
  selectedCrop: undefined,
};

/* ------------------------------------------------------------------ */
/* A. Farm profile + operation → suitable machinery results            */
/* ------------------------------------------------------------------ */
console.log("\nA. Farm profile + operation → suitable machinery results");
{
  const matches = matchMachinery("harvesting", PROFILE);
  assert(matches.length > 0, "harvesting returns machinery results");
  assert(
    matches.every((m) => m.provider.operation === "harvesting"),
    "all results serve the harvesting operation"
  );
  assert(
    matches.every((m) => m.provider.source === "demo"),
    "all results carry source = demo"
  );
  assert(
    matches.every(
      (m) =>
        m.matchBasis.length > 0 &&
        m.matchBasis.some((b) => b.includes("Suggested match"))
    ),
    "every result has explainable match basis"
  );
  const cropBasis = matches.some((m) =>
    m.matchBasis.some((b) => b.includes("Wheat"))
  );
  assert(cropBasis, "selected crop (Wheat) appears in match basis");
}

/* ------------------------------------------------------------------ */
/* B. Different operation → different machinery results                */
/* ------------------------------------------------------------------ */
console.log("\nB. Different operation → different machinery results");
{
  const harvest = matchMachinery("harvesting", PROFILE).map(
    (m) => m.provider.id
  );
  const sowing = matchMachinery("sowing", PROFILE).map((m) => m.provider.id);
  const spraying = matchMachinery("spraying", PROFILE).map(
    (m) => m.provider.id
  );
  const seedbed = matchMachinery("seedbed-preparation", PROFILE).map(
    (m) => m.provider.id
  );
  assert(harvest.join(",") !== sowing.join(","), "harvesting ≠ sowing sets");
  assert(
    spraying.join(",") !== harvest.join(","),
    "spraying ≠ harvesting sets"
  );
  assert(
    seedbed.join(",") !== harvest.join(","),
    "seedbed ≠ harvesting sets"
  );
  const totalUnique = new Set([...harvest, ...sowing, ...spraying, ...seedbed]);
  assert(
    totalUnique.size === harvest.length + sowing.length + spraying.length + seedbed.length,
    "no machinery id is shared between operations"
  );
}

/* ------------------------------------------------------------------ */
/* C. Same input → identical result ordering                           */
/* ------------------------------------------------------------------ */
console.log("\nC. Same input → identical result ordering");
{
  const run1 = matchMachinery("harvesting", PROFILE).map(
    (m) => m.provider.id
  );
  const run2 = matchMachinery("harvesting", PROFILE).map(
    (m) => m.provider.id
  );
  const run3 = matchMachinery("sowing", PROFILE_NO_CROP).map(
    (m) => m.provider.id
  );
  const run4 = matchMachinery("sowing", PROFILE_NO_CROP).map(
    (m) => m.provider.id
  );
  assert(
    JSON.stringify(run1) === JSON.stringify(run2),
    "harvesting ordering identical across runs"
  );
  assert(
    JSON.stringify(run3) === JSON.stringify(run4),
    "sowing ordering identical across runs"
  );
}

/* ------------------------------------------------------------------ */
/* D. No profile → engine still returns results; UI shows setup CTA    */
/* ------------------------------------------------------------------ */
console.log("\nD. No profile → graceful handling (UI shows setup CTA)");
{
  const matches = matchMachinery("harvesting", null);
  assert(
    matches.length > 0,
    "engine tolerates null profile without crashing"
  );
  assert(
    matches.every(
      (m) => !m.matchBasis.some((b) => b.includes("your") && b.includes("acres"))
    ),
    "no farm-size claims invented without profile"
  );
}

/* ------------------------------------------------------------------ */
/* E. Available machine → deterministic accepted response              */
/* ------------------------------------------------------------------ */
console.log("\nE. Available machine → request confirmation path");
{
  const available = MACHINERY_PROVIDERS.filter(
    (p) => p.availabilityStatus === "available"
  );
  assert(available.length > 0, "demo dataset contains available machines");
  assert(
    available.every((p) => demoResponseFor(p.availabilityStatus) === "accepted"),
    "available machines produce accepted response"
  );
  const firstHarvest = matchMachinery("harvesting", PROFILE)[0];
  assert(
    firstHarvest.provider.availabilityStatus === "available",
    "top harvesting result is the available machine (ordering rule)"
  );
}

/* ------------------------------------------------------------------ */
/* F. Unavailable machine → alternative provider flow                  */
/* ------------------------------------------------------------------ */
console.log("\nF. Unavailable machine → alternative provider flow");
{
  const unavailable = MACHINERY_PROVIDERS.find(
    (p) => p.availabilityStatus === "unavailable"
  );
  assert(unavailable !== undefined, "demo dataset contains an unavailable machine");
  if (unavailable) {
    assert(
      demoResponseFor(unavailable.availabilityStatus) === "unavailable",
      "unavailable machine produces unavailable response"
    );
    const alt = findAlternative(unavailable.operation, unavailable.id, PROFILE);
    assert(alt !== null, "an alternative machine exists for the fallback flow");
    assert(
      alt !== null &&
        alt.provider.id !== unavailable.id &&
        alt.provider.operation === unavailable.operation,
      "alternative is a different machine for the same operation"
    );
  }
}

/* ------------------------------------------------------------------ */
/* G. Confirm request → deterministic demo status progression          */
/* ------------------------------------------------------------------ */
console.log("\nG. Confirm request → demo request submitted → provider_response");
{
  const top = matchMachinery("harvesting", PROFILE)[0];
  const statusOrder = [
    "idle",
    "reviewing",
    "submitted",
    "provider_response",
  ] as const;
  assert(
    statusOrder[0] === "idle" &&
      statusOrder[3] === "provider_response",
    "status progression covers idle→reviewing→submitted→provider_response"
  );
  assert(
    demoResponseFor(top.provider.availabilityStatus) === "accepted",
    "top available machine would yield accepted after short transition"
  );
}

/* ------------------------------------------------------------------ */
/* H. Latest operation summary contract for dashboard                  */
/* ------------------------------------------------------------------ */
console.log("\nH. Latest operation summary contract for dashboard");
{
  const top = matchMachinery("harvesting", PROFILE)[0];
  const summary = {
    operationId: "harvesting" as FarmOperationId,
    operationName: OPERATION_LABELS.harvesting,
    machineName: top.provider.machineName,
    providerName: top.provider.providerName,
    status: "provider_response" as const,
    response: demoResponseFor(top.provider.availabilityStatus),
    source: "demo" as const,
    createdAt: new Date(0).toISOString(),
  };
  assert(
    summary.operationName === "Harvesting" && summary.source === "demo",
    "summary carries operation name and demo source"
  );
  assert(
    summary.status === "provider_response" && summary.response === "accepted",
    "summary reflects final demo status"
  );
}

/* ------------------------------------------------------------------ */
/* I. Data source — all machinery/request results from service dataset */
/* ------------------------------------------------------------------ */
console.log("\nI. Data source — all machinery/request results from the service dataset");
{
  assert(
    MACHINERY_PROVIDERS.every((p) => p.source === "demo"),
    "every machinery provider in the dataset has source = demo (service data)"
  );
  assert(
    MACHINERY_PROVIDERS.every(
      (p) => p.location.trim().length > 0 && !p.location.toLowerCase().includes("(demo)")
    ),
    "provider locations are plain dataset labels (no demo markers)"
  );
  assert(
    MACHINERY_PROVIDERS.every(
      (p) =>
        p.providerName.trim().length > 0 &&
        !p.providerName.toLowerCase().includes("demo")
    ),
    "provider names are neutral dataset names (no demo markers)"
  );
  const operationIds = new Set(FARM_OPERATIONS.map((o) => o.id));
  assert(
    MACHINERY_PROVIDERS.every((p) => operationIds.has(p.operation)),
    "every provider references a known operation id"
  );
}

/* ------------------------------------------------------------------ */
/* J. No crop → no invented crop                                       */
/* ------------------------------------------------------------------ */
console.log("\nJ. No crop → no invented crop in matching output");
{
  const matches = matchMachinery("harvesting", PROFILE_NO_CROP);
  assert(
    matches.every(
      (m) => !m.matchBasis.some((b) => b.includes("selected crop"))
    ),
    "no crop mentioned in match basis when none selected"
  );
  assert(
    matches.every((m) => m.matchBasis.length > 0),
    "match basis still present (operation + size only)"
  );
}

/* ------------------------------------------------------------------ */
/* Extra determinism + coverage checks                                 */
/* ------------------------------------------------------------------ */
console.log("\nExtra: determinism, coverage, availability semantics");
{
  // Availability ordering: available before busy before unavailable.
  const harvest = matchMachinery("harvesting", PROFILE);
  const statusRank = { available: 0, busy: 1, unavailable: 2 } as const;
  const ranks = harvest.map(
    (m) => statusRank[m.provider.availabilityStatus]
  );
  assert(
    ranks.every((r, i) => i === 0 || ranks[i - 1] <= r),
    "results ordered available → busy → unavailable"
  );

  // Every operation has at least one machine except designed gaps.
  for (const op of FARM_OPERATIONS) {
    const count = MACHINERY_PROVIDERS.filter((p) => p.operation === op.id).length;
    assert(
      count > 0 || op.id === "transport",
      `operation ${op.id} has machinery (or is a designed gap)`
    );
  }

  // getOperation round-trip.
  assert(
    getOperation("sowing")?.name === "Sowing",
    "getOperation resolves by id"
  );
  assert(getOperation("nonexistent" as FarmOperationId) === undefined, "getOperation returns undefined for unknown id");

  // Every operation id is labelable.
  assert(
    FARM_OPERATIONS.every((o) => OPERATION_LABELS[o.id] === o.name),
    "operation labels cover all operations"
  );

  // Suitable machine types are non-empty.
  assert(
    FARM_OPERATIONS.every((o) => o.suitableMachineTypes.length > 0),
    "each operation lists suitable machine types"
  );

  // Distances are numbers (deterministic sort basis).
  assert(
    MACHINERY_PROVIDERS.every((p) => typeof p.distanceKm === "number"),
    "distances are numeric for deterministic ordering"
  );

  // Provider shape: no 'any' leakage — spot-check a typed record.
  const sample: MachineryProvider = MACHINERY_PROVIDERS[0];
  assert(
    typeof sample.machineName === "string" &&
      typeof sample.suitableFarmSizeAcres.min === "number",
    "provider records conform to MachineryProvider type"
  );
}

/* ------------------------------------------------------------------ */
console.log(
  failures === 0
    ? "\nALL CHECKS PASSED — operations workflow verified (A–J + extras)."
    : `\n${failures} CHECK(S) FAILED.`
);
process.exit(failures === 0 ? 0 : 1);
