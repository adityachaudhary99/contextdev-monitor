import { describe, it, expect } from "vitest";
import { normalizePricing } from "./normalize.js";

describe("normalizePricing", () => {
  it("converts amount to minor units and sorts plans + features", () => {
    const out = normalizePricing({
      plans: [
        { name: "Pro", price: { amount: 20, currency: "USD", period: "mo" }, features: ["b", "a"], limits: { seats: 5 }, cta: null },
        { name: "Free", price: { amount: 0, currency: "USD", period: "mo" }, features: [], limits: {}, cta: null },
      ],
    });
    expect(out.plans.map((p) => p.name)).toEqual(["Free", "Pro"]);
    expect(out.plans[1].amountMinor).toBe(2000);
    expect(out.plans[1].features).toEqual(["a", "b"]);
  });
  it("keeps null amounts null", () => {
    const out = normalizePricing({ plans: [{ name: "Enterprise", price: { amount: null, currency: null, period: null }, features: [], limits: {}, cta: null }] });
    expect(out.plans[0].amountMinor).toBeNull();
  });
});
