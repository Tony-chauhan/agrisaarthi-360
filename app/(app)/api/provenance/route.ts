import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRateLimited, rateLimitedResponse } from "@/lib/rate-limit";
import {
  createProvenanceRecord,
  provenanceCapabilities,
  provenanceMode,
} from "@/lib/provenance/provider";
import type {
  AnchoringOutcome,
  ProvenanceCapabilities,
  ProvenanceRecord,
  ProvenanceRequestInput,
} from "@/lib/provenance/types";
import type { TimelineEventType } from "@/lib/timeline/types";

/**
 * PROVENANCE API ROUTE (P1.4)
 *
 * POST /api/provenance — create a provenance record for an eligible event.
 * Server-side: whitelist-filter → canonical payload → SHA-256 → local
 * adapter (the record is ALWAYS locally verified first). When the client
 * explicitly sends anchorOnChain:true AND the testnet adapter is fully
 * configured, the canonical hash is additionally anchored on-chain — the
 * response's `anchoring` field reports honestly which of anchored /
 * failed / skipped occurred.
 */

export const runtime = "nodejs";

const EVENT_TYPES: TimelineEventType[] = [
  "CROP_SELECTED",
  "WEATHER_ACTION",
  "HEALTH_CHECK",
  "TASK_CREATED",
  "TASK_COMPLETED",
  "OPERATION_REQUESTED",
  "OPERATION_COMPLETED",
  "FARM_RECORD_CREATED",
  "PROVENANCE_VERIFIED",
];

/** Only provenance-eligible event types may create records. */
const ELIGIBLE: TimelineEventType[] = [
  "HEALTH_CHECK",
  "OPERATION_COMPLETED",
  "TASK_COMPLETED",
  "FARM_RECORD_CREATED",
];

export async function POST(request: NextRequest) {
  // Per-IP abuse mitigation on record creation.
  if (isRateLimited(request, { max: 20 })) {
    return rateLimitedResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const raw = body as Partial<ProvenanceRequestInput>;
  if (typeof raw !== "object" || raw === null) {
    return NextResponse.json(
      { error: "invalid_request", message: "A request body is required." },
      { status: 400 }
    );
  }

  if (
    typeof raw.eventId !== "string" ||
    raw.eventId.trim() === "" ||
    raw.eventId.length > 200
  ) {
    return NextResponse.json(
      { error: "invalid_request", message: "A valid eventId is required." },
      { status: 400 }
    );
  }
  if (
    typeof raw.eventType !== "string" ||
    !ELIGIBLE.includes(raw.eventType as TimelineEventType) ||
    !EVENT_TYPES.includes(raw.eventType as TimelineEventType)
  ) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message:
          "eventType must be a provenance-eligible event (HEALTH_CHECK, OPERATION_COMPLETED, TASK_COMPLETED, FARM_RECORD_CREATED).",
      },
      { status: 400 }
    );
  }
  if (
    typeof raw.eventTimestamp !== "string" ||
    Number.isNaN(Date.parse(raw.eventTimestamp))
  ) {
    return NextResponse.json(
      { error: "invalid_request", message: "A valid eventTimestamp is required." },
      { status: 400 }
    );
  }
  if (
    typeof raw.farmContext !== "object" ||
    raw.farmContext === null ||
    typeof (raw.farmContext as { location?: unknown }).location !== "string"
  ) {
    return NextResponse.json(
      { error: "invalid_request", message: "farmContext with location is required." },
      { status: 400 }
    );
  }

  // Blockchain anchoring is EXPLICIT — only a client-requested true
  // triggers an on-chain transaction (and only when the adapter is fully
  // configured; otherwise the response carries an honest skipped reason).
  const anchorOnChain =
    (raw as { anchorOnChain?: unknown }).anchorOnChain === true;

  const outcome = await createProvenanceRecord(
    {
      eventId: raw.eventId.trim(),
      eventType: raw.eventType as TimelineEventType,
      eventTimestamp: raw.eventTimestamp,
      entitySummary:
        raw.entitySummary && typeof raw.entitySummary === "object"
          ? (raw.entitySummary as Record<string, string>)
          : {},
      farmContext: {
        crop:
          typeof raw.farmContext.crop === "string"
            ? raw.farmContext.crop.slice(0, 60)
            : undefined,
        season:
          typeof raw.farmContext.season === "string"
            ? raw.farmContext.season.slice(0, 12)
            : undefined,
        location: (raw.farmContext as { location: string }).location.slice(0, 120),
      },
    },
    { anchorOnChain }
  );

  if (outcome.status === "unavailable") {
    return NextResponse.json(
      { error: "provenance_unavailable", message: outcome.reason },
      { status: 502 }
    );
  }

  const response: {
    record: ProvenanceRecord;
    mode: { adapter: string; chain: string; network: string };
    anchoring: AnchoringOutcome;
    capabilities: ProvenanceCapabilities;
  } = {
    record: outcome.record,
    mode: provenanceMode(),
    anchoring: outcome.anchoring,
    capabilities: provenanceCapabilities(),
  };
  return NextResponse.json(response, { status: 200 });
}
