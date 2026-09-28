import type { TimelineEventType } from "@/lib/timeline/types";

/**
 * PROVENANCE CONTRACT (P1.4)
 *
 * Tamper-evident proof of important farm events. Only a canonical hash and
 * safe metadata ever leave the application — never personal data, crop
 * images, API responses, keys or secrets. Blockchain interaction is fully
 * isolated behind the ChainAdapter interface.
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

export interface ProvenanceRecord {
  id: string;
  eventId: string;
  /** SHA-256 hex of the canonical payload. */
  canonicalPayloadHash: string;
  /** e.g. "local" or the configured chain identifier. */
  chain: string;
  network: string;
  transactionHash?: string;
  blockNumber?: number;
  status: "pending" | "local-verified" | "blockchain-verified" | "failed";
  /** Human-readable, honest reason (shown on failure/unavailable). */
  reason?: string;
  createdAt: string;
}

export interface VerificationResult {
  verified: boolean;
  recordHash: string;
  transactionHash?: string;
  network: string;
  reason: string;
  verifiedAt: string;
}

/** Configuration — ALL values come from server-side env, never hard-coded. */
export interface ProvenanceAdapterConfig {
  chain: string;
  network: string;
  endpoint?: string;
  apiKey?: string;
  contractAddress?: string;
}
