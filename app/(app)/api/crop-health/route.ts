import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { runAnalysis } from "@/lib/crop-health/provider";
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  type AnalysisFarmContext,
  type AnalysisOutcome,
  type NormalizedAnalysis,
} from "@/lib/crop-health/types";
import type { IrrigationType, Season } from "@/lib/types";

/**
 * SERVER ROUTE — crop health analysis.
 *
 * SECURITY: GEMINI_API_KEY is read only inside the provider layer (server
 * runtime). The browser only ever talks to /api/crop-health and receives a
 * normalized result. All provider failures resolve to the deterministic demo
 * fallback, so the route always returns a usable payload.
 */

export const runtime = "nodejs";

/** Body contract the client must send. */
interface AnalysisRequestBody {
  imageBase64?: unknown;
  imageMimeType?: unknown;
  farmContext?: unknown;
}

const SEASONS: Season[] = ["kharif", "rabi", "zaid"];
const IRRIGATION: IrrigationType[] = [
  "rain-fed",
  "canal",
  "borewell",
  "drip",
  "sprinkler",
];

/** Strictly extract known farm-context fields; ignore everything else. */
function parseFarmContext(raw: unknown): AnalysisFarmContext {
  const ctx: AnalysisFarmContext = {};
  if (raw === null || typeof raw !== "object") return ctx;
  const obj = raw as Record<string, unknown>;

  const crop = obj.selectedCrop;
  if (typeof crop === "string" && crop.trim() !== "") {
    ctx.selectedCrop = crop.trim().slice(0, 60);
  }
  if (typeof obj.season === "string" && SEASONS.includes(obj.season as Season)) {
    ctx.season = obj.season as Season;
  }
  const loc = obj.location;
  if (typeof loc === "string" && loc.trim() !== "") {
    ctx.location = loc.trim().slice(0, 120);
  }
  if (
    typeof obj.irrigation === "string" &&
    IRRIGATION.includes(obj.irrigation as IrrigationType)
  ) {
    ctx.irrigation = obj.irrigation as IrrigationType;
  }
  return ctx;
}

export async function POST(request: NextRequest) {
  let body: AnalysisRequestBody;
  try {
    body = (await request.json()) as AnalysisRequestBody;
  } catch {
    return NextResponse.json<AnalysisOutcome>(
      { status: "invalid-image", reason: "Malformed request." },
      { status: 400 }
    );
  }

  const { imageBase64, imageMimeType, farmContext } = body;

  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return NextResponse.json<AnalysisOutcome>(
      { status: "invalid-image", reason: "Missing image data." },
      { status: 400 }
    );
  }

  if (
    typeof imageMimeType !== "string" ||
    !(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(imageMimeType)
  ) {
    return NextResponse.json<AnalysisOutcome>(
      { status: "invalid-image", reason: "Unsupported image type." },
      { status: 415 }
    );
  }

  // Defensive size ceiling (base64 ≈ 4/3 of binary size).
  if (imageBase64.length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3)) {
    return NextResponse.json<AnalysisOutcome>(
      { status: "invalid-image", reason: "Image exceeds the size limit." },
      { status: 413 }
    );
  }

  const analysis: NormalizedAnalysis = await runAnalysis({
    imageBase64,
    imageMimeType,
    farmContext: parseFarmContext(farmContext),
  });

  return NextResponse.json<{ status: "success"; analysis: NormalizedAnalysis }>({
    status: "success",
    analysis,
  });
}
