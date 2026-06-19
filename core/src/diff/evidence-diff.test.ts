import { describe, it, expect } from "vitest";
import { diffPricing } from "./evidence-diff.js";
import { normalizePricing } from "../trackers/pricing/normalize.js";

const snap = (amount: number) =>
  normalizePricing({ plans: [{ name: "Pro", price: { amount, currency: "USD", period: "mo" }, features: ["api"], limits: {}, cta: null }] });

describe("diffPricing", () => {
  it("reports no change for identical snapshots", () => {
    const d = diffPricing(snap(20), snap(20));
    expect(d.changed).toBe(false);
    expect(d.changes).toHaveLength(0);
  });
  it("detects a price change with evidence and full confidence", () => {
    const d = diffPricing(snap(20), snap(25));
    expect(d.changed).toBe(true);
    expect(d.changes[0]).toMatchObject({ kind: "price_changed", plan: "Pro", confidence: 1 });
    expect(d.changes[0].detail).toContain("2000");
    expect(d.changes[0].detail).toContain("2500");
  });
  it("detects added and removed plans", () => {
    const empty = normalizePricing({ plans: [] });
    expect(diffPricing(empty, snap(20)).changes[0].kind).toBe("plan_added");
    expect(diffPricing(snap(20), empty).changes[0].kind).toBe("plan_removed");
  });
});
