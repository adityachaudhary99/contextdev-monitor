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

export function normalizePricing(raw: Pricing): NormalizedSnapshot<Pricing> {
  const plans = raw.plans
    .map((p) => ({
      name: p.name,
      amountMinor: p.price.amount === null ? null : Math.round(p.price.amount * 100),
      currency: p.price.currency,
      period: p.price.period,
      features: [...p.features].sort(),
      limits: p.limits,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { plans };
}
