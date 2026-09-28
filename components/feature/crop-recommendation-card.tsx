"use client";

import Link from "next/link";
import { Droplets, CalendarDays, ArrowRight, ClipboardList } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DataSourceTag, Badge } from "@/components/ui/badge";
import { useFarmProfile } from "@/lib/farm-context";
import { recommendCrops } from "@/lib/crop-recommendation";
import type { CropAdvisorInputs } from "@/lib/types";

/**
 * Dashboard recommendation highlight — runs the live rules engine against
 * the current farm context. Replaces the Step 1 static demo card.
 */
export function CropRecommendationCard() {
  const { profile, isProfileEmpty } = useFarmProfile();

  if (isProfileEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended crop</CardTitle>
          <DataSourceTag source="rules-based" />
        </CardHeader>
        <CardContent className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600">
            <ClipboardList className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-canopy-900">
              Complete your farm profile first
            </p>
            <p className="mt-1 text-sm text-loam-600">
              The rules engine needs your location, size, soil, irrigation and
              season to generate matching crops.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-loam-500">Rules-based preview</p>
          <Link
            href="/farm-profile"
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
          >
            Open profile
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const inputs: CropAdvisorInputs = {
    location: profile.location,
    season: profile.season,
    farmSizeAcres: profile.farmSizeAcres,
    irrigation: profile.irrigation,
    soilType: profile.soilType,
  };
  const { recommendations } = recommendCrops(inputs);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended crop</CardTitle>
          <DataSourceTag source="rules-based" />
        </CardHeader>
        <CardContent>
          <p className="text-sm font-semibold text-canopy-900">
            No strong match for this profile yet
          </p>
          <p className="mt-1 text-sm text-loam-600">
            Try adjusting season, soil or irrigation in the Crop Advisor.
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-loam-500">Rules-based preview</p>
          <Link
            href="/crop-advisor"
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
          >
            Open advisor
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const top = recommendations[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended crop</CardTitle>
        <DataSourceTag source={top.source} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="font-display text-2xl font-semibold text-canopy-950">
            {top.crop}
          </p>
          {profile.selectedCrop === top.crop ? (
            <Badge tone="success">Selected</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-loam-700">
          {top.whyItMatches[0]}
          {top.whyItMatches.length > 1
            ? ` — plus ${top.whyItMatches.length - 1} more matching reasons.`
            : "."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-50 px-3 py-1.5 text-xs font-medium text-canopy-800">
            <Droplets className="h-3.5 w-3.5" aria-hidden />
            {top.waterRequirement} water
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-50 px-3 py-1.5 text-xs font-medium text-canopy-800">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {top.durationDays}
          </span>
          <Badge tone="success">{top.suitability} suitability</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">
          Rules-based — from your current farm context
        </p>
        <Link
          href="/crop-advisor"
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
        >
          Open advisor
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
