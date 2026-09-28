"use client";

import { useState } from "react";
import {
  Droplets,
  CalendarDays,
  ChevronDown,
  TriangleAlert,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge, DataSourceTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EngineCropRecommendation, Suitability } from "@/lib/types";
import { CHECK_BEFORE_PLANTING } from "@/lib/crop-knowledge";

const SUITABILITY_TONE: Record<
  Suitability,
  "success" | "warning" | "neutral"
> = {
  high: "success",
  moderate: "warning",
  exploratory: "neutral",
};

/**
 * CropResultCard — communicates WHY a crop appeared, without drowning
 * the farmer in scoring detail (progressive disclosure for the breakdown).
 */
export function CropResultCard({
  recommendation,
  isSelected,
  onSelect,
}: {
  recommendation: EngineCropRecommendation;
  isSelected: boolean;
  onSelect: (crop: string) => void;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const rec = recommendation;

  const basisRows = [
    { label: "Season", detail: rec.scoreBasis.season },
    { label: "Soil", detail: rec.scoreBasis.soil },
    { label: "Irrigation", detail: rec.scoreBasis.irrigation },
    { label: "Location", detail: rec.scoreBasis.location },
    { label: "Farm size", detail: rec.scoreBasis.farmSize },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="font-display text-xl">{rec.crop}</CardTitle>
          <p className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone={SUITABILITY_TONE[rec.suitability]}>
              Suitability: {rec.suitability === "high" ? "High" : rec.suitability === "moderate" ? "Moderate" : "Exploratory"}
            </Badge>
            <span className="text-xs text-loam-500">
              Decision basis: Season · Soil · Irrigation · Location · Farm size
            </span>
          </p>
        </div>
        <DataSourceTag source={rec.source} />
      </CardHeader>

      <CardContent>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-loam-500">
          Why it matches your profile
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {rec.whyItMatches.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-2 text-sm text-loam-700"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-sprout-500"
                aria-hidden
              />
              {reason}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-50 px-3 py-1.5 text-xs font-medium text-canopy-800">
            <Droplets className="h-3.5 w-3.5" aria-hidden />
            {rec.waterRequirement} water
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-50 px-3 py-1.5 text-xs font-medium text-canopy-800">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {rec.durationDays}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-harvest-500/10 px-4 py-3 text-sm text-harvest-600">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">Check before planting: </span>
            {CHECK_BEFORE_PLANTING}
          </span>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-loam-50 px-4 py-3 text-sm text-loam-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-harvest-600" aria-hidden />
          <span>
            <span className="font-semibold text-canopy-900">Caveat: </span>
            {rec.caveat}
          </span>
        </div>

        {/* Progressive disclosure — full scoring basis on demand */}
        <button
          type="button"
          onClick={() => setShowBreakdown((v) => !v)}
          aria-expanded={showBreakdown}
          className="mt-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-canopy-700 transition-colors hover:text-canopy-900"
        >
          How this score was calculated
          <ChevronDown
            className={
              "h-4 w-4 transition-transform " +
              (showBreakdown ? "rotate-180" : "")
            }
            aria-hidden
          />
        </button>
        {showBreakdown ? (
          <dl className="mt-2 flex flex-col gap-1.5 rounded-xl border border-canopy-100 bg-canopy-50/50 px-4 py-3 text-sm">
            {basisRows.map(({ label, detail }) => (
              <div
                key={label}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
              >
                <dt className="font-semibold text-canopy-900">
                  {label}{" "}
                  <span className="font-normal text-loam-500">
                    ({detail.points}/{detail.max})
                  </span>
                </dt>
                <dd className="w-full text-xs text-loam-600 sm:w-auto sm:max-w-md sm:text-right">
                  {detail.basis}
                </dd>
              </div>
            ))}
            <p className="mt-1 border-t border-canopy-100 pt-2 text-xs text-loam-500">
              <ListChecks className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              Decision engine — transparent scoring weights, not scientific
              accuracy. The land photo is never used for scoring.
            </p>
          </dl>
        ) : null}
      </CardContent>

      <CardFooter>
        <p className="text-xs text-loam-500">
          Recommended crop based on the current profile — not &ldquo;the
          best&rdquo; crop.
        </p>
        {isSelected ? (
          <Badge tone="success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Selected
          </Badge>
        ) : (
          <Button variant="primary" size="sm" onClick={() => onSelect(rec.crop)}>
            Select {rec.crop.split(" ")[0]}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
