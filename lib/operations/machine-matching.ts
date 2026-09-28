import type { FarmProfile } from "@/lib/types";
import { FARM_OPERATIONS, MACHINERY_PROVIDERS } from "./machine-knowledge";
import type {
  AvailabilityStatus,
  FarmOperation,
  FarmOperationId,
  MachineMatch,
  MachineType,
  ProviderResponseKind,
} from "./types";

/**
 * Deterministic machinery matching engine.
 * Same FarmProfile + operation → same machines, same ordering, every run.
 * No randomness, no network calls. Explanations are transparent heuristics
 * — this is decision-engine suitability, not scientific optimization.
 */

/** Tiebreaker: stable sort by distance, then id — never by random chance. */
function compareByDistanceThenId(a: MachineMatch, b: MachineMatch): number {
  if (a.provider.distanceKm !== b.provider.distanceKm) {
    return a.provider.distanceKm - b.provider.distanceKm;
  }
  return a.provider.id.localeCompare(b.provider.id);
}

/**
 * Match machinery for one operation.
 * Returns only compatible offers, ordered deterministically:
 * available → busy → unavailable, then by distance, then id.
 */
export function matchMachinery(
  operation: FarmOperationId,
  profile: FarmProfile | null
): MachineMatch[] {
  const farmSize = profile?.farmSizeAcres ?? 0;

  const matches = MACHINERY_PROVIDERS.filter(
    (p) => p.operation === operation
  ).map<MachineMatch>((p) => {
    const basis: string[] = [];

    basis.push(
      p.machineType === "combine-harvester"
        ? `Suggested match — combine harvester suits ${operationLabel(operation)} on farms of this size.`
        : `Suggested match — ${machineTypeLabel(p.machineType)} suits ${operationLabel(operation)}.`
    );

    if (
      farmSize > 0 &&
      farmSize >= p.suitableFarmSizeAcres.min &&
      farmSize <= p.suitableFarmSizeAcres.max
    ) {
      basis.push(
        `Suitability — your ${farmSize} acres fit the ${p.suitableFarmSizeAcres.min}–${p.suitableFarmSizeAcres.max} acre range.`
      );
    } else if (farmSize > 0) {
      basis.push(
        `Suitability — farm size outside the typical ${p.suitableFarmSizeAcres.min}–${p.suitableFarmSizeAcres.max} acre range.`
      );
    }

    if (profile?.selectedCrop) {
      basis.push(
        `Suggested for your selected crop: ${profile.selectedCrop}.`
      );
    }

    return { provider: p, matchBasis: basis };
  });

  const order = { available: 0, busy: 1, unavailable: 2 } as const;
  return matches.sort(
    (a, b) =>
      order[a.provider.availabilityStatus] - order[b.provider.availabilityStatus] ||
      compareByDistanceThenId(a, b)
  );
}

/** An alternative offer for the fallback flow: same operation, different machine. */
export function findAlternative(
  operation: FarmOperationId,
  excludeId: string,
  profile: FarmProfile | null
): MachineMatch | null {
  const matches = matchMachinery(operation, profile).filter(
    (m) => m.provider.id !== excludeId
  );
  return matches[0] ?? null;
}

export function getOperation(id: FarmOperationId): FarmOperation | undefined {
  return FARM_OPERATIONS.find((op) => op.id === id);
}

/**
 * Deterministic provider response rule for the service dataset.
 * Only "available" machines produce "accepted"; busy/unavailable produce
 * "unavailable" so the alternative-machine flow is exercised. No randomness.
 */
export function demoResponseFor(
  status: AvailabilityStatus
): ProviderResponseKind {
  return status === "available" ? "accepted" : "unavailable";
}

/* ------------------------------------------------------------------ */
/* Internal helpers                                                    */
/* ------------------------------------------------------------------ */

function operationLabel(operation: FarmOperationId): string {
  switch (operation) {
    case "seedbed-preparation":
      return "seedbed preparation";
    case "sowing":
      return "sowing";
    case "spraying":
      return "spraying";
    case "harvesting":
      return "harvesting";
    case "transport":
      return "transport";
  }
}

function machineTypeLabel(type: MachineType): string {
  switch (type) {
    case "tractor":
      return "a tractor";
    case "rotavator":
      return "a rotavator";
    case "seed-drill":
      return "a seed drill";
    case "sprayer":
      return "a sprayer";
    case "combine-harvester":
      return "a combine harvester";
    case "trolley":
      return "a trolley";
  }
}
