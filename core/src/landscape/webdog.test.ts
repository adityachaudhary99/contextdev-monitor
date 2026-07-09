import { describe, it, expect } from "vitest";
import { toWebdogWatchlist } from "./webdog.js";
import type { Landscape, PlayerProfile } from "./types.js";

const player = (over: Partial<PlayerProfile>): PlayerProfile => ({
  name: "Firecrawl", domain: "firecrawl.dev", oneLiner: "", tagline: null, tags: [], features: [],
  positioning: "", links: { site: "https://firecrawl.dev", docs: null, pricing: null },
  sourceUrl: "https://firecrawl.dev", confidence: 1, ...over,
});
const ls = (players: PlayerProfile[]): Landscape => ({
  category: "web scraping APIs", players, failures: [], comparison: { dimensions: [] },
  brief: "", citations: [], creditsUsed: 0, latencyMs: 0,
});

describe("toWebdogWatchlist", () => {
  it("maps every player to a site with a site_links target on the site URL", () => {
    const wl = toWebdogWatchlist(ls([player({})]));
    expect(wl).toMatchObject({ version: 1, generatedBy: "contextdev-monitor", category: "web scraping APIs" });
    expect(wl.sites).toHaveLength(1);
    expect(wl.sites[0]).toMatchObject({ name: "Firecrawl", domain: "firecrawl.dev", url: "https://firecrawl.dev" });
    expect(wl.sites[0].targets[0]).toEqual({
      kind: "site_links", url: "https://firecrawl.dev",
      watchNote: "New or removed pages from Firecrawl — a web scraping APIs player",
    });
  });
  it("falls back to https://{domain} when links.site is null", () => {
    const wl = toWebdogWatchlist(ls([player({ links: { site: null, docs: null, pricing: null } })]));
    expect(wl.sites[0].url).toBe("https://firecrawl.dev");
    expect(wl.sites[0].targets[0].url).toBe("https://firecrawl.dev");
  });
  it("adds product_price for pricing links and page_content for docs links, in order", () => {
    const wl = toWebdogWatchlist(ls([player({
      links: { site: "https://firecrawl.dev", docs: "https://docs.firecrawl.dev", pricing: "https://firecrawl.dev/pricing" },
    })]));
    expect(wl.sites[0].targets.map((t) => t.kind)).toEqual(["site_links", "product_price", "page_content"]);
    expect(wl.sites[0].targets[1]).toEqual({
      kind: "product_price", url: "https://firecrawl.dev/pricing",
      watchNote: "Pricing changes for Firecrawl in the web scraping APIs market",
    });
    expect(wl.sites[0].targets[2].watchNote).toContain("docs");
  });
  it("is deterministic and pure (same input twice → deep-equal output)", () => {
    const l = ls([player({})]);
    expect(toWebdogWatchlist(l)).toEqual(toWebdogWatchlist(l));
  });
});
