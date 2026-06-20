// core/src/landscape/synthesis.test.ts
import { describe, it, expect } from "vitest";
import { buildLandscape } from "./synthesis.js";

const player = (name: string, features: string[]) => ({
  name, domain: `${name.toLowerCase()}.com`, oneLiner: `${name} oneliner`, tagline: null,
  tags: [], features, positioning: "p", links: { site: null, docs: null, pricing: null },
  sourceUrl: `https://${name.toLowerCase()}.com`, confidence: 1,
});

describe("buildLandscape", () => {
  it("builds citations, common-feature dimensions, and a brief", () => {
    const ls = buildLandscape({
      category: "scraping apis",
      players: [player("Firecrawl", ["markdown", "crawl"]), player("Jina", ["markdown", "reader"])],
      failures: [{ url: "https://x.com", domain: "x.com", reason: "http_403" }],
      creditsUsed: 100, latencyMs: 5000,
    });
    expect(ls.citations).toHaveLength(2);
    expect(ls.citations[0]).toEqual({ n: 1, title: "Firecrawl — firecrawl.com", url: "https://firecrawl.com" });
    expect(ls.comparison.dimensions).toContain("markdown"); // shared across both
    expect(ls.brief).toMatch(/2 player/i);
    expect(ls.brief).toMatch(/1 couldn't be profiled/i);
  });
});
