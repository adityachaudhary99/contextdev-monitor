import { describe, it, expect } from "vitest";
import { computeMarketAnalytics, parsePrice } from "./analytics.js";
import type { PlayerProfile } from "./types.js";

const mk = (over: Partial<PlayerProfile>): PlayerProfile => ({
  name: "X", domain: "x.com", oneLiner: "", tagline: null, tags: [], features: [],
  positioning: "", links: { site: null, docs: null, pricing: null }, sourceUrl: "https://x.com",
  confidence: 1, ...over,
});

describe("parsePrice", () => {
  it("extracts a number from common price strings", () => {
    expect(parsePrice("$49/month")).toBe(49);
    expect(parsePrice("from $99")).toBe(99);
    expect(parsePrice("$1,000/mo")).toBe(1000);
    expect(parsePrice("$0.50/request")).toBe(0.5);
  });
  it("returns null when there is no number", () => {
    expect(parsePrice("Contact sales")).toBeNull();
    expect(parsePrice("Free")).toBeNull();
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
    expect(parsePrice("")).toBeNull();
  });
});

describe("computeMarketAnalytics", () => {
  const players = [
    mk({ name: "A", domain: "a.com", tags: ["api", "cloud", "proxies"], openSource: false, pricing: { free: true, startingPrice: "$49/mo", model: null } }),
    mk({ name: "B", domain: "b.com", tags: ["api", "cloud"], openSource: true, pricing: { free: false, startingPrice: "$29/mo", model: null } }),
    mk({ name: "C", domain: "c.com", tags: ["api"], openSource: null, pricing: { free: true, startingPrice: "$199/mo", model: null } }),
  ];

  it("computes capability coverage sorted by count desc", () => {
    const a = computeMarketAnalytics(players);
    const api = a.capabilityCoverage.find((c) => c.capability === "api");
    expect(api).toEqual({ capability: "api", count: 3, pct: 100 });
    const cloud = a.capabilityCoverage.find((c) => c.capability === "cloud");
    expect(cloud).toEqual({ capability: "cloud", count: 2, pct: 67 });
    // sorted descending by count
    const counts = a.capabilityCoverage.map((c) => c.count);
    expect(counts).toEqual([...counts].sort((x, y) => y - x));
  });

  it("computes pricing stats (free-tier count + min/median/max)", () => {
    const a = computeMarketAnalytics(players);
    expect(a.pricing.total).toBe(3);
    expect(a.pricing.withFreeTier).toBe(2);
    expect(a.pricing.pricedCount).toBe(3);
    expect(a.pricing.min).toBe(29);
    expect(a.pricing.median).toBe(49);
    expect(a.pricing.max).toBe(199);
  });

  it("computes open-source composition", () => {
    const a = computeMarketAnalytics(players);
    expect(a.composition).toEqual({ openSource: 1, proprietary: 1, unknown: 1, total: 3 });
  });

  it("tolerates players with no pricing / tags / openSource", () => {
    const a = computeMarketAnalytics([mk({ name: "Z", domain: "z.com" })]);
    expect(a.pricing).toEqual({ total: 1, withFreeTier: 0, pricedCount: 0, min: null, median: null, max: null });
    expect(a.composition).toEqual({ openSource: 0, proprietary: 0, unknown: 1, total: 1 });
    expect(a.capabilityCoverage).toEqual([]);
  });

  it("caps the capability list", () => {
    const many = mk({ tags: Array.from({ length: 30 }, (_, i) => `tag${i}`) });
    const a = computeMarketAnalytics([many], { topCapabilities: 5 });
    expect(a.capabilityCoverage.length).toBeLessThanOrEqual(5);
  });
});
