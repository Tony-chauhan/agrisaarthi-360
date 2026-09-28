import { NextResponse } from "next/server";
import { verifyProvenanceRecord } from "@/lib/provenance/provider";
import { lookupLocalRecord } from "@/lib/provenance/local-adapter";
import type { VerificationResult } from "@/lib/provenance/types";

/**
 * PROVENANCE VERIFY API ROUTE (P1.4)
 *
 * GET /api/provenance/:id/verify — run verification for a record.
 * Unknown record → 404. Adapter/network failure → 200 with an honest
 * { verified:false, reason } so the UI can show UNAVAILABLE instead of
 * an error page.
 */

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = lookupLocalRecord(id);

  if (!record) {
    return NextResponse.json(
      { error: "not_found", message: "No provenance record for this id." },
      { status: 404 }
    );
  }

  const outcome = await verifyProvenanceRecord(record);

  if (outcome.status === "unavailable") {
    const result: VerificationResult = {
      verified: false,
      recordHash: record.canonicalPayloadHash,
      network: record.network,
      reason: outcome.reason,
      verifiedAt: new Date().toISOString(),
    };
    return NextResponse.json({ result, record }, { status: 200 });
  }

  return NextResponse.json({ result: outcome.result, record }, { status: 200 });
}
