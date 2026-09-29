"use client";

import Link from "next/link";
import { Leaf, ArrowRight, TriangleAlert, ScanSearch } from "lucide-react";
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

/**
 * Dashboard "Latest crop health check" — state-driven.
 * No analysis yet → CTA to run one (no fake stale results).
 * After an analysis → compact summary with honest source labeling.
 */
export function CropHealthCard() {
  const { latestHealthCheck } = useFarmProfile();
  const { t } = useLanguage();

  if (!latestHealthCheck) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.featureCards.healthTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600">
            <ScanSearch className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-canopy-900">
              {t.featureCards.healthRunTitle}
            </p>
            <p className="mt-1 text-sm text-loam-600">
              {t.featureCards.healthRunBody}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-loam-500">{t.featureCards.healthFooter}</p>
          <Link
            href="/crop-health"
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
          >
            {t.featureCards.healthCheckNow}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const summary = latestHealthCheck;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.featureCards.healthLatestTitle}</CardTitle>
        <DataSourceTag source={summary.source} />
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600">
            <Leaf className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-canopy-900">
              {summary.crop}
            </p>
            <p className="mt-0.5 text-sm text-loam-700">
              {summary.possibleCondition}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="warning">
                {t.featureCards.healthLikelihood(summary.likelihood)}
              </Badge>
              {summary.isFallback ? (
                <Badge tone="warning">
                  {t.featureCards.healthFallbackBadge}
                </Badge>
              ) : null}
            </div>
            {summary.isFallback ? (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-harvest-600">
                <TriangleAlert
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden
                />
                {t.featureCards.healthFallbackNote}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">{t.featureCards.healthFooter}</p>
        <Link
          href="/crop-health"
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
        >
          {t.featureCards.healthViewAnalysis}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
