import type { NormalizedSnapshot, NormalizedPlan } from "../trackers/pricing/normalize.js";
import type { Pricing } from "../trackers/pricing/schema.js";

export type PriceChange = {
  kind: "plan_added" | "plan_removed" | "price_changed" | "features_changed" | "limits_changed";
  plan: string;
  detail: string;
  confidence: number;
};
export type EvidenceDiff = { changed: boolean; changes: PriceChange[] };

export function diffPricing(prev: NormalizedSnapshot<Pricing>, next: NormalizedSnapshot<Pricing>): EvidenceDiff {
  const changes: PriceChange[] = [];
  const prevByName = new Map(prev.plans.map((p) => [p.name, p]));
  const nextByName = new Map(next.plans.map((p) => [p.name, p]));

  for (const [name, p] of nextByName) {
    if (!prevByName.has(name)) changes.push({ kind: "plan_added", plan: name, detail: `Added plan "${name}"`, confidence: 1 });
  }
  for (const [name] of prevByName) {
    if (!nextByName.has(name)) changes.push({ kind: "plan_removed", plan: name, detail: `Removed plan "${name}"`, confidence: 1 });
  }
  for (const [name, a] of prevByName) {
    const b = nextByName.get(name);
    if (!b) continue;
    if (a.amountMinor !== b.amountMinor) {
      changes.push({
        kind: "price_changed",
        plan: name,
        detail: `${name}: ${a.amountMinor} → ${b.amountMinor} ${b.currency ?? ""}/${b.period ?? ""}`.trim(),
        confidence: 1,
      });
    }
    if (!setEqual(a.features, b.features)) {
      changes.push({ kind: "features_changed", plan: name, detail: `${name}: features changed`, confidence: 0.7 });
    }
    if (JSON.stringify(a.limits) !== JSON.stringify(b.limits)) {
      changes.push({ kind: "limits_changed", plan: name, detail: `${name}: limits changed`, confidence: 0.7 });
    }
  }
  return { changed: changes.length > 0, changes };
}

function setEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}
