"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { FarmProfile, HealthCheckSummary } from "@/lib/types";
import type { LatestOperationSummary } from "@/lib/operations/types";
import type { LatestAssistantInteraction } from "@/lib/assistant/types";
import { DEMO_PROFILE } from "@/lib/demo-data";

/**
 * Farm context provider — the "one connected farm context" USP.
 * Single source of truth for farm state across all pages.
 * Persistence (localStorage/database) arrives in a later step.
 */

interface FarmContextValue {
  profile: FarmProfile;
  /** Merge a partial patch into the farm profile. */
  updateProfile: (patch: Partial<FarmProfile>) => void;
  /** Set/clear the selected crop without touching the rest of the profile. */
  setSelectedCrop: (crop: string | undefined) => void;
  /** Return to the sample farm profile (handy between sessions; no persistence yet). */
  resetFarmProfile: () => void;
  /** Full session reset — clears profile, crop and all summaries. */
  resetSession: () => void;
  /** True when name/location/size (the required core) are missing. */
  isProfileEmpty: boolean;
  /** True when the profile has everything the decision engine needs. */
  hasCompleteProfile: boolean;
  /** Latest crop-health summary for the dashboard (lightweight, no images). */
  latestHealthCheck: HealthCheckSummary | null;
  setLatestHealthCheck: (summary: HealthCheckSummary | null) => void;
  /** Latest operation summary for the dashboard (no machinery datasets). */
  latestOperation: LatestOperationSummary | null;
  setLatestOperation: (summary: LatestOperationSummary | null) => void;
  /** Latest assistant interaction summary (question + preview, no history). */
  latestAssistantInteraction: LatestAssistantInteraction | null;
  setLatestAssistantInteraction: (
    summary: LatestAssistantInteraction | null
  ) => void;
  /**
   * Bumped by resetSession so P1 providers (planner/timeline) can clear
   * their session state too — keeps ONE reset contract.
   */
  sessionEpoch: number;
}

const FarmContext = createContext<FarmContextValue | null>(null);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FarmProfile>(DEMO_PROFILE);

  const updateProfile = (patch: Partial<FarmProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  const setSelectedCrop = (crop: string | undefined) => {
    setProfile((prev) => ({ ...prev, selectedCrop: crop }));
  };

  const resetFarmProfile = () => {
    setProfile(DEMO_PROFILE);
  };

  /** Clear every shared session value in one click — no persistence involved. */
  const resetSession = () => {
    setProfile({ ...DEMO_PROFILE, selectedCrop: undefined });
    setLatestHealthCheck(null);
    setLatestOperation(null);
    setLatestAssistantInteraction(null);
    setSessionEpoch((e) => e + 1);
  };

  const isProfileEmpty =
    profile.farmerName.trim() === "" ||
    profile.location.trim() === "" ||
    !(profile.farmSizeAcres > 0);

  const hasCompleteProfile =
    profile.farmerName.trim() !== "" &&
    profile.location.trim() !== "" &&
    profile.farmSizeAcres > 0;

  const [latestHealthCheck, setLatestHealthCheck] =
    useState<HealthCheckSummary | null>(null);

  const [latestOperation, setLatestOperation] =
    useState<LatestOperationSummary | null>(null);

  const [latestAssistantInteraction, setLatestAssistantInteraction] =
    useState<LatestAssistantInteraction | null>(null);

  /** Session epoch — incremented on reset so P1 stores clear themselves. */
  const [sessionEpoch, setSessionEpoch] = useState(0);

  return (
    <FarmContext.Provider
      value={{
        profile,
        updateProfile,
        setSelectedCrop,
        resetFarmProfile,
        resetSession,
        isProfileEmpty,
        hasCompleteProfile,
        latestHealthCheck,
        setLatestHealthCheck,
        latestOperation,
        setLatestOperation,
        latestAssistantInteraction,
        setLatestAssistantInteraction,
        sessionEpoch,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarmProfile(): FarmContextValue {
  const ctx = useContext(FarmContext);
  if (!ctx) {
    throw new Error("useFarmProfile must be used inside <FarmProvider>");
  }
  return ctx;
}
