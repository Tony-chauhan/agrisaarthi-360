import type {
  ProvenanceAdapterConfig,
  ProvenanceRecord,
  VerificationResult,
} from "@/lib/provenance/types";

/**
 * BLOCKCHAIN ADAPTER ABSTRACTION (P1.4)
 *
 * All chain interaction lives behind this interface. UI components and
 * API routes NEVER import web3 libraries — only adapters do, and only the
 * testnet adapter (env-gated) touches a real network.
 */

export interface ChainSubmitInput {
  /** SHA-256 hex of the canonical payload. */
  recordHash: string;
  eventType: string;
  eventTimestamp: string;
  /** Safe verification metadata (already whitelisted upstream). */
  metadata: Record<string, string>;
}

/**
 * The single seam between AgriSaarthi and any chain. Implementations:
 *  - LocalVerificationAdapter — deterministic in-app verification (default)
 *  - BlockchainVerificationAdapter — env-gated testnet submission
 */
export interface ChainAdapter {
  readonly name: string;
  readonly chain: string;
  readonly network: string;
  submit(input: ChainSubmitInput): Promise<ProvenanceRecord>;
  verify(record: ProvenanceRecord): Promise<VerificationResult>;
}

/** Shared adapter config resolution — server-side only. */
export function resolveAdapterConfig(): ProvenanceAdapterConfig {
  return {
    chain: process.env.PROVENANCE_CHAIN || "local",
    network: process.env.PROVENANCE_NETWORK || "in-app",
    endpoint: process.env.PROVENANCE_RPC_ENDPOINT,
    apiKey: process.env.PROVENANCE_API_KEY,
    contractAddress: process.env.PROVENANCE_CONTRACT_ADDRESS,
  };
}
