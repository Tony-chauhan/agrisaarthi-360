import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { anchorProvenanceRecord } from "@/lib/provenance/provider";
import { lookupLocalRecord } from "@/lib/provenance/local-adapter";

/**
 * PROVENANCE ANCHOR API ROUTE — explicit blockchain anchoring.
 *
 * POST /api/provenance/anchor  { recordHash }
 *
 * Called only from an explicit user action ("Anchor on Testnet"). Anchors
 * an existing locally-verified record's canonical hash on the configured
 * testnet. Failure responses are honest (502 + reason) and the record
 * remains locally verified — nothing is fabricated.
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const recordHash =
    typeof (body as { recordHash?: unknown })?.recordHash === "string"
      ? ((body as { recordHash: string }).recordHash).trim()
      : "";

  // Accept a SHA-256 hex hash or a record id (prov-local-…/prov-chain-…).
  const isHexHash = /^0x[a-fA-F0-9]{64}$|^[a-fA-F0-9]{64}$/.test(recordHash);
  const isRecordId = recordHash.startsWith("prov-local-") || recordHash.startsWith("prov-chain-");
  if (!recordHash || (!isHexHash && !isRecordId)) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "A valid recordHash (SHA-256 hex) or record id is required.",
      },
      { status: 400 }
    );
  }

  const record = lookupLocalRecord(recordHash);
  if (!record) {
    return NextResponse.json(
      {
        error: "not_found",
        message:
          "No provenance record exists for this hash in the current session — create the record first.",
      },
      { status: 404 }
    );
  }

  const outcome = await anchorProvenanceRecord(record);

  if (outcome.status === "unavailable") {
    return NextResponse.json(
      { error: "anchoring_unavailable", message: outcome.reason },
      { status: 502 }
    );
  }

  return NextResponse.json({ record: outcome.record }, { status: 200 });
}
