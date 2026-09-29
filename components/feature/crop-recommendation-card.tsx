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
import { useLanguage } from "@/lib/i18n/language-context";
import { recommendCrops } from "@/lib/crop-recommendation";
import type { CropAdvisorInputs } from "@/lib/types";

/**
 * Dashboard recommendation highlight — runs the live rules engine against
 * the current farm context. Replaces the Step 1 static demo card.
 */
export function CropRecommendationCard() {
  const { profile, isProfileEmpty } = useFarmProfile();
  const { t, lang } = useLanguage();

  if (isProfileEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.featureCards.recTitle}</CardTitle>
          <DataSourceTag source="rules-based" />
        </CardHeader>
        <CardContent className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600">
            <ClipboardList className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-canopy-900">
              {t.featureCards.recSetupTitle}
            </p>
            <p className="mt-1 text-sm text-loam-600">
              {t.featureCards.recSetupBody}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-loam-500">{t.featureCards.recSetupFooter}</p>
          <Link
            href="/farm-profile"
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
          >
            {t.featureCards.recOpenProfile}
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
  const { recommendations } = recommendCrops(inputs, lang);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.featureCards.recTitle}</CardTitle>
          <DataSourceTag source="rules-based" />
        </CardHeader>
        <CardContent>
          <p className="text-sm font-semibold text-canopy-900">
            {t.featureCards.recNoMatchTitle}
          </p>
          <p className="mt-1 text-sm text-loam-600">
            {t.featureCards.recNoMatchBody}
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-loam-500">{t.featureCards.recSetupFooter}</p>
          <Link
            href="/crop-advisor"
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
          >
            {t.featureCards.recOpenAdvisor}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const top = recommendations[0];
  const cropName =
    (lang === "hi"
      ? (t.cropLib.cropNames as Record<string, string>)[top.crop]
      : undefined) ?? top.crop;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.featureCards.recTitle}</CardTitle>
        <DataSourceTag source={top.source} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="font-display text-2xl font-semibold text-canopy-950">
            {cropName}
          </p>
          {profile.selectedCrop === top.crop ? (
            <Badge tone="success">{t.featureCards.recSelected}</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-loam-700">
          {top.whyItMatches[0]}
          {top.whyItMatches.length > 1
            ? t.featureCards.recMoreReasons(top.whyItMatches.length - 1)
            : "."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-50 px-3 py-1.5 text-xs font-medium text-canopy-800">
            <Droplets className="h-3.5 w-3.5" aria-hidden />
            {t.featureCards.waterLabel(
              t.featureCards.water[top.waterRequirement],
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-50 px-3 py-1.5 text-xs font-medium text-canopy-800">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {top.durationDays}
          </span>
          <Badge tone="success">
            {t.featureCards.suitabilityBadge(t.featureCards.suitability[top.suitability])}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">
          {t.featureCards.recFooter}
        </p>
        <Link
          href="/crop-advisor"
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
        >
          {t.featureCards.recOpenAdvisor}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
