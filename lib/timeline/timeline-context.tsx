"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  TimelineEvent,
  TimelineEventInput,
  VerificationStatus,
} from "@/lib/timeline/types";
import {
  applyVerificationStatus,
  buildTimelineEvent,
  insertEvent,
} from "@/lib/timeline/event-service";
import { useFarmProfile } from "@/lib/farm-context";

/**
 * TIMELINE PROVIDER (P1.3)
 *
 * Session-scoped event feed — the single write path for timeline events.
 * Mounted inside FarmProvider (see farm-context composition) so every P0
 * feature can emit events from actual actions. resetSession clears it.
 */

interface TimelineContextValue {
  events: TimelineEvent[];
  /** Emit an event from an actual application action (deduped, ordered). */
  emitEvent: (input: TimelineEventInput) => TimelineEvent;
  /** Update verification status for all events of an entity. */
  setVerificationStatus: (
    entityId: string,
    status: VerificationStatus,
    metadataHash?: string
  ) => void;
  /** Number of events (handy for previews/badges). */
  eventCount: number;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const { profile, sessionEpoch } = useFarmProfile();
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  /* resetSession bumps sessionEpoch → clear the session feed. */
  useEffect(() => {
    if (sessionEpoch > 0) setEvents([]);
  }, [sessionEpoch]);

  const farmId = useMemo(() => {
    const loc = profile.location.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return loc ? `farm-${loc}` : "farm-default";
  }, [profile.location]);

  const emitEvent = useCallback(
    (input: TimelineEventInput): TimelineEvent => {
      const nowIso = new Date().toISOString();
      const event = buildTimelineEvent(farmId, input, nowIso);
      setEvents((prev) => insertEvent(prev, event));
      return event;
    },
    [farmId]
  );

  const setVerificationStatus = useCallback(
    (entityId: string, status: VerificationStatus, metadataHash?: string) => {
      setEvents((prev) => applyVerificationStatus(prev, entityId, status, metadataHash));
    },
    []
  );

  const value = useMemo(
    () => ({
      events,
      emitEvent,
      setVerificationStatus,
      eventCount: events.length,
    }),
    [events, emitEvent, setVerificationStatus]
  );

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

export function useTimeline(): TimelineContextValue {
  const ctx = useContext(TimelineContext);
  if (!ctx) {
    throw new Error("useTimeline must be used inside <TimelineProvider>");
  }
  return ctx;
}
