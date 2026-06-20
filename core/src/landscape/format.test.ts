import { describe, it, expect } from "vitest";
import { formatLandscapeSummary } from "./format.js";

const ls = {
  category: "scraping apis",
  players: [
    { name: "Firecrawl", domain: "firecrawl.dev", oneLiner: "Web scraping API", tagline: null, tags: ["api", "crawl"], features: [], positioning: "", links: { site: null, docs: null, pricing: null }, sourceUrl: "https://firecrawl.dev", confidence: 1 },
  ],
  failures: [{ url: "https://x.com", domain: "x.com", reason: "http_403" }],
  comparison: { dimensions: ["api", "crawl"] },
  brief: 'Mapped 1 player in "scraping apis".',
  citations: [], creditsUsed: 108, latencyMs: 17800,
};

describe("formatLandscapeSummary", () => {
  it("renders heading, brief, capabilities, a player line, failures, credits/latency", () => {
    const s = formatLandscapeSummary(ls as never);
    expect(s).toContain("scraping apis — 1 player mapped");
    expect(s).toContain("Mapped 1 player");
    expect(s).toContain("Capabilities: api, crawl");
    expect(s).toContain("1. Firecrawl  (firecrawl.dev)");
    expect(s).toContain("Web scraping API");
    expect(s).toContain("[1] https://firecrawl.dev");
    expect(s).toContain("Couldn't profile (1): x.com (http_403)");
    expect(s).toContain("108 credits · 17.8s");
  });
  it("never throws on an empty landscape", () => {
    const empty = { category: "x", players: [], failures: [], comparison: { dimensions: [] }, brief: "", citations: [], creditsUsed: 0, latencyMs: 0 };
    expect(() => formatLandscapeSummary(empty as never)).not.toThrow();
    expect(formatLandscapeSummary(empty as never)).toContain("x — 0 players mapped");
  });
});
