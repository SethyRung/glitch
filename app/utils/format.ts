/**
 * Format a numeric price string (as stored in the DB, e.g. "59.99") as a
 * USD-prefixed display string. Non-numeric values are passed through
 * unchanged so callers can show placeholders like `"—"` without crashing.
 */
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return `$${n.toFixed(2)}`;
}
