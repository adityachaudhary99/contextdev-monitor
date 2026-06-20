import { describe, it, expect, vi } from "vitest";
import { discoverPlayers, rootDomain } from "./discovery.js";

const client = (results: { title: string; url: string }[]) => ({
  webSearch: vi.fn(async () => ({ ok: true, value: { results } })),
} as never);

describe("rootDomain", () => {
  it("strips www and lowercases", () => {
    expect(rootDomain("https://WWW.Firecrawl.dev/pricing")).toBe("firecrawl.dev");
  });
});
describe("discoverPlayers", () => {
  it("dedupes by domain, drops aggregators, caps to maxPlayers", async () => {
    const r = await discoverPlayers("scraping apis", client([
      { title: "Firecrawl", url: "https://firecrawl.dev/" },
      { title: "Firecrawl pricing", url: "https://firecrawl.dev/pricing" }, // dup domain
      { title: "G2 list", url: "https://www.g2.com/categories/scraping" },   // aggregator → dropped
      { title: "Jina", url: "https://jina.ai/" },
    ]), { maxPlayers: 8 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const domains = r.value.map((p) => rootDomain(p.url));
      expect(domains).toEqual(["firecrawl.dev", "jina.ai"]);
    }
  });
  it("returns no_players_found when nothing usable", async () => {
    const r = await discoverPlayers("x", client([{ title: "Reddit", url: "https://reddit.com/r/x" }]));
    expect(r).toEqual({ ok: false, failure: { url: "", reason: "no_players_found" } });
  });
});
