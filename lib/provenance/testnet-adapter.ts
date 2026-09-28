import type {
  ProvenanceRecord,
  VerificationResult,
} from "@/lib/provenance/types";
import type { ChainAdapter, ChainSubmitInput } from "@/lib/provenance/adapter";
import { resolveAdapterConfig } from "@/lib/provenance/adapter";

/**
 * BLOCKCHAIN VERIFICATION ADAPTER (P1.4) — env-gated testnet path.
 *
 * Enabled ONLY when PROVENANCE_ADAPTER=testnet AND the chain/network/
 * contract configuration is present. Never enabled by default; never
 * hard-codes a contract address; never claims a live transaction when
 * configuration or the network is unavailable — it returns an honest
 * failure/unavailable result that the orchestrator surfaces as such.
 *
 * NOTE: the concrete chain SDK/dependency is intentionally NOT added to
 * package.json in P1. The submission/verification call sites are isolated
 * here so adding the real client later touches exactly this file.
 */

export class BlockchainAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockchainAdapterError";
  }
}

export function isBlockchainConfigured(): boolean {
  const cfg = resolveAdapterConfig();
  return (
    process.env.PROVENANCE_ADAPTER === "testnet" &&
    cfg.chain !== "local" &&
    cfg.network !== "in-app" &&
    Boolean(cfg.contractAddress) &&
    Boolean(cfg.endpoint)
  );
}

export function createBlockchainVerificationAdapter(): ChainAdapter {
  const cfg = resolveAdapterConfig();

  return {
    name: "blockchain-verification",
    chain: cfg.chain,
    network: cfg.network,

    async submit(input: ChainSubmitInput): Promise<ProvenanceRecord> {
      if (!isBlockchainConfigured()) {
        throw new BlockchainAdapterError(
          "Blockchain adapter is not fully configured (adapter/chain/network/contract/rpc)."
        );
      }

      // Submission seam — the ONLY place a chain client would be invoked.
      // e.g. contract.append(input.recordHash, input.eventType, timestamp)
      // In P1 this seam throws honestly when no live chain client is
      // installed, so the app shows "Blockchain verification unavailable"
      // instead of pretending a transaction occurred.
      throw new BlockchainAdapterError(
        "No live chain client installed for the configured testnet — submission unavailable."
      );
    },

    async verify(record: ProvenanceRecord): Promise<VerificationResult> {
      if (!isBlockchainConfigured()) {
        return {
          verified: false,
          recordHash: record.canonicalPayloadHash,
          network: cfg.network,
          reason: "Blockchain verification unavailable — adapter not configured.",
          verifiedAt: new Date().toISOString(),
        };
      }

      // Verification seam — would query the chain for the stored hash.
      return {
        verified: false,
        recordHash: record.canonicalPayloadHash,
        network: cfg.network,
        reason:
          "Blockchain verification unavailable — no live chain client installed.",
        verifiedAt: new Date().toISOString(),
      };
    },
  };
}
