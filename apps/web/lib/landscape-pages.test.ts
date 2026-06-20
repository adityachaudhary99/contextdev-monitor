import { describe, it, expect } from "vitest";
import { getOrGenerateLandscape } from "./landscape-pages.js";

const ls = (category: string) => ({ category, players: [], failures: [], comparison: { dimensions: [] }, brief: "", citations: [], creditsUsed: 0, latencyMs: 0 });

describe("getOrGenerateLandscape", () => {
  it("returns a curated landscape without generating", async () => {
    const r = await getOrGenerateLandscape("web-scraping-apis", { generate: async () => { throw new Error("should not generate"); } });
    expect(r?.category).toBe("web scraping APIs");
  });
  it("generates + caches an uncurated slug, then serves from cache", async () => {
    let calls = 0;
    const generate = async (c: string) => { calls++; return { ok: true as const, landscape: ls(c) as never }; };
    const r1 = await getOrGenerateLandscape("vector-databases", { generate });
    expect(r1?.category).toBe("vector databases");
    await getOrGenerateLandscape("vector-databases", { generate });
    expect(calls).toBe(1); // second call served from the store cache
  });
  it("returns null when generation fails", async () => {
    const r = await getOrGenerateLandscape("nope-unique-xyz", { generate: async () => ({ ok: false as const, error: "demo_cap_reached" }) });
    expect(r).toBeNull();
  });
});
