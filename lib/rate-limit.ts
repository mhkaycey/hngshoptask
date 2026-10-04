/**
 * Minimal in-memory fixed-window rate limiter for public endpoints.
 * Good enough for a single-instance deployment; swap for a shared store
 * (e.g. Upstash Redis) if the app scales horizontally.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

/** Best-effort client key: bearer token / session cookie is not directly
 * hashable here, so callers pass a stable identifier (user id or IP). */
export function clientKeyFromRequest(request: Request, userId?: string | null): string {
  if (userId) return userId;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return ip;
}
