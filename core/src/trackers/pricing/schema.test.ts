import { describe, it, expect } from "vitest";
import { PricingSchema } from "./schema.js";

describe("PricingSchema", () => {
  it("parses a well-formed pricing object", () => {
    const ok = PricingSchema.parse({
      plans: [{ name: "Pro", price: { amount: 20, currency: "USD", period: "mo" }, features: ["api"], limits: { seats: 5 }, cta: "Buy" }],
    });
    expect(ok.plans[0].name).toBe("Pro");
  });
  it("rejects an invalid period", () => {
    expect(() =>
      PricingSchema.parse({ plans: [{ name: "X", price: { amount: 1, currency: "USD", period: "week" }, features: [], limits: {}, cta: null }] }),
    ).toThrow();
  });
});
