// core/src/landscape/synthesis.test.ts
import { describe, it, expect } from "vitest";
import { buildLandscape } from "./synthesis.js";

const player = (name: string, tags: string[]) => ({
  name, domain: `${name.toLowerCase()}.com`, oneLiner: `${name} oneliner`, tagline: null,
  tags, features: [], positioning: "p", links: { site: null, docs: null, pricing: null },
  sourceUrl: `https://${name.toLowerCase()}.com`, confidence: 1,
});

describe("buildLandscape", () => {
  it("builds citations, tag-based shared dimensions (>=2 players), and a brief", () => {
    const ls = buildLandscape({
      category: "scraping apis",
      players: [player("Firecrawl", ["api", "crawl"]), player("Jina", ["api", "reader"])],
      failures: [{ url: "https://x.com", domain: "x.com", reason: "http_403" }],
      creditsUsed: 100, latencyMs: 5000,
    });
    expect(ls.citations).toHaveLength(2);
    expect(ls.citations[0]).toEqual({ n: 1, title: "Firecrawl — firecrawl.com", url: "https://firecrawl.com" });
    expect(ls.comparison.dimensions).toContain("api");  // shared by both
    expect(ls.comparison.dimensions[0]).toBe("api");     // >=2-shared ranks first
    expect(ls.brief).toMatch(/2 player/i);
    expect(ls.brief).toMatch(/1 couldn't be profiled/i);
  });
  it("falls back to top tags when fewer than 2 are shared", () => {
    const ls = buildLandscape({
      category: "x",
      players: [player("A", ["alpha"]), player("B", ["beta"])],
      failures: [], creditsUsed: 0, latencyMs: 0,
    });
    expect(ls.comparison.dimensions).toEqual(["alpha", "beta"]); // no >=2 shared → top tags, alpha-sorted
  });
});
