export const DEFAULT_LIMIT = 60;
export const MAX_LIMIT = 200;

/**
 * Parse a `limit` query param into a safe positive integer clamped to
 * `[1, max]`. Falls back to `default` when the value is missing, non-numeric,
 * or non-positive. Non-integers are floored.
 */
export function clampLimit(raw: unknown, options: { default?: number; max?: number } = {}): number {
  const fallback = options.default ?? DEFAULT_LIMIT;
  const ceiling = options.max ?? MAX_LIMIT;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), ceiling);
}

/**
 * Parse an `offset` query param into a non-negative integer. Negative or
 * non-numeric values collapse to `0`. Non-integers are floored.
 */
export function clampOffset(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}
