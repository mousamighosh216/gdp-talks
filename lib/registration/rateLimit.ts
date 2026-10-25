// Fixed-window limiter kept in memory: fine for one instance, swap for a shared store when scaling out.
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 20;
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, now = Date.now()): { ok: boolean; retryAfter: number } {
  const entry = hits.get(key);
  if (!entry || entry.reset <= now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  entry.count += 1;
  return entry.count > LIMIT
    ? { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) }
    : { ok: true, retryAfter: 0 };
}

export function resetRateLimit() {
  hits.clear();
}
