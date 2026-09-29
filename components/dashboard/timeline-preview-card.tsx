"use client";

import Link from "next/link";
import { History, ArrowRight, ShieldCheck } from "lucide-react";
import { useTimeline } from "@/lib/timeline/timeline-context";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DataSourceTag } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/timeline/verification-badge";
import { eventTypeLabel } from "@/lib/timeline/event-service";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * TimelinePreviewCard — dashboard entry to the Farm Timeline.
 * Shows the latest session events and verification status.
 */
export function TimelinePreviewCard() {
  const { events, eventCount } = useTimeline();
  const { t, lang } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.dashboard.timelineTitle}</CardTitle>
        <DataSourceTag source="rules-based" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {events.length === 0 ? (
          <p className="text-sm text-loam-600">
            {t.dashboard.timelineEmpty}
          </p>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-loam-500">
              {t.dashboard.timelineEventCount(eventCount)}
            </p>
            <ul className="flex flex-col gap-1.5">
              {events.slice(0, 3).map((event) => (
                <li
                  key={event.eventId}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-canopy-900">
                      {event.title}
                    </span>
                    <span className="text-xs text-loam-500">
                      {eventTypeLabel(event.eventType, lang)}
                    </span>
                  </span>
                  {event.verificationStatus !== "unverified" ? (
                    <VerificationBadge status={event.verificationStatus} />
                  ) : (
                    <History className="h-3.5 w-3.5 shrink-0 text-canopy-300" aria-hidden />
                  )}
                </li>
              ))}
            </ul>
            {events.some((e) => e.verificationStatus === "local-verified" || e.verificationStatus === "blockchain-verified") ? (
              <p className="flex items-center gap-1.5 text-xs text-canopy-700">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {t.dashboard.timelineVerifiedPresent}
              </p>
            ) : null}
          </>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">FARM → DECISION → ACTION → PLAN → PROOF</p>
        <Link
          href="/timeline"
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
        >
          {t.dashboard.timelineView}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
