import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateAndPersist, buildWatchReport } from "./watch.js";
import type { Landscape } from "@contextdev/core";

const fakeLandscape = (category: string, players: { name: string; domain: string }[]): Landscape => ({
  category,
  failures: [],
  comparison: { dimensions: [] },
  brief: "",
  citations: [],
  creditsUsed: 10,
  latencyMs: 100,
  players: players.map((p) => ({
    name: p.name,
    domain: p.domain,
    oneLiner: "",
    tagline: null,
    tags: [],
    features: [],
    positioning: "",
    links: { site: null, docs: null, pricing: null },
    sourceUrl: `https://${p.domain}`,
    confidence: 1,
  })),
});

const tmpData = () => {
  const d = mkdtempSync(join(tmpdir(), "watch-"));
  mkdirSync(join(d, "landscapes"));
  mkdirSync(join(d, "landscape-history"));
  return d;
};

describe("generateAndPersist", () => {
  it("writes the landscape JSON, appends history, and returns null diff at baseline", async () => {
    const dataDir = tmpData();
    const r = await generateAndPersist("web scraping APIs", {
      generate: async (c) => fakeLandscape(c, [{ name: "Firecrawl", domain: "firecrawl.dev" }]),
      dataDir,
      capturedAt: "2026-07-10T00:00:00.000Z",
    });

    expect(r.slug).toBe("web-scraping-apis");
    expect(r.diff).toBeNull();
    expect(JSON.parse(readFileSync(join(dataDir, "landscapes/web-scraping-apis.json"), "utf8")).category).toBe("web scraping APIs");
    expect(JSON.parse(readFileSync(join(dataDir, "landscape-history/web-scraping-apis.json"), "utf8"))).toHaveLength(1);
  });

  it("diffs against the existing latest history entry", async () => {
    const dataDir = tmpData();
    writeFileSync(join(dataDir, "landscape-history/web-scraping-apis.json"), JSON.stringify([{
      category: "web scraping APIs",
      capturedAt: "2026-06-22T00:00:00.000Z",
      players: [{ name: "Firecrawl", domain: "firecrawl.dev", tags: [], startingPrice: null, free: null, openSource: null, oneLiner: "" }],
    }]));

    const r = await generateAndPersist("web scraping APIs", {
      generate: async (c) => fakeLandscape(c, [
        { name: "Firecrawl", domain: "firecrawl.dev" },
        { name: "Webdog", domain: "webdog.ai" },
      ]),
      dataDir,
      capturedAt: "2026-07-10T00:00:00.000Z",
    });

    expect(r.diff?.entered).toEqual([{ name: "Webdog", domain: "webdog.ai" }]);
    expect(JSON.parse(readFileSync(join(dataDir, "landscape-history/web-scraping-apis.json"), "utf8"))).toHaveLength(2);
  });
});

describe("buildWatchReport", () => {
  const ok = (diff: unknown): { slug: string; landscape: Landscape; diff: never } =>
    ({ slug: "s", landscape: fakeLandscape("c", []), diff }) as never;

  it("hasChanges=false when all diffs are null or changeless", () => {
    const { markdown, hasChanges } = buildWatchReport([{ category: "c", result: ok(null) }]);

    expect(hasChanges).toBe(false);
    expect(markdown).toContain("baseline");
  });

  it("includes diffToMarkdown sections and failure lines; hasChanges=true on any real change", () => {
    const diff = {
      fromCapturedAt: "2026-06-22T00:00:00.000Z",
      toCapturedAt: "2026-07-10T00:00:00.000Z",
      entered: [{ name: "Webdog", domain: "webdog.ai" }],
      exited: [],
      lostFromMap: [],
      pricingChanges: [],
      capabilityChanges: [],
      hasChanges: true,
    };

    const { markdown, hasChanges } = buildWatchReport([
      { category: "web scraping APIs", result: ok(diff) },
      { category: "headless CMS", result: { error: "boom" } },
    ]);

    expect(hasChanges).toBe(true);
    expect(markdown).toContain("**Webdog** (webdog.ai) entered the market");
    expect(markdown).toContain("headless CMS");
    expect(markdown).toContain("boom");
  });
});
