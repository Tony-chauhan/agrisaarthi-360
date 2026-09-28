"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFarmProfile } from "@/lib/farm-context";

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
  now: { label: "Now", tone: "danger" as const },
  today: { label: "Today", tone: "warning" as const },
  "this-week": { label: "This week", tone: "neutral" as const },
};

export function TodaysActionsCard() {
  const {
    profile,
    isProfileEmpty,
    latestHealthCheck,
    latestOperation,
    latestAssistantInteraction,
  } = useFarmProfile();

  const actions: ActionItem[] = [];

  /* 1 — Profile is the foundation of every other feature. */
  if (isProfileEmpty) {
    actions.push({
      id: "profile",
      title: "Set up your farm profile",
      detail: "Name, location and size unlock every other feature.",
      href: "/farm-profile",
      cta: "Start now",
      priority: "now",
    });
  }

  /* 2 — Crop decision connects everything downstream. */
  if (!profile.selectedCrop) {
    actions.push({
      id: "crop",
      title: "Choose what to grow",
      detail: "Get transparent, rules-based crop suggestions for your land.",
      href: "/crop-advisor",
      cta: "Open advisor",
      priority: isProfileEmpty ? "this-week" : "now",
    });
  } else {
    actions.push({
      id: "crop-done",
      title: `${profile.selectedCrop} selected`,
      detail: "Advisor inputs are saved to your farm context.",
      href: "/crop-advisor",
      cta: "Review",
      priority: "this-week",
    });
  }

  /* 3 — Weather check is cheap and always available. */
  actions.push({
    id: "weather",
    title: "Review today's weather action",
    detail: profile.selectedCrop
      ? `Conditions and cautions for your ${profile.selectedCrop.toLowerCase()}.`
      : "Conditions and cautions for your farm location.",
    href: "/weather",
    cta: "Check",
    priority: "today",
  });

  /* 4 — Crop health check if not done this session. */
  if (!latestHealthCheck) {
    actions.push({
      id: "health",
      title: "Run a crop health check",
      detail: "Upload a leaf photo for a cautious visual assessment.",
      href: "/crop-health",
      cta: "Check now",
      priority: "today",
    });
  }

  /* 5 — Operation planning if not done this session. */
  if (!latestOperation) {
    actions.push({
      id: "operation",
      title: "Plan a farm operation",
      detail: "Find suitable machinery for sowing, spraying or harvesting.",
      href: "/operations",
      cta: "Plan",
      priority: "this-week",
    });
  }

  /* 6 — Assistant once the basics exist. */
  if (!latestAssistantInteraction && !isProfileEmpty) {
    actions.push({
      id: "assistant",
      title: "Ask AgriSaarthi about your farm",
      detail: "Context-aware answers: \"What should I do today?\"",
      href: "/assistant",
      cta: "Ask",
      priority: "this-week",
    });
  }

  /* All done — celebrate briefly, then point at the assistant. */
  if (actions.length === 0) {
    actions.push({
      id: "all-set",
      title: "You're all set",
      detail: "Ask the assistant what to do next on your farm.",
      href: "/assistant",
      cta: "Ask AgriSaarthi",
      priority: "today",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s actions</CardTitle>
        <Badge tone="accent">Your session checklist</Badge>
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
                    <Badge tone={meta.tone}>{meta.label}</Badge>
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
