import { NextResponse } from "next/server";
import { provenanceMode } from "@/lib/provenance/provider";
import { lookupLocalRecord } from "@/lib/provenance/local-adapter";

/**
 * PROVENANCE RECORD API ROUTE (P1.4)
 *
 * GET /api/provenance/:id — record lookup. The local adapter keeps a
 * session-scoped registry; records are addressable by record id or by the
 * canonical hash. 404 when unknown — never a fabricated record.
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

  return NextResponse.json({ record, mode: provenanceMode() }, { status: 200 });
}
