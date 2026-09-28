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

/**
 * Dashboard "Latest crop health check" — state-driven.
 * No analysis yet → CTA to run one (no fake stale results).
 * After an analysis → compact summary with honest source labeling.
 */
export function CropHealthCard() {
  const { latestHealthCheck } = useFarmProfile();

  if (!latestHealthCheck) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crop health</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600">
            <ScanSearch className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-canopy-900">
              Run a crop health check
            </p>
            <p className="mt-1 text-sm text-loam-600">
              Upload a leaf photo for a cautious AI-assisted visual assessment
              with safe fallback guidance.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-loam-500">Decision support, not a diagnosis</p>
          <Link
            href="/crop-health"
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
          >
            Check now
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
        <CardTitle>Latest crop health check</CardTitle>
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
                Visual likelihood: {summary.likelihood}
              </Badge>
              {summary.isFallback ? (
                <Badge tone="warning">Fallback guidance</Badge>
              ) : null}
            </div>
            {summary.isFallback ? (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-harvest-600">
                <TriangleAlert
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden
                />
                Live model was unavailable — this is fallback guidance, not
                an AI model result.
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">Decision support, not a diagnosis</p>
        <Link
          href="/crop-health"
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
        >
          View analysis
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
