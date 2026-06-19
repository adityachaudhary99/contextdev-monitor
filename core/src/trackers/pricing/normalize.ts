import type { Pricing } from "./schema.js";

export type NormalizedPlan = {
  name: string;
  amountMinor: number | null;
  currency: string | null;
  period: "mo" | "yr" | "once" | null;
  features: string[];
  limits: Record<string, string | number>;
};
export type NormalizedSnapshot<_T> = { plans: NormalizedPlan[] };

/**
 * Map a free-form period string from the API to the canonical form.
 * The API returns e.g. "month", "month (billed yearly)", "year", "once", "mo", "yr".
 */
function normalizePeriod(raw: string | null): "mo" | "yr" | "once" | null {
  if (raw === null) return null;
  const s = raw.toLowerCase();
  if (s === "mo" || s.startsWith("month")) return "mo";
  if (s === "yr" || s.startsWith("year") || s.startsWith("annual")) return "yr";
  if (s === "once" || s.startsWith("one") || s.startsWith("lifetime")) return "once";
  return null;
}

export function normalizePricing(raw: Pricing): NormalizedSnapshot<Pricing> {
  const plans = raw.plans
    .map((p) => ({
      name: p.name,
      amountMinor: p.price.amount === null ? null : Math.round(p.price.amount * 100),
      currency: p.price.currency,
      period: normalizePeriod(p.price.period),
      features: [...p.features].sort(),
      limits: Object.fromEntries(Object.keys(p.limits).sort().map((k) => [k, p.limits[k]])),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { plans };
}
