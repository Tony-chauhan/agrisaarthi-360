import type {
  TimelineEvent,
  TimelineEventInput,
  TimelineEventType,
} from "@/lib/timeline/types";
import type { Lang } from "@/lib/i18n/types";
import { t as dict } from "@/lib/i18n";

/**
 * TIMELINE EVENT SERVICE (P1.3)
 *
 * Pure event helpers: dedupe, ordering, and event construction. The
 * TimelineProvider (timeline-context.tsx) owns the session event array;
 * these functions keep it deterministic and testable without React.
 *
 * Events come ONLY from actual application actions — nothing here
 * manufactures history.
 */

/** Maximum events retained in the session feed (oldest dropped). */
export const MAX_TIMELINE_EVENTS = 200;

/** Deterministic event id from the event identity. */
function eventIdFor(
  farmId: string,
  input: Pick<TimelineEventInput, "entityType" | "entityId" | "eventType">,
  timestamp: string
): string {
  const raw = [farmId, input.entityType, input.entityId, input.eventType].join("|");
  const safe = raw.toLowerCase().replace(/[^a-z0-9|]+/g, "-").replace(/-+/g, "-");
  return `evt-${safe}-${timestamp.slice(0, 19).replace(/[:T]/g, "")}`;
}

/** Build a TimelineEvent from an actual action. */
export function buildTimelineEvent(
  farmId: string,
  input: TimelineEventInput,
  nowIso: string
): TimelineEvent {
  return {
    eventId: eventIdFor(farmId, input, nowIso),
    farmId,
    eventType: input.eventType,
    timestamp: nowIso,
    title: input.title,
    description: input.description,
    source: input.source,
    entityType: input.entityType,
    entityId: input.entityId,
    verificationStatus: "unverified",
  };
}

/**
 * Dedupe rule: one event per (eventType, entityType, entityId) —
 * EXCEPT TASK_COMPLETED / HEALTH_CHECK, which can legitimately recur
 * for different task/analysis instances (entityId already distinguishes).
 */
export function eventKeyOf(event: TimelineEvent): string {
  return `${event.eventType}|${event.entityType}|${event.entityId}`;
}

/**
 * Insert an event into the feed: dedupe (same key → latest wins with
 * refreshed timestamp), sort newest-first, cap the feed size.
 * Returns a NEW array (pure).
 */
export function insertEvent(
  events: TimelineEvent[],
  event: TimelineEvent
): TimelineEvent[] {
  const key = eventKeyOf(event);
  const filtered = events.filter((e) => eventKeyOf(e) !== key);
  const next = [...filtered, event];
  next.sort(
    (a, b) => b.timestamp.localeCompare(a.timestamp) || a.eventId.localeCompare(b.eventId)
  );
  return next.slice(0, MAX_TIMELINE_EVENTS);
}

/**
 * Update the verification status of every event with the matching
 * entityId (the provenance record carries the entityId of its event).
 * Returns a NEW array (pure).
 */
export function applyVerificationStatus(
  events: TimelineEvent[],
  entityId: string,
  status: TimelineEvent["verificationStatus"],
  metadataHash?: string
): TimelineEvent[] {
  return events.map((e) =>
    e.entityId === entityId
      ? {
          ...e,
          verificationStatus: status,
          metadataHash: metadataHash ?? e.metadataHash,
        }
      : e
  );
}

/** True when this event type may start the provenance flow. */
export function canVerify(event: TimelineEvent): boolean {
  const eligible: TimelineEventType[] = [
    "HEALTH_CHECK",
    "OPERATION_COMPLETED",
    "TASK_COMPLETED",
    "FARM_RECORD_CREATED",
  ];
  return (
    eligible.includes(event.eventType) &&
    event.verificationStatus === "unverified"
  );
}

/**
 * UI title for an event type (consistent across feed + previews).
 * English remains the default (deterministic for verify suites); pass
 * `lang` to render the localized label.
 */
export function eventTypeLabel(
  type: TimelineEventType,
  lang: Lang = "en"
): string {
  if (lang === "hi") return dict("hi").timeline.eventType[type];
  switch (type) {
    case "CROP_SELECTED":
      return "Crop selected";
    case "WEATHER_ACTION":
      return "Weather action generated";
    case "HEALTH_CHECK":
      return "Crop health analyzed";
    case "TASK_CREATED":
      return "Farm task created";
    case "TASK_COMPLETED":
      return "Farm task completed";
    case "OPERATION_REQUESTED":
      return "Operation requested";
    case "OPERATION_COMPLETED":
      return "Operation accepted";
    case "FARM_RECORD_CREATED":
      return "Farm record created";
    case "PROVENANCE_VERIFIED":
      return "Provenance verified";
  }
}
