"use client";

import { DataSourceTag } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/timeline/verification-badge";
import { VerifyRecordButton } from "@/components/timeline/verify-record-button";
import { eventTypeLabel } from "@/lib/timeline/event-service";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TimelineEvent } from "@/lib/timeline/types";

/**
 * TimelineEventRow — one feed entry: date/time, event, source, status.
 */
export function TimelineEventRow({ event }: { event: TimelineEvent }) {
  const { lang } = useLanguage();
  const when = new Date(event.timestamp);
  const locale = lang === "hi" ? "hi-IN" : undefined;
  const dateLabel = when.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
  const timeLabel = when.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="flex flex-col gap-1.5 rounded-xl border border-canopy-100 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-canopy-900">{event.title}</p>
        <p className="text-xs text-loam-500">
          {dateLabel} · {timeLabel}
        </p>
      </div>
      <p className="text-xs text-loam-600">{event.description}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-canopy-50 px-2 py-0.5 text-xs font-medium text-canopy-700">
          {eventTypeLabel(event.eventType, lang)}
        </span>
        <DataSourceTag source={event.source} />
        <VerificationBadge status={event.verificationStatus} />
        {event.metadataHash ? (
          <span className="text-xs text-loam-400">
            hash {event.metadataHash.slice(0, 12)}…
          </span>
        ) : null}
      </div>
      <VerifyRecordButton event={event} />
    </li>
  );
}
