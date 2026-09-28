import type {
  ProvenanceRecord,
  ProvenanceRequestInput,
  VerificationResult,
} from "@/lib/provenance/types";
import type { ChainAdapter } from "@/lib/provenance/adapter";
import { resolveAdapterConfig } from "@/lib/provenance/adapter";
import { createLocalVerificationAdapter } from "@/lib/provenance/local-adapter";
import {
  createBlockchainVerificationAdapter,
  isBlockchainConfigured,
} from "@/lib/provenance/testnet-adapter";
import {
  buildCanonicalPayload,
  filterEntitySummary,
  hashCanonicalPayload,
} from "@/lib/provenance/canonical";

/**
 * PROVENANCE SERVICE (P1.4) — server-side orchestrator.
 *
 * Flow: request → whitelist-filter → canonical payload → SHA-256 →
 * adapter.submit → ProvenanceRecord. Verification delegates to the
 * adapter. Never throws to the caller; failures become honest
 * unavailable/failed results — never a fabricated success.
 */

export function resolveProvenanceAdapter(): ChainAdapter {
  return isBlockchainConfigured()
    ? createBlockchainVerificationAdapter()
    : createLocalVerificationAdapter();
}

export type CreateRecordOutcome =
  | { status: "success"; record: ProvenanceRecord }
  | { status: "unavailable"; reason: string };

export type VerifyOutcome =
  | { status: "success"; result: VerificationResult }
  | { status: "unavailable"; reason: string };

/** Create a provenance record for an event. */
export async function createProvenanceRecord(
  input: ProvenanceRequestInput
): Promise<CreateRecordOutcome> {
  const adapter = resolveProvenanceAdapter();

  // 1. Server-side whitelist filter — drop anything not allowed.
  const entitySummary = filterEntitySummary(input.entitySummary);

  // 2. Canonical payload + deterministic hash.
  const recordCreatedAt = new Date().toISOString();
  const canonical = buildCanonicalPayload(
    {
      eventType: input.eventType,
      eventTimestamp: input.eventTimestamp,
      entitySummary,
      farmContext: {
        crop: input.farmContext.crop,
        season: input.farmContext.season,
        location: input.farmContext.location,
      },
    },
    recordCreatedAt
  );
  const recordHash = hashCanonicalPayload(canonical);

  // 3. Submit through the adapter (isolated chain interaction).
  try {
    const record = await adapter.submit({
      recordHash,
      eventType: input.eventType,
      eventTimestamp: input.eventTimestamp,
      metadata: {
        eventId: input.eventId,
        ...entitySummary,
      },
    });
    return { status: "success", record };
  } catch (err) {
    return {
      status: "unavailable",
      reason:
        err instanceof Error
          ? `Blockchain verification unavailable — ${err.message}`
          : "Blockchain verification unavailable.",
    };
  }
}

/** Verify an existing record through the adapter. */
export async function verifyProvenanceRecord(
  record: ProvenanceRecord
): Promise<VerifyOutcome> {
  const adapter = resolveProvenanceAdapter();
  try {
    const result = await adapter.verify(record);
    return { status: "success", result };
  } catch (err) {
    return {
      status: "unavailable",
      reason:
        err instanceof Error
          ? `Blockchain verification unavailable — ${err.message}`
          : "Blockchain verification unavailable.",
    };
  }
}

/** Exposed for the API route metadata + honest UI labeling. */
export function provenanceMode(): {
  adapter: string;
  chain: string;
  network: string;
} {
  const adapter = resolveProvenanceAdapter();
  return {
    adapter: adapter.name,
    chain: adapter.chain,
    network: adapter.network,
  };
}

/** Config summary for /api/provenance responses (no secrets). */
export function provenanceConfigSummary(): {
  chain: string;
  network: string;
} {
  const cfg = resolveAdapterConfig();
  return { chain: cfg.chain, network: cfg.network };
}
