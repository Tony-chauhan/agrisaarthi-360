"use client";

import Link from "next/link";
import { MapPin, Ruler, CalendarDays, Sprout } from "lucide-react";
import { useFarmProfile } from "@/lib/farm-context";
import { DEMO_PROFILE } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";

/**
 * Sidebar farm card — "Current farm" block at the bottom of the nav.
 * Truthful labelling: the untouched starter profile is sample data.
 */
const SEASON_LABEL: Record<string, string> = {
  kharif: "Kharif",
  rabi: "Rabi",
  zaid: "Zaid",
};

export function SidebarFarmCard() {
  const { profile, isProfileEmpty } = useFarmProfile();

  const isSampleFarm =
    profile.farmerName === DEMO_PROFILE.farmerName &&
    profile.location === DEMO_PROFILE.location &&
    profile.farmSizeAcres === DEMO_PROFILE.farmSizeAcres &&
    profile.irrigation === DEMO_PROFILE.irrigation &&
    profile.soilType === DEMO_PROFILE.soilType &&
    profile.season === DEMO_PROFILE.season;

  if (isProfileEmpty) {
    return (
      <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Current farm
        </p>
        <p className="mt-1.5 text-sm text-white/70">
          No farm set —{" "}
          <Link
            href="/farm-profile"
            className="font-medium text-lime underline-offset-2 hover:underline"
          >
            create profile
          </Link>
        </p>
      </div>
    );
  }

  const rows = [
    { icon: MapPin, text: profile.location },
    { icon: Ruler, text: `${profile.farmSizeAcres} acres` },
    {
      icon: CalendarDays,
      text: `${SEASON_LABEL[profile.season] ?? profile.season} season`,
    },
    { icon: Sprout, text: profile.selectedCrop ?? "No crop selected" },
  ];

  return (
    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Current farm
        </p>
        <Badge
          tone={isSampleFarm ? "warning" : "success"}
          className={isSampleFarm ? "" : "border-lime/30 bg-lime/10 text-lime"}
        >
          {isSampleFarm ? "Sample farm data" : "Your farm data"}
        </Badge>
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-white">
        {profile.farmerName}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {rows.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-center gap-2 text-xs text-white/70"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-white/40" aria-hidden />
            <span className="truncate">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
