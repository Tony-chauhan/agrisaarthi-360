import { createHash } from "node:crypto";
import type {
  CanonicalProvenancePayload,
  ProvenanceRequestInput,
} from "@/lib/provenance/types";

/**
 * CANONICALIZATION + HASH SERVICE (P1.4)
 *
 * Deterministic serialization: sorted keys, fixed field order, fixed
 * schemaVersion. The same logical record ALWAYS produces the same hash —
 * verified in scripts/verify-provenance.ts.
 *
 * NEVER hashed: API keys, tokens, raw image bytes, raw API responses,
 * personal secrets. Only the whitelisted canonical payload fields enter.
 */

export const CANONICAL_SCHEMA_VERSION = 1 as const;

/** Maximum entitySummary keys and value length accepted from requests. */
export const MAX_SUMMARY_KEYS = 10;
export const MAX_SUMMARY_VALUE_LENGTH = 120;

/**
 * Whitelist of entitySummary keys that may enter the canonical payload.
 * Anything else in a request is dropped server-side.
 */
export const ALLOWED_SUMMARY_KEYS = new Set([
  "crop",
  "possibleCondition",
  "likelihood",
  "operationName",
  "machineName",
  "providerName",
  "taskTitle",
  "taskCategory",
  "statusText",
]);

/** Whitelist-filter an incoming summary map (server-side safety gate). */
export function filterEntitySummary(
  raw: unknown
): Record<string, string> {
  const out: Record<string, string> = {};
  if (raw === null || typeof raw !== "object") return out;
  const obj = raw as Record<string, unknown>;
  let count = 0;
  for (const [key, value] of Object.entries(obj)) {
    if (count >= MAX_SUMMARY_KEYS) break;
    if (!ALLOWED_SUMMARY_KEYS.has(key)) continue;
    if (typeof value !== "string") continue;
    const trimmed = value.trim().slice(0, MAX_SUMMARY_VALUE_LENGTH);
    if (trimmed !== "") {
      out[key] = trimmed;
      count += 1;
    }
  }
  return out;
}

/** Deterministic digest of the (non-sensitive) farm context triple. */
export function farmContextDigest(farmContext: {
  crop?: string;
  season?: string;
  location?: string;
}): string {
  const canonical = JSON.stringify({
    crop: farmContext.crop ?? "",
    season: farmContext.season ?? "",
    location: farmContext.location ?? "",
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/** Build the canonical payload from a filtered request input. */
export function buildCanonicalPayload(
  input: {
    eventType: ProvenanceRequestInput["eventType"];
    eventTimestamp: string;
    entitySummary: Record<string, string>;
    farmContext: { crop?: string; season?: string; location?: string };
  },
  recordCreatedAt: string
): CanonicalProvenancePayload {
  // Sorted summary keys for key-order-independent hashing.
  const sortedSummary: Record<string, string> = {};
  for (const key of Object.keys(input.entitySummary).sort()) {
    sortedSummary[key] = input.entitySummary[key];
  }
  return {
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    eventType: input.eventType,
    eventTimestamp: input.eventTimestamp,
    farmContextDigest: farmContextDigest(input.farmContext),
    entitySummary: sortedSummary,
    recordCreatedAt,
  };
}

/**
 * Deterministic SHA-256 over the canonical JSON. Sorting the summary keys
 * inside buildCanonicalPayload makes the hash independent of object key
 * order at the call site.
 */
export function hashCanonicalPayload(
  payload: CanonicalProvenancePayload
): string {
  const json = JSON.stringify(payload);
  return createHash("sha256").update(json, "utf8").digest("hex");
}
