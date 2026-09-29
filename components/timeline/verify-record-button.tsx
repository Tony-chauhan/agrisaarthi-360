"use client";

import { useState } from "react";
import {
  ShieldCheck,
  LoaderCircle,
  ShieldAlert,
  Link2,
  RefreshCw,
} from "lucide-react";
import { useTimeline } from "@/lib/timeline/timeline-context";
import { useFarmProfile } from "@/lib/farm-context";
import type { TimelineEvent, VerificationStatus } from "@/lib/timeline/types";
import { PROVENANCE_ELIGIBLE_EVENT_TYPES } from "@/lib/timeline/types";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * VerifyRecordButton — the PROOF actions for an eligible timeline event.
 *
 * Two explicit steps, never silent:
 *  1. [Create Verified Record]  → canonical hash → LOCAL verification.
 *  2. [Anchor on Testnet]       → explicit on-chain anchoring (shown only
 *     when the server reports anchoring is available). A failure here
 *     keeps the record locally verified and explains why.
 *
 * After anchoring, [Verify Again] re-runs verification — for anchored
 * records that means querying the configured contract on-chain.
 * "Blockchain verified" is shown ONLY when actual on-chain verification
 * succeeded; a transaction hash is displayed ONLY when a real receipt
 * exists. Nothing is fabricated.
 */

interface CreateResponse {
  record: {
    canonicalPayloadHash: string;
    status: string;
    chain: string;
    transactionHash?: string;
  };
  anchoring: { requested: boolean; attempted: boolean; result: string; reason?: string };
  capabilities: { blockchainConfigured: boolean; anchoringAvailable: boolean };
}

interface AnchorResponse {
  record: {
    canonicalPayloadHash: string;
    status: string;
    network: string;
    transactionHash?: string;
    contractAddress?: string;
  };
}

interface VerifyResponse {
  result: {
    verified: boolean;
    source?: string;
    transactionHash?: string;
    network?: string;
    reason: string;
  };
  record: { status: string };
}

export function VerifyRecordButton({ event }: { event: TimelineEvent }) {
  const { emitEvent, setVerificationStatus } = useTimeline();
  const { profile } = useFarmProfile();
  const { t } = useLanguage();
  const [busy, setBusy] = useState<null | "create" | "anchor" | "verify">(null);
  const [note, setNote] = useState<string | null>(null);
  const [anchoringAvailable, setAnchoringAvailable] = useState(false);
  const [network, setNetwork] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const recordHash = event.metadataHash ?? null;
  const isAnchored = event.verificationStatus === "blockchain-verified";
  const isLocalVerified = event.verificationStatus === "local-verified";

  const canCreate =
    PROVENANCE_ELIGIBLE_EVENT_TYPES.includes(event.eventType) &&
    event.verificationStatus === "unverified";

  if (!canCreate && !isLocalVerified && !isAnchored) return null;

  /* ---------------- 1. Create Verified Record (local) ---------------- */
  const createRecord = async () => {
    setBusy("create");
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
        setVerificationStatus(event.entityId, "unavailable");
        setNote(t.timeline.createUnavailable);
        return;
      }

      const data = (await res.json()) as CreateResponse;
      setAnchoringAvailable(data.capabilities.anchoringAvailable);
      setVerificationStatus(
        event.entityId,
        "local-verified",
        data.record.canonicalPayloadHash
      );
      setNote(t.timeline.localVerifiedNote(data.record.canonicalPayloadHash));

      emitEvent({
        eventType: "PROVENANCE_VERIFIED",
        title: t.timeline.localVerifiedEventTitle(event.title),
        description: t.timeline.localVerifiedEventDescription,
        source: "rules-based",
        entityType: "record",
        entityId: data.record.canonicalPayloadHash,
      });
    } catch {
      setVerificationStatus(event.entityId, "unavailable");
      setNote(t.timeline.createNetworkError);
    } finally {
      setBusy(null);
    }
  };

  /* ---------------- 2. Anchor on Testnet (explicit) ------------------ */
  const anchorOnTestnet = async () => {
    if (!recordHash) return;
    setBusy("anchor");
    setNote(null);
    setVerificationStatus(event.entityId, "pending", recordHash);

    try {
      const res = await fetch("/api/provenance/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordHash }),
      });

      if (!res.ok) {
        // Failure path — restore local verification, show the reason.
        setVerificationStatus(event.entityId, "local-verified", recordHash);
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        setNote(body?.message ?? t.timeline.anchoringUnavailable);
        return;
      }

      const data = (await res.json()) as AnchorResponse;
      if (data.record.status === "blockchain-verified" && data.record.transactionHash) {
        setVerificationStatus(event.entityId, "blockchain-verified", recordHash);
        setNetwork(data.record.network);
        setTxHash(data.record.transactionHash);
        setNote(t.timeline.anchoredNote(data.record.network, data.record.transactionHash));
        emitEvent({
          eventType: "PROVENANCE_VERIFIED",
          title: t.timeline.anchoredEventTitle(event.title),
          description: t.timeline.anchoredEventDescription(
            data.record.network,
            data.record.transactionHash,
          ),
          source: "rules-based",
          entityType: "record",
          entityId: data.record.canonicalPayloadHash,
        });
      } else {
        // Pending (broadcast but unconfirmed) — keep pending badge.
        setNote(t.timeline.pendingNote);
      }
    } catch {
      setVerificationStatus(event.entityId, "local-verified", recordHash);
      setNote(t.timeline.anchoringUnavailable);
    } finally {
      setBusy(null);
    }
  };

  /* ---------------- 3. Verify Again (re-verification) ---------------- */
  const verifyAgain = async () => {
    if (!recordHash) return;
    setBusy("verify");
    setNote(null);

    try {
      const res = await fetch(
        `/api/provenance/${encodeURIComponent(recordHash)}/verify`
      );
      if (!res.ok) {
        setNote(t.timeline.verifyUnavailable);
        return;
      }
      const data = (await res.json()) as VerifyResponse;
      if (data.result.verified) {
        const status: VerificationStatus =
          data.result.source === "BLOCKCHAIN"
            ? "blockchain-verified"
            : "local-verified";
        setVerificationStatus(event.entityId, status, recordHash);
        if (data.result.source === "BLOCKCHAIN") {
          setNetwork(data.result.network ?? null);
          if (data.result.transactionHash) setTxHash(data.result.transactionHash);
        }
        setNote(
          data.result.source === "BLOCKCHAIN"
            ? t.timeline.reverifiedChain
            : t.timeline.reverifiedLocal
        );
      } else {
        setNote(data.result.reason);
      }
    } catch {
      setNote(t.timeline.verifyNetworkError);
    } finally {
      setBusy(null);
    }
  };

  const busyLabel =
    busy === "create"
      ? t.timeline.busyCreating
      : busy === "anchor"
        ? t.timeline.busyAnchoring
        : t.timeline.busyVerifying;

  if (busy) {
    return (
      <span className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-harvest-600">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
        {busyLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-1.5">
      <span className="flex flex-wrap items-center gap-2">
        {canCreate ? (
          <button
            type="button"
            onClick={() => void createRecord()}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-canopy-300 px-3 text-sm font-medium text-canopy-800 transition-colors hover:bg-canopy-50"
            aria-label={t.timeline.createRecordAria(event.title)}
          >
            <ShieldCheck className="h-4 w-4 text-canopy-600" aria-hidden />
            {t.timeline.createRecord}
          </button>
        ) : null}

        {isLocalVerified && anchoringAvailable ? (
          <button
            type="button"
            onClick={() => void anchorOnTestnet()}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-sprout-400/50 bg-sprout-400/10 px-3 text-sm font-medium text-canopy-800 transition-colors hover:bg-sprout-400/20"
            aria-label={t.timeline.anchorTestnetAria(event.title)}
          >
            <Link2 className="h-4 w-4 text-canopy-700" aria-hidden />
            {t.timeline.anchorTestnet}
          </button>
        ) : null}

        {(isLocalVerified || isAnchored) && recordHash ? (
          <button
            type="button"
            onClick={() => void verifyAgain()}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-canopy-200 px-3 text-xs font-medium text-canopy-700 transition-colors hover:bg-canopy-50"
            aria-label={t.timeline.verifyAgainAria(event.title)}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {t.timeline.verifyAgain}
          </button>
        ) : null}
      </span>

      {isAnchored && network ? (
        <span className="text-xs text-loam-600">
          {t.timeline.networkLabel}
          {network}
          {txHash ? (
            <>
              {" · "}
              {t.timeline.txLabel}
              <span className="break-all font-mono">{txHash}</span>
            </>
          ) : null}
        </span>
      ) : null}

      {note ? (
        <span className="flex max-w-full items-start gap-1 text-xs text-loam-600">
          <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          <span className="break-words">{note}</span>
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
