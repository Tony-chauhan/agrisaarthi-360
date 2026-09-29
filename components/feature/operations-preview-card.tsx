"use client";

import Link from "next/link";
import { Tractor, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DataSourceTag } from "@/components/ui/badge";
import { useFarmProfile } from "@/lib/farm-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Dictionary } from "@/lib/i18n/en";

/**
 * OperationsPreviewCard — state-driven dashboard entry to the farm
 * operations workflow. Shows the latest operation summary when a request
 * exists; otherwise invites planning a new operation.
 * Availability depends on the connected service dataset.
 */

function StatusLine({
  status,
  response,
  t,
}: {
  status: "idle" | "reviewing" | "submitted" | "provider_response";
  response?: "accepted" | "unavailable";
  t: Dictionary;
}) {
  if (status === "submitted") {
    return (
      <span className="font-medium text-canopy-800">
        {t.featureCards.opsSubmitted}
      </span>
    );
  }
  if (status === "provider_response" && response === "accepted") {
    return (
      <span className="flex items-center gap-1.5 font-medium text-canopy-800">
        <CheckCircle2 className="h-3.5 w-3.5 text-sprout-500" aria-hidden />
        {t.featureCards.opsAccepted}
      </span>
    );
  }
  if (status === "provider_response" && response === "unavailable") {
    return (
      <span className="font-medium text-harvest-600">
        {t.featureCards.opsProviderUnavailable}
      </span>
    );
  }
  return (
    <span className="font-medium text-canopy-800">
      {t.featureCards.opsInProgress}
    </span>
  );
}

export function OperationsPreviewCard() {
  const { latestOperation, profile } = useFarmProfile();
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.featureCards.opsTitle}</CardTitle>
        <DataSourceTag source="demo" />
      </CardHeader>
      <CardContent>
        {latestOperation ? (
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600">
              <Tractor className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-canopy-900">
                {profile.selectedCrop
                  ? `${profile.selectedCrop} — ${latestOperation.operationName.toLowerCase()}`
                  : latestOperation.operationName}
              </p>
              <p className="mt-1 text-sm text-loam-600">
                {latestOperation.machineName} · {latestOperation.providerName}
              </p>
              <p className="mt-1.5 text-xs">
                <StatusLine
                  status={latestOperation.status}
                  response={latestOperation.response}
                  t={t}
                />
              </p>
              <p className="mt-1 text-xs text-loam-500">
                {t.featureCards.opsAvailabilityNote}.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600">
              <Play className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-canopy-900">
                {t.featureCards.opsPlanTitle}
              </p>
              <p className="mt-1 text-sm text-loam-600">
                {t.featureCards.opsPlanBody}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">
          {t.featureCards.opsAvailabilityNote}
        </p>
        <Link
          href="/operations"
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
        >
          {latestOperation ? t.featureCards.opsViewStatus : t.featureCards.opsOpenWorkflow}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
