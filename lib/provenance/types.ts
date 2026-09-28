import type { TimelineEventType } from "@/lib/timeline/types";

/**
 * PROVENANCE CONTRACT (P1.4 + blockchain extension)
 *
 * Tamper-evident proof of important farm events. Only a canonical hash and
 * safe metadata ever leave the application — never personal data, crop
 * images, API responses, keys or secrets. Blockchain interaction is fully
 * isolated behind the ChainAdapter interface.
 *
 * Two verification modes share one model:
 *  - LOCAL (default): deterministic in-app SHA-256 verification.
 *  - BLOCKCHAIN (opt-in, env-gated): the canonical hash is anchored on a
 *    public testnet via a minimal contract; verification queries the chain.
 * A record is ALWAYS created locally first; blockchain anchoring is an
 * explicit, separate step that upgrades the same record in place.
 */

/** Request the client sends to create a provenance record for an event. */
export interface ProvenanceRequestInput {
  eventId: string;
  eventType: TimelineEventType;
  eventTimestamp: string;
  /** Whitelisted, short, string-only summary fields. */
  entitySummary: Record<string, string>;
  farmContext: { crop?: string; season?: string; location?: string };
}

/**
 * The ONLY structure that is hashed. Deterministic: identical inputs
 * (including recordCreatedAt) produce an identical hash.
 */
export interface CanonicalProvenancePayload {
  schemaVersion: 1;
  eventType: TimelineEventType;
  eventTimestamp: string;
  /** SHA-256 of the (non-sensitive) farm context triple. */
  farmContextDigest: string;
  entitySummary: Record<string, string>;
  recordCreatedAt: string;
}

/** Where a record's proof currently lives. */
export type ProvenanceSource = "LOCAL" | "BLOCKCHAIN";

export interface ProvenanceRecord {
  id: string;
  eventId: string;
  /** SHA-256 hex of the canonical payload. */
  canonicalPayloadHash: string;
  /** "local" or the configured chain identifier (e.g. "polygon-amoy"). */
  chain: string;
  /** "in-app" or the configured network (e.g. "amoy"). */
  network: string;
  /** Present ONLY when a real transaction receipt was observed. Never fabricated. */
  transactionHash?: string;
  blockNumber?: number;
  /** Deployed ProvenanceAnchor contract (blockchain records only). */
  contractAddress?: string;
  status: "pending" | "local-verified" | "blockchain-verified" | "failed";
  /** Human-readable, honest reason (shown on failure/unavailable). */
  reason?: string;
  createdAt: string;
  /** When the on-chain anchor was confirmed (blockchain records only). */
  anchoredAt?: string;
  /** Where this record's proof lives today. */
  source: ProvenanceSource;
}

export interface VerificationResult {
  verified: boolean;
  recordHash: string;
  transactionHash?: string;
  network: string;
  /** Deployed contract that was queried (blockchain verification only). */
  contractAddress?: string;
  reason: string;
  verifiedAt: string;
  /** Which mechanism produced this verification result. */
  source: ProvenanceSource;
}

/** Configuration — ALL values come from server-side env, never hard-coded. */
export interface ProvenanceAdapterConfig {
  chain: string;
  network: string;
  endpoint?: string;
  apiKey?: string;
  contractAddress?: string;
}

/**
 * Honest capability report for the UI — booleans only, never secret values.
 * The anchoring button is shown only when `anchoringAvailable` is true.
 */
export interface ProvenanceCapabilities {
  /** Blockchain adapter fully configured (adapter/chain/network/contract/rpc). */
  blockchainConfigured: boolean;
  /** A signer is also present, so anchoring transactions can be submitted. */
  anchoringAvailable: boolean;
}

/**
 * Outcome of an explicit blockchain anchoring attempt on an existing
 * locally-verified record. The local record is never downgraded by a
 * failure — `failed`/`skipped` keep the record locally verified.
 */
export type AnchoringOutcome =
  | { requested: true; attempted: true; result: "anchored" }
  | { requested: true; attempted: true; result: "failed"; reason: string }
  | { requested: true; attempted: false; result: "skipped"; reason: string }
  | { requested: false; attempted: false; result: "skipped"; reason?: string };
