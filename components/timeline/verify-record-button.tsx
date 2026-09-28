"use client";

import { useState } from "react";
import { ShieldCheck, LoaderCircle, ShieldAlert } from "lucide-react";
import { useTimeline } from "@/lib/timeline/timeline-context";
import { useFarmProfile } from "@/lib/farm-context";
import type { TimelineEvent, VerificationStatus } from "@/lib/timeline/types";
import { PROVENANCE_ELIGIBLE_EVENT_TYPES } from "@/lib/timeline/types";

/**
 * VerifyRecordButton — "Create Verified Record" / "Verify Record".
 * Starts the provenance flow for eligible, unverified events: canonical
 * hash server-side → adapter → verification status back on the timeline.
 * Always honest: local vs blockchain verification is distinctly labeled.
 */
export function VerifyRecordButton({ event }: { event: TimelineEvent }) {
  const { emitEvent, setVerificationStatus } = useTimeline();
  const { profile } = useFarmProfile();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const eligible =
    PROVENANCE_ELIGIBLE_EVENT_TYPES.includes(event.eventType) &&
    event.verificationStatus === "unverified";

  if (!eligible) return null;

  const startVerification = async () => {
    setBusy(true);
    setNote(null);
    setVerificationStatus(event.entityId, "pending");

    try {
      const res = await fetch("/api/provenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.eventId,
          eventType: event.eventType,
          eventTimestamp: event.timestamp,
          entitySummary: buildEntitySummary(event),
          farmContext: {
            crop: profile.selectedCrop,
            season: profile.season,
            location: profile.location,
          },
        }),
      });

      if (!res.ok) {
        // 502 provenance_unavailable or any other failure → honest state.
        setVerificationStatus(event.entityId, "unavailable");
        setNote("Blockchain verification unavailable — record not created.");
        return;
      }

      const data = (await res.json()) as {
        record: { canonicalPayloadHash: string; status: string; chain: string };
        mode: { adapter: string };
      };

      const status: VerificationStatus =
        data.record.chain === "local" ? "local-verified" : "blockchain-verified";
      setVerificationStatus(event.entityId, status, data.record.canonicalPayloadHash);

      if (status === "local-verified") {
        setNote(
          `Record verified locally (hash ${data.record.canonicalPayloadHash.slice(0, 12)}…). Deterministic in-app verification — not a blockchain transaction.`
        );
      } else {
        setNote("Record verified on the configured blockchain network.");
      }

      emitEvent({
        eventType: "PROVENANCE_VERIFIED",
        title: `Record verified: ${event.title}`,
        description:
          status === "local-verified"
            ? "Local verification completed for this farm event."
            : "Blockchain verification completed for this farm event.",
        source: "rules-based",
        entityType: "record",
        entityId: data.record.canonicalPayloadHash,
      });
    } catch {
      setVerificationStatus(event.entityId, "unavailable");
      setNote("Blockchain verification unavailable — network error.");
    } finally {
      setBusy(false);
    }
  };

  if (busy) {
    return (
      <span className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-harvest-600">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Verifying…
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void startVerification()}
        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-canopy-300 px-3 text-sm font-medium text-canopy-800 transition-colors hover:bg-canopy-50"
        aria-label={`Create verified record for: ${event.title}`}
      >
        <ShieldCheck className="h-4 w-4 text-canopy-600" aria-hidden />
        Create Verified Record
      </button>
      {note ? (
        <span className="flex items-start gap-1 text-[11px] text-loam-600">
          <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          {note}
        </span>
      ) : null}
    </span>
  );
}

/** Whitelisted, short summary fields sent for hashing. */
function buildEntitySummary(event: TimelineEvent): Record<string, string> {
  const summary: Record<string, string> = {
    statusText: event.description.slice(0, 120),
  };
  if (event.eventType === "HEALTH_CHECK") {
    summary.possibleCondition = event.title.slice(0, 120);
  }
  if (event.eventType === "TASK_COMPLETED") {
    summary.taskTitle = event.title.slice(0, 120);
  }
  if (
    event.eventType === "OPERATION_COMPLETED" ||
    event.eventType === "FARM_RECORD_CREATED"
  ) {
    summary.operationName = event.title.slice(0, 120);
  }
  return summary;
}
