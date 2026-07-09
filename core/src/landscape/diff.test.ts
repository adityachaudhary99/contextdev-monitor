import { describe, it, expect } from "vitest";
import { snapshotLandscape, diffLandscapes } from "./diff.js";
import type { Landscape, PlayerProfile } from "./types.js";

const mkPlayer = (over: Partial<PlayerProfile>): PlayerProfile => ({
  name: "X", domain: "x.com", oneLiner: "", tagline: null, tags: [], features: [],
  positioning: "", links: { site: null, docs: null, pricing: null }, sourceUrl: "https://x.com",
  confidence: 1, ...over,
});
const mkLs = (players: PlayerProfile[]): Landscape => ({
  category: "web scraping apis", players, failures: [], comparison: { dimensions: [] },
  brief: "", citations: [], creditsUsed: 0, latencyMs: 0,
});

describe("snapshotLandscape", () => {
  it("extracts the diff-relevant lite fields", () => {
    const ls = mkLs([mkPlayer({ name: "Acme", domain: "acme.com", tags: ["api"], oneLiner: "scrapes",
      pricing: { free: true, startingPrice: "$49/mo", model: null }, openSource: false })]);
    const snap = snapshotLandscape(ls, "2026-06-22T00:00:00.000Z");
    expect(snap.capturedAt).toBe("2026-06-22T00:00:00.000Z");
    expect(snap.category).toBe("web scraping apis");
    expect(snap.players[0]).toEqual({
      name: "Acme", domain: "acme.com", tags: ["api"], startingPrice: "$49/mo", free: true,
      openSource: false, oneLiner: "scrapes",
    });
  });
  it("defaults missing pricing/openSource to null", () => {
    const snap = snapshotLandscape(mkLs([mkPlayer({ name: "B", domain: "b.com" })]), "t");
    expect(snap.players[0].startingPrice).toBeNull();
    expect(snap.players[0].free).toBeNull();
    expect(snap.players[0].openSource).toBeNull();
  });
  it("copies profile failures into optional failed snapshot entries", () => {
    const snap = snapshotLandscape({
      ...mkLs([]),
      failures: [{ url: "https://lost.dev", domain: "lost.dev", reason: "off_category" }],
    }, "t");
    expect(snap).toMatchObject({ failed: [{ domain: "lost.dev", reason: "off_category" }] });
  });
});

describe("diffLandscapes", () => {
  const prev = snapshotLandscape(mkLs([
    mkPlayer({ name: "Acme", domain: "acme.com", tags: ["api", "cloud"], pricing: { free: true, startingPrice: "$49/mo", model: null } }),
    mkPlayer({ name: "Globex", domain: "globex.com", tags: ["api"] }),
  ]), "2026-06-01T00:00:00.000Z");
  const curr = snapshotLandscape(mkLs([
    mkPlayer({ name: "Acme", domain: "acme.com", tags: ["api", "proxies"], pricing: { free: false, startingPrice: "$59/mo", model: null } }),
    mkPlayer({ name: "Initech", domain: "initech.com", tags: ["api"] }),
  ]), "2026-06-22T00:00:00.000Z");

  it("detects entrants and exits by domain", () => {
    const d = diffLandscapes(prev, curr);
    expect(d.entered).toEqual([{ name: "Initech", domain: "initech.com" }]);
    expect(d.exited).toEqual([{ name: "Globex", domain: "globex.com" }]);
  });
  it("splits extraction losses out of market exits", () => {
    const older = snapshotLandscape(mkLs([
      mkPlayer({ name: "Lost", domain: "lost.dev" }),
      mkPlayer({ name: "Gone", domain: "gone.dev" }),
    ]), "2026-06-01T00:00:00.000Z");
    const newer = {
      ...snapshotLandscape(mkLs([]), "2026-06-22T00:00:00.000Z"),
      failed: [{ domain: "www.lost.dev", reason: "off_category" }],
    };
    const d = diffLandscapes(older, newer);
    expect(d.exited).toEqual([{ name: "Gone", domain: "gone.dev" }]);
    expect(d).toMatchObject({ lostFromMap: [{ name: "Lost", domain: "lost.dev", reason: "off_category" }] });
  });
  it("keeps old-format snapshots without failed behaving as market exits", () => {
    const older = snapshotLandscape(mkLs([mkPlayer({ name: "Gone", domain: "gone.dev" })]), "2026-06-01T00:00:00.000Z");
    const newer = snapshotLandscape(mkLs([]), "2026-06-22T00:00:00.000Z");
    const d = diffLandscapes(older, newer);
    expect(d.exited).toEqual([{ name: "Gone", domain: "gone.dev" }]);
    expect(d).toMatchObject({ lostFromMap: [] });
  });
  it("does not set hasChanges for extraction loss alone", () => {
    const older = snapshotLandscape(mkLs([mkPlayer({ name: "Lost", domain: "lost.dev" })]), "2026-06-01T00:00:00.000Z");
    const newer = {
      ...snapshotLandscape(mkLs([]), "2026-06-22T00:00:00.000Z"),
      failed: [{ domain: "lost.dev", reason: "off_category" }],
    };
    const d = diffLandscapes(older, newer);
    expect(d.exited).toEqual([]);
    expect(d).toMatchObject({ lostFromMap: [{ name: "Lost", domain: "lost.dev", reason: "off_category" }] });
    expect(d.hasChanges).toBe(false);
  });
  it("detects pricing changes (price and free-tier)", () => {
    const d = diffLandscapes(prev, curr);
    const fields = d.pricingChanges.filter((c) => c.domain === "acme.com");
    expect(fields).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "price", from: "$49/mo", to: "$59/mo" }),
      expect.objectContaining({ field: "freeTier", from: "free tier", to: "no free tier" }),
    ]));
  });
  it("does not report price rows for equivalent formatted numeric prices", () => {
    const older = snapshotLandscape(mkLs([mkPlayer({ name: "ScraperAPI", domain: "scraperapi.com", pricing: { free: null, startingPrice: "$49/month", model: null } })]), "2026-06-01T00:00:00.000Z");
    const newer = snapshotLandscape(mkLs([mkPlayer({ name: "ScraperAPI", domain: "scraperapi.com", pricing: { free: null, startingPrice: "49", model: null } })]), "2026-06-22T00:00:00.000Z");
    expect(diffLandscapes(older, newer).pricingChanges).toEqual([]);
  });
  it("reports price rows when canonical numeric prices differ", () => {
    const older = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", pricing: { free: null, startingPrice: "$49", model: null } })]), "2026-06-01T00:00:00.000Z");
    const newer = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", pricing: { free: null, startingPrice: "$79", model: null } })]), "2026-06-22T00:00:00.000Z");
    expect(diffLandscapes(older, newer).pricingChanges).toEqual([
      expect.objectContaining({ field: "price", from: "$49", to: "$79" }),
    ]);
  });
  it("reports price rows when exactly one side is parseable and raw strings differ", () => {
    const older = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", pricing: { free: null, startingPrice: "$49", model: null } })]), "2026-06-01T00:00:00.000Z");
    const newer = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", pricing: { free: null, startingPrice: "custom pricing", model: null } })]), "2026-06-22T00:00:00.000Z");
    expect(diffLandscapes(older, newer).pricingChanges).toEqual([
      expect.objectContaining({ field: "price", from: "$49", to: "custom pricing" }),
    ]);
  });
  it("ignores free-tier rows when either side is unknown", () => {
    const older = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", pricing: { free: null, startingPrice: null, model: null } })]), "2026-06-01T00:00:00.000Z");
    const newer = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", pricing: { free: false, startingPrice: null, model: null } })]), "2026-06-22T00:00:00.000Z");
    expect(diffLandscapes(older, newer).pricingChanges).toEqual([]);
  });
  it("reports free-tier rows when both sides are known booleans and differ", () => {
    const older = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", pricing: { free: false, startingPrice: null, model: null } })]), "2026-06-01T00:00:00.000Z");
    const newer = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", pricing: { free: true, startingPrice: null, model: null } })]), "2026-06-22T00:00:00.000Z");
    expect(diffLandscapes(older, newer).pricingChanges).toEqual([
      expect.objectContaining({ field: "freeTier", from: "no free tier", to: "free tier" }),
    ]);
  });
  it("detects capability changes (tags added/removed)", () => {
    const d = diffLandscapes(prev, curr);
    const cap = d.capabilityChanges.find((c) => c.domain === "acme.com");
    expect(cap?.added).toEqual(["proxies"]);
    expect(cap?.removed).toEqual(["cloud"]);
  });
  it("cancels fuzzy capability vocabulary drift", () => {
    const older = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", tags: ["proxy rotation"] })]), "2026-06-01T00:00:00.000Z");
    const newer = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", tags: ["proxies"] })]), "2026-06-22T00:00:00.000Z");
    expect(diffLandscapes(older, newer).capabilityChanges).toEqual([]);
  });
  it("keeps genuinely new capabilities after fuzzy cancellation", () => {
    const older = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", tags: ["api"] })]), "2026-06-01T00:00:00.000Z");
    const newer = snapshotLandscape(mkLs([mkPlayer({ name: "Acme", domain: "acme.com", tags: ["api", "captcha handling"] })]), "2026-06-22T00:00:00.000Z");
    const d = diffLandscapes(older, newer);
    expect(d.capabilityChanges).toEqual([
      expect.objectContaining({ added: ["captcha handling"], removed: [] }),
    ]);
    expect(d.hasChanges).toBe(false);
  });
  it("carries the capture dates and a hasChanges flag", () => {
    const d = diffLandscapes(prev, curr);
    expect(d.fromCapturedAt).toBe("2026-06-01T00:00:00.000Z");
    expect(d.toCapturedAt).toBe("2026-06-22T00:00:00.000Z");
    expect(d.hasChanges).toBe(true);
  });
  it("reports no changes for identical snapshots", () => {
    const d = diffLandscapes(prev, prev);
    expect(d.hasChanges).toBe(false);
    expect(d.entered).toEqual([]);
    expect(d.exited).toEqual([]);
    expect(d.pricingChanges).toEqual([]);
    expect(d.capabilityChanges).toEqual([]);
  });
});
