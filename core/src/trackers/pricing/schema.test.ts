import { describe, it, expect } from "vitest";
import { PricingSchema } from "./schema.js";

describe("PricingSchema", () => {
  it("parses a well-formed pricing object with explicit limits", () => {
    const ok = PricingSchema.parse({
      plans: [{ name: "Pro", price: { amount: 20, currency: "USD", period: "mo" }, features: ["api"], limits: { seats: 5 }, cta: "Buy" }],
    });
    expect(ok.plans[0].name).toBe("Pro");
    expect(ok.plans[0].limits).toEqual({ seats: 5 });
  });
  it("defaults limits to {} when omitted (API does not return it)", () => {
    const ok = PricingSchema.parse({
      plans: [{ name: "Pro", price: { amount: 20, currency: "USD", period: "mo" }, features: ["api"], cta: "Buy" }],
    });
    expect(ok.plans[0].limits).toEqual({});
  });
  it("accepts any period string (normalizePricing maps to canonical form)", () => {
    const ok = PricingSchema.parse({
      plans: [{ name: "X", price: { amount: 1, currency: "USD", period: "month (billed yearly)" }, features: [], cta: null }],
    });
    expect(ok.plans[0].price.period).toBe("month (billed yearly)");
  });
  it("accepts null period", () => {
    const ok = PricingSchema.parse({
      plans: [{ name: "Enterprise", price: { amount: null, currency: null, period: null }, features: [], cta: null }],
    });
    expect(ok.plans[0].price.period).toBeNull();
  });
  it("rejects a plan with no name", () => {
    expect(() =>
      PricingSchema.parse({ plans: [{ price: { amount: 1, currency: "USD", period: "mo" }, features: [], cta: null }] }),
    ).toThrow();
  });
});
