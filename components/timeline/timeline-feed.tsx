"use client";

import { History } from "lucide-react";
import { useTimeline } from "@/lib/timeline/timeline-context";
import { TimelineEventRow } from "@/components/timeline/timeline-event-row";
import { EmptyState } from "@/components/ui/states";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * TimelineFeed — chronological event feed (newest first).
 * Events come only from actual application actions; the empty state is
 * honest ("No farm activity yet").
 */
export function TimelineFeed({ compact = false }: { compact?: boolean }) {
  const { events } = useTimeline();
  const { t } = useLanguage();

  if (events.length === 0) {
    return (
      <EmptyState
        title={t.timeline.emptyTitle}
        description={t.timeline.emptyBody}
      />
    );
  }

  const visible = compact ? events.slice(0, 3) : events;

  return (
    <ol aria-label={t.timeline.feedAria} className="flex flex-col gap-2.5">
      {visible.map((event) => (
        <TimelineEventRow key={event.eventId} event={event} />
      ))}
      {compact && events.length > 3 ? (
        <li className="text-center text-xs text-loam-500">
          {t.timeline.earlierEvents(events.length - 3)}
        </li>
      ) : null}
    </ol>
  );
}
