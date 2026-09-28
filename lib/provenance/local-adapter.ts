import type {
  ProvenanceRecord,
  VerificationResult,
} from "@/lib/provenance/types";
import type { ChainAdapter, ChainSubmitInput } from "@/lib/provenance/adapter";

/**
 * LOCAL VERIFICATION ADAPTER — the deterministic default.
 *
 * Zero network. Stores the full record keyed by canonical hash in server
 * memory for the session and verifies by recomputing/looking up the hash.
 * This is honest, clearly-labeled LOCAL VERIFICATION — never presented as
 * a blockchain transaction.
 *
 * The registry is also the integrity anchor for blockchain records: an
 * on-chain anchoring upgrade is merged into the SAME entry, so the local
 * hash (the thing actually anchored) stays traceable to the record.
 */

interface RegistryEntry {
  record: ProvenanceRecord;
  eventType: string;
  at: string;
}

/** Session-scoped registry (server memory), keyed by canonical hash. */
const registry = new Map<string, RegistryEntry>();

export function createLocalVerificationAdapter(): ChainAdapter {
  return {
    name: "local-verification",
    chain: "local",
    network: "in-app",

    async submit(input: ChainSubmitInput): Promise<ProvenanceRecord> {
      const now = new Date().toISOString();
      const record: ProvenanceRecord = {
        id: `prov-local-${input.recordHash.slice(0, 16)}`,
        eventId: input.metadata.eventId ?? "",
        canonicalPayloadHash: input.recordHash,
        chain: "local",
        network: "in-app",
        // No transactionHash — this is NOT a blockchain transaction.
        status: "local-verified",
        reason:
          "Deterministic local verification — the record hash was computed and registered in-app. Not a blockchain transaction.",
        createdAt: now,
        source: "LOCAL",
      };
      registry.set(input.recordHash, {
        record,
        eventType: input.eventType,
        at: now,
      });
      return record;
    },

    async verify(record: ProvenanceRecord): Promise<VerificationResult> {
      const entry = registry.get(record.canonicalPayloadHash);
      // Local verification is for LOCAL records: hash registered AND the
      // record still claims local verification. Blockchain records must
      // verify against the chain (blockchain adapter) — the local
      // registry alone can never confirm a blockchain claim.
      const verified =
        Boolean(entry) && record.status === "local-verified";
      return {
        verified,
        recordHash: record.canonicalPayloadHash,
        network: "in-app",
        reason: verified
          ? "Record hash matches the locally registered hash — deterministic local verification."
          : "Record hash not found in the local registry or record status changed.",
        verifiedAt: new Date().toISOString(),
        source: "LOCAL",
      };
    },
  };
}

/** Test helper — clear the registry between verification scenarios. */
export function clearLocalRegistry(): void {
  registry.clear();
}

/**
 * Look up the registry entry for a canonical hash. Returns undefined when
 * unknown — callers must respond honestly.
 */
export function getRegisteredRecordHash(
  recordHash: string
): RegistryEntry | undefined {
  return registry.get(recordHash);
}

/**
 * Merge an anchoring upgrade into the existing local registry entry.
 * Used after a real on-chain anchor is confirmed so the SAME record
 * (same hash, same id) carries the on-chain truth. No-op when the hash
 * was never registered locally.
 */
export function updateLocalRecord(
  recordHash: string,
  patch: Partial<
    Pick<
      ProvenanceRecord,
      "transactionHash" | "blockNumber" | "anchoredAt" | "status" | "reason" | "contractAddress"
    >
  > & { chain?: string; network?: string; source?: ProvenanceRecord["source"] }
): ProvenanceRecord | undefined {
  const entry = registry.get(recordHash);
  if (!entry) return undefined;
  const updated: ProvenanceRecord = { ...entry.record, ...patch };
  entry.record = updated;
  return updated;
}

/**
 * Record lookup by record id (truncated-hash form) or full canonical hash.
 * Returns the stored record as-is — status/transactionHash reflect reality.
 */
export function lookupLocalRecord(
  idOrHash: string
): ProvenanceRecord | undefined {
  // Exact full-hash lookup first.
  const exact = registry.get(idOrHash);
  if (exact) return exact.record;

  // Record-id form: prov-local-<16> / prov-chain-<16> → hash prefix match.
  const prefixes = ["prov-local-", "prov-chain-"] as const;
  for (const prefix of prefixes) {
    if (idOrHash.startsWith(prefix)) {
      const short = idOrHash.slice(prefix.length);
      for (const [hash, entry] of registry) {
        if (hash.startsWith(short)) return entry.record;
      }
    }
  }
  return undefined;
}
