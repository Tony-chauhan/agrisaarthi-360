import type {
  ProvenanceRecord,
  VerificationResult,
} from "@/lib/provenance/types";
import type { ChainAdapter, ChainSubmitInput } from "@/lib/provenance/adapter";

/**
 * LOCAL VERIFICATION ADAPTER (P1.4) — the deterministic default.
 *
 * Zero dependencies, zero network. Stores hash → record in server memory
 * for the session and verifies by recomputing/looking up the hash. This is
 * honest, clearly-labeled LOCAL VERIFICATION — never presented as a
 * blockchain transaction.
 */

/** Session-scoped hash registry (server memory). */
const registry = new Map<string, { recordHash: string; eventType: string; at: string }>();

export function createLocalVerificationAdapter(): ChainAdapter {
  return {
    name: "local-verification",
    chain: "local",
    network: "in-app",

    async submit(input: ChainSubmitInput): Promise<ProvenanceRecord> {
      const now = new Date().toISOString();
      registry.set(input.recordHash, {
        recordHash: input.recordHash,
        eventType: input.eventType,
        at: now,
      });
      return {
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
      };
    },

    async verify(record: ProvenanceRecord): Promise<VerificationResult> {
      const entry = registry.get(record.canonicalPayloadHash);
      const verified = Boolean(entry) && record.status === "local-verified";
      return {
        verified,
        recordHash: record.canonicalPayloadHash,
        network: "in-app",
        reason: verified
          ? "Record hash matches the locally registered hash — deterministic local verification."
          : "Record hash not found in the local registry or record status changed.",
        verifiedAt: new Date().toISOString(),
      };
    },
  };
}

/** Test helper — clear the registry between verification scenarios. */
export function clearLocalRegistry(): void {
  registry.clear();
}

/**
 * Record lookup by record id (truncated-hash form) or full canonical hash.
 * Returns undefined when unknown — callers must respond honestly.
 */
export function lookupLocalRecord(idOrHash: string): ProvenanceRecord | undefined {
  const toRecord = (hash: string, entry: { recordHash: string; eventType: string; at: string }): ProvenanceRecord => ({
    id: `prov-local-${hash.slice(0, 16)}`,
    eventId: "",
    canonicalPayloadHash: hash,
    chain: "local",
    network: "in-app",
    status: "local-verified",
    reason:
      "Deterministic local verification — the record hash was computed and registered in-app. Not a blockchain transaction.",
    createdAt: entry.at,
  });

  // Exact full-hash lookup first.
  const exact = registry.get(idOrHash);
  if (exact) return toRecord(idOrHash, exact);

  // Record-id form: prov-local-<first16> → match by hash prefix.
  if (idOrHash.startsWith("prov-local-")) {
    const prefix = idOrHash.slice("prov-local-".length);
    for (const [hash, entry] of registry) {
      if (hash.startsWith(prefix)) return toRecord(hash, entry);
    }
  }
  return undefined;
}
