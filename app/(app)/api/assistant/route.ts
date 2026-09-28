import { NextResponse } from "next/server";
import { runAssistant } from "@/lib/assistant/provider";
import { classifyQuestion } from "@/lib/assistant/topic-routing";
import type {
  AssistantContextPacket,
  AssistantRequest,
} from "@/lib/assistant/types";

/**
 * ASSISTANT API ROUTE — server-side only.
 *
 * Responsibilities:
 * 1. Validate the request (question + compact context packet).
 * 2. Classify the question deterministically (server-side — the client's
 *    topic claim is never trusted).
 * 3. Call the provider orchestrator (Gemini when configured, deterministic
 *    demo fallback otherwise).
 * 4. Return a safe, normalized AssistantResponse.
 *
 * Raw provider errors NEVER leave this route. GEMINI_API_KEY is read only
 * inside lib/assistant/ via process.env — never exposed to the client.
 */

export const runtime = "nodejs";

/** Maximum accepted question length (guards against abuse). */
const MAX_QUESTION_LENGTH = 500;

function isContextField(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { key?: unknown }).key === "string" &&
    typeof (value as { value?: unknown }).value === "string" &&
    typeof (value as { source?: unknown }).source === "string"
  );
}

/** Light structural validation — the packet is compact, so this is cheap. */
function isValidContext(raw: unknown): raw is AssistantContextPacket {
  if (typeof raw !== "object" || raw === null) return false;
  const ctx = raw as AssistantContextPacket;
  if (typeof ctx.farm !== "object" || ctx.farm === null) return false;

  const farmFields = [
    ctx.farm.farmerName,
    ctx.farm.location,
    ctx.farm.farmSize,
    ctx.farm.irrigation,
    ctx.farm.soil,
    ctx.farm.season,
  ];
  if (farmFields.some((f) => f !== undefined && !isContextField(f))) {
    return false;
  }

  if (ctx.crop !== undefined) {
    if (typeof ctx.crop !== "object" || ctx.crop === null) return false;
    if (!isContextField(ctx.crop.selectedCrop)) return false;
  }
  if (ctx.health !== undefined) {
    const h = ctx.health as unknown as Record<string, unknown>;
    if (typeof h.crop !== "string" || typeof h.possibleCondition !== "string") {
      return false;
    }
  }
  if (ctx.weather !== undefined) {
    const w = ctx.weather as unknown as Record<string, unknown>;
    if (
      typeof w.summary !== "string" ||
      typeof w.actionTitle !== "string" ||
      typeof w.actionMessage !== "string"
    ) {
      return false;
    }
  }
  if (ctx.operation !== undefined) {
    const o = ctx.operation as unknown as Record<string, unknown>;
    if (typeof o.operationName !== "string") return false;
  }
  return true;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const parsed = body as Partial<AssistantRequest>;

  const question =
    typeof parsed?.question === "string" ? parsed.question.trim() : "";
  if (question.length === 0) {
    return NextResponse.json(
      { error: "invalid_request", message: "A question is required." },
      { status: 400 }
    );
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: `Question must be at most ${MAX_QUESTION_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  if (!isValidContext(parsed?.context)) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "A valid farm context packet is required.",
      },
      { status: 400 }
    );
  }

  // Deterministic server-side routing — client topic claims are ignored.
  const topic = classifyQuestion(question);

  const response = await runAssistant({ question, topic, context: parsed.context });

  return NextResponse.json(response, { status: 200 });
}
