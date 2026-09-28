"use client";

import { DataSourceTag } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/timeline/verification-badge";
import { VerifyRecordButton } from "@/components/timeline/verify-record-button";
import { eventTypeLabel } from "@/lib/timeline/event-service";
import type { TimelineEvent } from "@/lib/timeline/types";

/**
 * TimelineEventRow — one feed entry: date/time, event, source, status.
 */
export function TimelineEventRow({ event }: { event: TimelineEvent }) {
  const when = new Date(event.timestamp);
  const dateLabel = when.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
  const timeLabel = when.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="flex flex-col gap-1.5 rounded-xl border border-canopy-100 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-canopy-900">{event.title}</p>
        <p className="text-[11px] text-loam-500">
          {dateLabel} · {timeLabel}
        </p>
      </div>
      <p className="text-xs text-loam-600">{event.description}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-canopy-50 px-2 py-0.5 text-[11px] font-medium text-canopy-700">
          {eventTypeLabel(event.eventType)}
        </span>
        <DataSourceTag source={event.source} />
        <VerificationBadge status={event.verificationStatus} />
        {event.metadataHash ? (
          <span className="text-[11px] text-loam-400">
            hash {event.metadataHash.slice(0, 12)}…
          </span>
        ) : null}
      </div>
      <VerifyRecordButton event={event} />
    </li>
  );
}
