"use client";

import { MapPin, CalendarDays } from "lucide-react";
import { useFarmProfile } from "@/lib/farm-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { Badge } from "@/components/ui/badge";

/**
 * Compact context line for the workspace topbar — real provider state,
 * honest sample labeling.
 */
export function FarmSummaryStatusLine() {
  const { profile, isProfileEmpty } = useFarmProfile();
  const { t } = useLanguage();

  if (isProfileEmpty) {
    return <Badge tone="warning">{t.chrome.setupPrompt}</Badge>;
  }

  return (
    <p className="flex items-center gap-2 text-sm text-loam-600">
      <MapPin className="h-3.5 w-3.5 text-terracotta-600" aria-hidden />
      <span className="font-medium text-canopy-900">{profile.location}</span>
      <span aria-hidden className="text-loam-300">·</span>
      <CalendarDays className="h-3.5 w-3.5 text-canopy-600" aria-hidden />
      {t.common.seasons[profile.season]}
      {profile.selectedCrop ? (
        <>
          <span aria-hidden className="text-loam-300">·</span>
          <span className="font-medium text-canopy-900">{profile.selectedCrop}</span>
        </>
      ) : null}
    </p>
  );
}
