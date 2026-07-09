import { describe, it, expect } from "vitest";
import { buildMotionTimeline, diffToMarkdown } from "./motion.js";
import type { LandscapeSnapshot } from "./diff.js";
import { diffLandscapes } from "./diff.js";

const snap = (capturedAt: string, players: { name: string; domain: string; tags?: string[]; startingPrice?: string | null }[]): LandscapeSnapshot => ({
  category: "web scraping APIs", capturedAt,
  players: players.map((p) => ({ name: p.name, domain: p.domain, tags: p.tags ?? [], startingPrice: p.startingPrice ?? null, free: null, openSource: null, oneLiner: "" })),
});

describe("buildMotionTimeline", () => {
  it("returns [] for empty history", () => { expect(buildMotionTimeline([])).toEqual([]); });
  it("baseline entry has null diff; later entries diff vs previous, chronologically", () => {
    const a = snap("2026-06-22T00:00:00.000Z", [{ name: "Firecrawl", domain: "firecrawl.dev" }]);
    const b = snap("2026-07-10T00:00:00.000Z", [{ name: "Firecrawl", domain: "firecrawl.dev" }, { name: "Webdog", domain: "webdog.ai" }]);
    const tl = buildMotionTimeline([b, a]); // deliberately unsorted input
    expect(tl.map((e) => e.capturedAt)).toEqual([a.capturedAt, b.capturedAt]);
    expect(tl[0].diff).toBeNull();
    expect(tl[0].playerCount).toBe(1);
    expect(tl[1].diff?.entered).toEqual([{ name: "Webdog", domain: "webdog.ai" }]);
  });
});

describe("diffToMarkdown", () => {
  it("renders entrants/exits/pricing/capability rows", () => {
    const prev = snap("2026-06-22T00:00:00.000Z", [{ name: "Old", domain: "old.dev", startingPrice: "$49" }, { name: "Gone", domain: "gone.dev" }]);
    const curr = snap("2026-07-10T00:00:00.000Z", [{ name: "Old", domain: "old.dev", startingPrice: "$79", tags: ["ai"] }, { name: "New", domain: "new.dev" }]);
    const md = diffToMarkdown("web scraping APIs", diffLandscapes(prev, curr));
    expect(md).toContain("web scraping APIs");
    expect(md).toContain("**New** (new.dev) entered the market");
    expect(md).toContain("**Gone** (gone.dev) dropped out");
    expect(md).toContain("`$49` → `$79`");
    expect(md).toContain("+ai");
  });
  it("renders a calm line when nothing changed", () => {
    const a = snap("2026-06-22T00:00:00.000Z", [{ name: "X", domain: "x.dev" }]);
    const b = snap("2026-07-10T00:00:00.000Z", [{ name: "X", domain: "x.dev" }]);
    expect(diffToMarkdown("c", diffLandscapes(a, b))).toContain("No material changes");
  });
});
