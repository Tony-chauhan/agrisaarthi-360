"use client";

import { History } from "lucide-react";
import { useTimeline } from "@/lib/timeline/timeline-context";
import { TimelineEventRow } from "@/components/timeline/timeline-event-row";
import { EmptyState } from "@/components/ui/states";

/**
 * TimelineFeed — chronological event feed (newest first).
 * Events come only from actual application actions; the empty state is
 * honest ("No farm activity yet").
 */
export function TimelineFeed({ compact = false }: { compact?: boolean }) {
  const { events } = useTimeline();

  if (events.length === 0) {
    return (
      <EmptyState
        title="No farm activity yet"
        description="As you use the app — selecting a crop, checking weather, analyzing crop health, planning tasks and requesting operations — each action appears here in order."
      />
    );
  }

  const visible = compact ? events.slice(0, 3) : events;

  return (
    <ol aria-label="Farm timeline — newest first" className="flex flex-col gap-2.5">
      {visible.map((event) => (
        <TimelineEventRow key={event.eventId} event={event} />
      ))}
      {compact && events.length > 3 ? (
        <li className="text-center text-xs text-loam-500">
          {events.length - 3} earlier event{events.length - 3 === 1 ? "" : "s"} this session
        </li>
      ) : null}
    </ol>
  );
}
