/**
 * Conservative in-memory rate limiter for a single-user deployment.
 *
 * Rules:
 *   - Max 10 requests per hour (rolling window)
 *   - Max 1 concurrent analysis at a time
 *
 * In-memory is fine here: single user, single process, no persistence needed.
 */

const MAX_REQUESTS_PER_HOUR = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Rolling log of request timestamps
const requestLog: number[] = [];

// Concurrency lock
let busy = false;

export type RateLimitResult =
  | { allowed: true; release: () => void }
  | { allowed: false; reason: string; retryAfterMs?: number };

export function checkRateLimit(): RateLimitResult {
  const now = Date.now();

  // Evict timestamps outside the rolling window
  const cutoff = now - WINDOW_MS;
  while (requestLog.length > 0 && requestLog[0] < cutoff) {
    requestLog.shift();
  }

  // Concurrency check
  if (busy) {
    return {
      allowed: false,
      reason: "Another analysis is already in progress. Please wait and try again.",
    };
  }

  // Rate check
  if (requestLog.length >= MAX_REQUESTS_PER_HOUR) {
    const oldestInWindow = requestLog[0];
    const retryAfterMs = oldestInWindow + WINDOW_MS - now;
    const retryMins = Math.ceil(retryAfterMs / 60_000);
    return {
      allowed: false,
      reason: `Rate limit reached (${MAX_REQUESTS_PER_HOUR} requests/hour). Try again in ${retryMins} minute${retryMins !== 1 ? "s" : ""}.`,
      retryAfterMs,
    };
  }

  // Claim the slot
  busy = true;
  requestLog.push(now);

  return {
    allowed: true,
    release: () => { busy = false; },
  };
}
