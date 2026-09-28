"use client";

import { MapPin, CalendarDays } from "lucide-react";
import { useFarmProfile } from "@/lib/farm-context";
import { Badge } from "@/components/ui/badge";

const SEASON_LABEL: Record<string, string> = {
  kharif: "Kharif",
  rabi: "Rabi",
  zaid: "Zaid",
};

/**
 * Compact context line for the workspace topbar — real provider state,
 * honest sample labeling.
 */
export function FarmSummaryStatusLine() {
  const { profile, isProfileEmpty } = useFarmProfile();

  if (isProfileEmpty) {
    return <Badge tone="warning">Set up your farm to unlock guidance</Badge>;
  }

  return (
    <p className="flex items-center gap-2 text-sm text-loam-600">
      <MapPin className="h-3.5 w-3.5 text-terracotta-600" aria-hidden />
      <span className="font-medium text-canopy-900">{profile.location}</span>
      <span aria-hidden className="text-loam-300">·</span>
      <CalendarDays className="h-3.5 w-3.5 text-canopy-600" aria-hidden />
      {SEASON_LABEL[profile.season] ?? profile.season}
      {profile.selectedCrop ? (
        <>
          <span aria-hidden className="text-loam-300">·</span>
          <span className="font-medium text-canopy-900">{profile.selectedCrop}</span>
        </>
      ) : null}
    </p>
  );
}
