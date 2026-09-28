import type { DataSource } from "@/lib/types";

/**
 * FARM TIMELINE CONTRACT (P1.3)
 *
 * Events are emitted ONLY from actual application actions — history is
 * never manufactured. Events are session-scoped and lightweight (summaries
 * only, same pattern as P0 dashboard cards: no images, no raw payloads).
 */

export type TimelineEventType =
  | "CROP_SELECTED"
  | "WEATHER_ACTION"
  | "HEALTH_CHECK"
  | "TASK_CREATED"
  | "TASK_COMPLETED"
  | "OPERATION_REQUESTED"
  | "OPERATION_COMPLETED"
  | "FARM_RECORD_CREATED"
  | "PROVENANCE_VERIFIED";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "local-verified"
  | "blockchain-verified"
  | "unavailable";

export type TimelineEntityType =
  | "crop"
  | "weather"
  | "health"
  | "task"
  | "operation"
  | "record";

export interface TimelineEvent {
  eventId: string;
  farmId: string;
  eventType: TimelineEventType;
  /** ISO timestamp of the action. */
  timestamp: string;
  title: string;
  description: string;
  source: DataSource;
  entityType: TimelineEntityType;
  /** Dedupe key together with entityType + eventType. */
  entityId: string;
  verificationStatus: VerificationStatus;
  /** Set after a provenance record is created for this event. */
  metadataHash?: string;
}

/** Input used to emit a new event from an actual application action. */
export interface TimelineEventInput {
  eventType: TimelineEventType;
  title: string;
  description: string;
  source: DataSource;
  entityType: TimelineEntityType;
  entityId: string;
}

/**
 * Events eligible for blockchain provenance. Minor UI interactions are
 * deliberately excluded — only important, durable farm events qualify.
 */
export const PROVENANCE_ELIGIBLE_EVENT_TYPES: TimelineEventType[] = [
  "HEALTH_CHECK",
  "OPERATION_COMPLETED",
  "TASK_COMPLETED",
  "FARM_RECORD_CREATED",
];

export function isProvenanceEligible(eventType: TimelineEventType): boolean {
  return PROVENANCE_ELIGIBLE_EVENT_TYPES.includes(eventType);
}
