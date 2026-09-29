"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFarmProfile } from "@/lib/farm-context";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * Today's actions — a live, prioritized checklist derived from ACTUAL
 * session state (profile → crop → operation → health → assistant).
 * Never shows invented context: only what the farmer has actually done
 * (or not done) in this session. Each item links to its next step.
 */

interface ActionItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  priority: "now" | "today" | "this-week";
}

const PRIORITY_META = {
  now: { tone: "danger" as const },
  today: { tone: "warning" as const },
  "this-week": { tone: "neutral" as const },
};

export function TodaysActionsCard() {
  const {
    profile,
    isProfileEmpty,
    latestHealthCheck,
    latestOperation,
    latestAssistantInteraction,
  } = useFarmProfile();
  const { t } = useLanguage();

  const actions: ActionItem[] = [];

  /* 1 — Profile is the foundation of every other feature. */
  if (isProfileEmpty) {
    actions.push({
      id: "profile",
      title: t.dashboard.actionProfileTitle,
      detail: t.dashboard.actionProfileDetail,
      href: "/farm-profile",
      cta: t.dashboard.actionProfileCta,
      priority: "now",
    });
  }

  /* 2 — Crop decision connects everything downstream. */
  if (!profile.selectedCrop) {
    actions.push({
      id: "crop",
      title: t.dashboard.actionCropTitle,
      detail: t.dashboard.actionCropDetail,
      href: "/crop-advisor",
      cta: t.dashboard.actionCropCta,
      priority: isProfileEmpty ? "this-week" : "now",
    });
  } else {
    actions.push({
      id: "crop-done",
      title: t.dashboard.actionCropDoneTitle(profile.selectedCrop),
      detail: t.dashboard.actionCropDoneDetail,
      href: "/crop-advisor",
      cta: t.dashboard.actionCropDoneCta,
      priority: "this-week",
    });
  }

  /* 3 — Weather check is cheap and always available. */
  actions.push({
    id: "weather",
    title: t.dashboard.actionWeatherTitle,
    detail: profile.selectedCrop
      ? t.dashboard.actionWeatherDetailCrop(profile.selectedCrop)
      : t.dashboard.actionWeatherDetailGeneric,
    href: "/weather",
    cta: t.dashboard.actionWeatherCta,
    priority: "today",
  });

  /* 4 — Crop health check if not done this session. */
  if (!latestHealthCheck) {
    actions.push({
      id: "health",
      title: t.dashboard.actionHealthTitle,
      detail: t.dashboard.actionHealthDetail,
      href: "/crop-health",
      cta: t.dashboard.actionHealthCta,
      priority: "today",
    });
  }

  /* 5 — Operation planning if not done this session. */
  if (!latestOperation) {
    actions.push({
      id: "operation",
      title: t.dashboard.actionOperationTitle,
      detail: t.dashboard.actionOperationDetail,
      href: "/operations",
      cta: t.dashboard.actionOperationCta,
      priority: "this-week",
    });
  }

  /* 6 — Assistant once the basics exist. */
  if (!latestAssistantInteraction && !isProfileEmpty) {
    actions.push({
      id: "assistant",
      title: t.dashboard.actionAssistantTitle,
      detail: t.dashboard.actionAssistantDetail,
      href: "/assistant",
      cta: t.dashboard.actionAssistantCta,
      priority: "this-week",
    });
  }

  /* All done — celebrate briefly, then point at the assistant. */
  if (actions.length === 0) {
    actions.push({
      id: "all-set",
      title: t.dashboard.actionAllSetTitle,
      detail: t.dashboard.actionAllSetDetail,
      href: "/assistant",
      cta: t.dashboard.actionAllSetCta,
      priority: "today",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.dashboard.todaysActions}</CardTitle>
        <Badge tone="accent">{t.dashboard.sessionChecklist}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {actions.map((action) => {
          const meta = PRIORITY_META[action.priority];
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-canopy-100 px-4 py-3 transition-colors hover:border-canopy-300 hover:bg-canopy-50/60"
            >
              <span className="flex min-w-0 items-start gap-2.5">
                {action.id === "crop-done" ? (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-sprout-500"
                    aria-hidden
                  />
                ) : (
                  <ClipboardList
                    className="mt-0.5 h-4 w-4 shrink-0 text-canopy-500"
                    aria-hidden
                  />
                )}
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-canopy-900">
                      {action.title}
                    </span>
                    <Badge tone={meta.tone}>
                      {action.priority === "now"
                        ? t.common.now
                        : action.priority === "today"
                          ? t.common.today
                          : t.common.thisWeek}
                    </Badge>
                  </span>
                  <span className="mt-0.5 block text-sm text-loam-600">
                    {action.detail}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-terracotta-600">
                {action.cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
