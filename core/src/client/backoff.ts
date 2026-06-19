export function computeBackoffMs(
  attempt: number,
  opts: { retryAfterMs?: number; baseMs?: number; capMs?: number; rng?: () => number } = {},
): number {
  const { retryAfterMs = 0, baseMs = 500, capMs = 30_000, rng = Math.random } = opts;
  const exp = Math.min(baseMs * 2 ** (attempt - 1), capMs);
  const jittered = exp * rng(); // full jitter in [0, exp]
  return Math.max(retryAfterMs, Math.round(jittered));
}
