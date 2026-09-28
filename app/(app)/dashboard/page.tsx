"use client";

import { FarmSummaryHeader } from "@/components/dashboard/farm-summary-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { TodaysActionsCard } from "@/components/dashboard/todays-actions-card";
import { PlannerPreviewCard } from "@/components/dashboard/planner-preview-card";
import { TimelinePreviewCard } from "@/components/dashboard/timeline-preview-card";
import { WeatherActionCard } from "@/components/feature/weather-action-card";
import { CropHealthCard } from "@/components/feature/crop-health-card";
import { OperationsPreviewCard } from "@/components/feature/operations-preview-card";
import { AssistantEntryCard } from "@/components/feature/assistant-entry-card";
import { CropRecommendationCard } from "@/components/feature/crop-recommendation-card";
import { useFarmProfile } from "@/lib/farm-context";

/**
 * DASHBOARD — one calm place connecting everything.
 * Structure: farm summary → KPI status row → today's guidance (the main
 * working section) → plan + context columns. Every card runs on the
 * existing providers; nothing is duplicated or fabricated.
 */
export default function DashboardPage() {
  const { isProfileEmpty } = useFarmProfile();

  return (
    <div className="flex flex-col gap-6">
      <FarmSummaryHeader />

      <KpiCards />

      {/* Main working area */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section aria-labelledby="guidance-heading" className="dashboard-enter">
            <h2
              id="guidance-heading"
              className="font-display text-xl font-semibold tracking-tight text-canopy-950"
            >
              Today&apos;s farm guidance
            </h2>
            <p className="mt-1 text-sm text-loam-600">
              Existing workflows, in the order they matter today.
            </p>
          </section>
          <TodaysActionsCard />
          <WeatherActionCard />
          {!isProfileEmpty ? <CropRecommendationCard /> : null}
          <CropHealthCard />
          <OperationsPreviewCard />
        </div>

        <div className="flex flex-col gap-6">
          <PlannerPreviewCard />
          <TimelinePreviewCard />
          <AssistantEntryCard />
        </div>
      </div>
    </div>
  );
}
