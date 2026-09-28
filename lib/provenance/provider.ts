import type {
  AnchoringOutcome,
  ProvenanceCapabilities,
  ProvenanceRecord,
  ProvenanceRequestInput,
  VerificationResult,
} from "@/lib/provenance/types";
import type { ChainAdapter } from "@/lib/provenance/adapter";
import { resolveAdapterConfig } from "@/lib/provenance/adapter";
import {
  createLocalVerificationAdapter,
  getRegisteredRecordHash,
  updateLocalRecord,
} from "@/lib/provenance/local-adapter";
import {
  BLOCKCHAIN_UNAVAILABLE_MESSAGE,
  createBlockchainVerificationAdapter,
  isBlockchainAnchoringAvailable,
  isBlockchainConfigured,
} from "@/lib/provenance/testnet-adapter";
import {
  buildCanonicalPayload,
  filterEntitySummary,
  hashCanonicalPayload,
} from "@/lib/provenance/canonical";

/**
 * PROVENANCE SERVICE — server-side orchestrator.
 *
 * Record creation is ALWAYS local-first: request → whitelist-filter →
 * canonical payload → SHA-256 → local adapter. The record exists and is
 * locally verified before any chain interaction.
 *
 * Blockchain anchoring is an EXPLICIT second step (never silent), enabled
 * only when the testnet adapter is fully configured. Anchoring failures
 * never downgrade the record — it stays locally verified with an honest
 * reason. Verification routes to the blockchain adapter for anchored
 * records; nothing is ever fabricated.
 */

export function resolveProvenanceAdapter(): ChainAdapter {
  return isBlockchainConfigured()
    ? createBlockchainVerificationAdapter()
    : createLocalVerificationAdapter();
}

export type CreateRecordOutcome =
  | {
      status: "success";
      record: ProvenanceRecord;
      anchoring: AnchoringOutcome;
    }
  | { status: "unavailable"; reason: string };

export type AnchorOutcome =
  | { status: "success"; record: ProvenanceRecord }
  | { status: "unavailable"; reason: string };

export type VerifyOutcome =
  | { status: "success"; result: VerificationResult }
  | { status: "unavailable"; reason: string };

/** Honest capability report — booleans only, never secret values. */
export function provenanceCapabilities(): ProvenanceCapabilities {
  return {
    blockchainConfigured: isBlockchainConfigured(),
    anchoringAvailable: isBlockchainAnchoringAvailable(),
  };
}

/** Create a locally-verified provenance record; optionally anchor on-chain. */
export async function createProvenanceRecord(
  input: ProvenanceRequestInput,
  options: { anchorOnChain?: boolean } = {}
): Promise<CreateRecordOutcome> {
  const localAdapter = createLocalVerificationAdapter();

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

  // 3. Local submission — the record always exists and is locally
  //    verified before anything else happens.
  let record: ProvenanceRecord;
  try {
    record = await localAdapter.submit({
      recordHash,
      eventType: input.eventType,
      eventTimestamp: input.eventTimestamp,
      metadata: {
        eventId: input.eventId,
        ...entitySummary,
      },
    });
  } catch {
    return {
      status: "unavailable",
      reason:
        "Record creation failed — the canonical hash could not be registered locally.",
    };
  }

  // 4. Optional, explicit on-chain anchoring — never silent, and a
  //    failure never downgrades the locally verified record.
  if (options.anchorOnChain === true) {
    const anchoring = await anchorProvenanceRecord(record);
    return {
      status: "success",
      record: anchoring.status === "success" ? anchoring.record : record,
      anchoring:
        anchoring.status === "success"
          ? { requested: true, attempted: true, result: "anchored" }
          : anchoring.reason.toLowerCase().includes("not configured")
            ? {
                requested: true,
                attempted: false,
                result: "skipped",
                reason: anchoring.reason,
              }
            : {
                requested: true,
                attempted: true,
                result: "failed",
                reason: anchoring.reason,
              },
    };
  }

  return {
    status: "success",
    record,
    anchoring: { requested: false, attempted: false, result: "skipped" },
  };
}

/**
 * Explicitly anchor an existing locally-verified record on the configured
 * testnet. Merges the on-chain truth into the SAME record (same hash, same
 * id). Any failure preserves local verification and returns the reason.
 */
export async function anchorProvenanceRecord(
  record: ProvenanceRecord
): Promise<AnchorOutcome> {
  if (!isBlockchainAnchoringAvailable()) {
    return {
      status: "unavailable",
      reason: `${BLOCKCHAIN_UNAVAILABLE_MESSAGE} (adapter not configured.)`,
    };
  }

  // The record must exist in the local registry — anchoring upgrades an
  // existing record; it never fabricates one.
  const registered = getRegisteredRecordHash(record.canonicalPayloadHash);
  if (!registered) {
    return {
      status: "unavailable",
      reason:
        "This record is not in the local registry — it cannot be anchored. Create the record first.",
    };
  }

  const adapter = createBlockchainVerificationAdapter();
  try {
    const anchoredRecord = await adapter.submit({
      recordHash: record.canonicalPayloadHash,
      eventType: registered.eventType,
      eventTimestamp: record.createdAt,
      metadata: { eventId: record.eventId },
    });

    // Merge the on-chain truth into the local registry entry.
    const merged = updateLocalRecord(record.canonicalPayloadHash, {
      status: anchoredRecord.status,
      transactionHash: anchoredRecord.transactionHash,
      blockNumber: anchoredRecord.blockNumber,
      anchoredAt: anchoredRecord.anchoredAt,
      contractAddress: anchoredRecord.contractAddress,
      chain: anchoredRecord.chain,
      network: anchoredRecord.network,
      source: "BLOCKCHAIN",
      reason: anchoredRecord.reason,
    });

    return { status: "success", record: merged ?? anchoredRecord };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown chain error.";
    // Failure path — the record remains locally verified.
    updateLocalRecord(record.canonicalPayloadHash, {
      reason: `${BLOCKCHAIN_UNAVAILABLE_MESSAGE} (${message})`,
    });
    return {
      status: "unavailable",
      reason: `${BLOCKCHAIN_UNAVAILABLE_MESSAGE} (${message})`,
    };
  }
}

/** Verify an existing record through the right adapter. */
export async function verifyProvenanceRecord(
  record: ProvenanceRecord
): Promise<VerifyOutcome> {
  // A blockchain record whose chain can no longer be queried (config gone)
  // must NOT be confirmed by the local registry — report honestly that
  // the blockchain claim cannot be verified right now.
  if (record.source === "BLOCKCHAIN" && !isBlockchainConfigured()) {
    return {
      status: "success",
      result: {
        verified: false,
        recordHash: record.canonicalPayloadHash,
        network: record.network,
        contractAddress: record.contractAddress,
        reason: `${BLOCKCHAIN_UNAVAILABLE_MESSAGE} (adapter no longer configured.)`,
        verifiedAt: new Date().toISOString(),
        source: "LOCAL",
      },
    };
  }

  // Anchored records verify against the chain (when configured); local
  // records go through the resolved (default local) adapter.
  const adapter =
    record.source === "BLOCKCHAIN"
      ? createBlockchainVerificationAdapter()
      : resolveProvenanceAdapter();

  try {
    const result = await adapter.verify(record);
    return { status: "success", result };
  } catch (err) {
    return {
      status: "unavailable",
      reason:
        err instanceof Error
          ? `${BLOCKCHAIN_UNAVAILABLE_MESSAGE} (${err.message})`
          : BLOCKCHAIN_UNAVAILABLE_MESSAGE,
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
