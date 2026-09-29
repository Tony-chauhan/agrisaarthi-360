/**
 * Simple in-memory per-IP fixed-window rate limiter for API routes.
 *
 * Suitable for a single-instance deployment. Buckets are keyed by the
 * client IP (x-forwarded-for first value, then x-real-ip, else "unknown")
 * and hold timestamps inside a 60-second window. State resets on server
 * restart — this is abuse mitigation, not a billing control.
 */

const WINDOW_MS = 60_000;
const MAX_BUCKETS = 5_000;

const buckets = new Map<string, number[]>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function isRateLimited(
  request: Request,
  options?: { max?: number; windowMs?: number }
): boolean {
  const max = options?.max ?? 20;
  const windowMs = options?.windowMs ?? WINDOW_MS;
  const now = Date.now();
  const key = clientKey(request);

  // Keep memory bounded: drop the oldest bucket when the map grows too big.
  if (!buckets.has(key) && buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest !== undefined) buckets.delete(oldest);
  }

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return true;
  }

  hits.push(now);
  buckets.set(key, hits);
  return false;
}

/** Standard JSON 429 response for rate-limited requests. */
export function rateLimitedResponse(): Response {
  return Response.json(
    {
      error: "rate_limited",
      message: "Too many requests — please wait a moment and try again.",
    },
    { status: 429 }
  );
}
