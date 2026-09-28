import type { DataSource } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Farm operations                                                     */
/* ------------------------------------------------------------------ */

export interface FarmOperation {
  /** Stable identifier, e.g. "harvesting". Doubles as the URL-safe key. */
  id: FarmOperationId;
  name: string;
  description: string;
  category: OperationCategory;
  /** Machine types that can perform this operation (demo knowledge base). */
  suitableMachineTypes: MachineType[];
  /** Human-readable demo estimate, e.g. "Half day for 4–8 acres". */
  approximateDuration: string;
}

export type OperationCategory =
  | "field-preparation"
  | "planting"
  | "crop-care"
  | "harvest-post-harvest";

export type MachineType =
  | "tractor"
  | "rotavator"
  | "seed-drill"
  | "sprayer"
  | "combine-harvester"
  | "trolley";

/* ------------------------------------------------------------------ */
/* Demo machinery providers                                            */
/* ------------------------------------------------------------------ */

export type AvailabilityStatus = "available" | "busy" | "unavailable";

/**
 * One curated demo machinery offer. Static sample data — never presented
 * as a live provider or real-time availability.
 */
export interface MachineryProvider {
  id: string;
  providerName: string;
  machineName: string;
  machineType: MachineType;
  /** Operation id this offer serves (e.g. "harvesting"). */
  operation: FarmOperationId;
  /** Demo provider location label, e.g. "Nashik Road (demo)". */
  location: string;
  distanceKm: number;
  availabilityStatus: AvailabilityStatus;
  /** Demo response estimate, e.g. "~15 minutes". */
  estimatedResponse: string;
  /** Farm-size suitability window in acres (dataset value). */
  suitableFarmSizeAcres: { min: number; max: number };
  /** Always "demo" in this step. Kept explicit for the transparency rule. */
  source: Extract<DataSource, "demo">;
}

export type FarmOperationId =
  | "seedbed-preparation"
  | "sowing"
  | "spraying"
  | "harvesting"
  | "transport";

/* ------------------------------------------------------------------ */
/* Operation request (demo workflow only — no real booking)            */
/* ------------------------------------------------------------------ */

/**
 * Demo workflow status progression.
 * No real provider is contacted at any point.
 */
export type OperationRequestStatus =
  | "idle"
  | "reviewing"
  | "submitted"
  | "provider_response";

/** Outcome the demo provider can produce after a short UI transition. */
export type ProviderResponseKind = "accepted" | "unavailable";

/**
 * A service request within the app workflow:
 * no payment, no booking backend, no provider notification.
 */
export interface OperationRequest {
  id: string;
  operation: FarmOperationId;
  machineId: string;
  machineName: string;
  providerName: string;
  requestedDate: string;
  status: OperationRequestStatus;
  response?: ProviderResponseKind;
  createdAt: string;
  /** Always "demo" — requests are demonstration artefacts in this step. */
  source: Extract<DataSource, "demo">;
}

/**
 * Lightweight summary the dashboard reads from FarmProvider.
 * Machinery datasets stay inside the operations feature — never global.
 */
export interface LatestOperationSummary {
  operationId: FarmOperationId;
  operationName: string;
  machineName: string;
  providerName: string;
  status: OperationRequestStatus;
  response?: ProviderResponseKind;
  source: Extract<DataSource, "demo">;
  createdAt: string;
}

/** One optional machine card: response + explainable match basis. */
export interface MachineMatch {
  provider: MachineryProvider;
  /** Ordered, human-readable reasons why this machine was suggested. */
  matchBasis: string[];
}
