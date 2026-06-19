import { describe, it, expect } from "vitest";
import { assembleReport } from "./report.js";
import { validateCitations } from "./citation-validator.js";

const base = {
  domain: "x.com", trackerId: "pricing", sourceUrl: "https://x.com/pricing", sourceTitle: "Pricing",
  creditsUsed: 2, latencyMs: 1234, failures: [],
};

describe("assembleReport", () => {
  it("summarizes a changed diff and maps each change to citation 1", () => {
    const r = assembleReport({ ...base, diff: { changed: true, changes: [{ kind: "price_changed", plan: "Pro", detail: "Pro: 2000 → 2500 USD/mo", confidence: 1 }] }, priorExisted: true });
    expect(r.headline).toMatch(/1 change/i);
    expect(r.changes[0].citation).toBe(1);
    expect(r.citations[0]).toEqual({ n: 1, title: "Pricing", url: "https://x.com/pricing" });
    expect(() => validateCitations(r)).not.toThrow();
  });
  it("says no change when the diff is empty", () => {
    const r = assembleReport({ ...base, diff: { changed: false, changes: [] }, priorExisted: true });
    expect(r.headline).toMatch(/no change/i);
  });
});

describe("validateCitations", () => {
  it("throws when a change cites a missing citation", () => {
    const bad = assembleReport({ ...base, diff: { changed: true, changes: [{ kind: "price_changed", plan: "Pro", detail: "x", confidence: 1 }] }, priorExisted: true });
    bad.citations = []; // corrupt it
    expect(() => validateCitations(bad)).toThrow();
  });
});

const pricing = { plans: [{ name: "Pro", amountMinor: 2000, currency: "USD", period: "mo" as const, features: ["api"], limits: {} }] };
const base2 = { domain: "x.com", trackerId: "pricing", sourceUrl: "https://x.com/pricing", sourceTitle: "Pricing", creditsUsed: 11, latencyMs: 1200, failures: [] };

describe("assembleReport status", () => {
  it("baseline: pricing, no prior, no changes", () => {
    const r = assembleReport({ ...base2, diff: { changed: false, changes: [] }, pricing, priorExisted: false });
    expect(r.status).toBe("baseline");
    expect(r.pricing?.plans[0].name).toBe("Pro");
    expect(r.headline).toMatch(/baseline captured for x\.com/i);
    expect(r.headline).toMatch(/1 plan/i);
    expect(() => validateCitations(r)).not.toThrow();
  });
  it("no_change: pricing, prior existed, no changes", () => {
    const r = assembleReport({ ...base2, diff: { changed: false, changes: [] }, pricing, priorExisted: true });
    expect(r.status).toBe("no_change");
    expect(r.headline).toMatch(/no change since last check/i);
  });
  it("changed: a price change", () => {
    const r = assembleReport({ ...base2, diff: { changed: true, changes: [{ kind: "price_changed", plan: "Pro", detail: "Pro: 2000 → 2500 USD/mo", confidence: 1 }] }, pricing, priorExisted: true });
    expect(r.status).toBe("changed");
    expect(r.headline).toMatch(/1 change detected for x\.com/i);
    expect(r.changes[0].citation).toBe(1);
  });
  it("error: a failure, no pricing", () => {
    const r = assembleReport({ ...base2, diff: { changed: false, changes: [] }, failures: [{ url: "https://x.com/pricing", reason: "http_403" }], priorExisted: false });
    expect(r.status).toBe("error");
    expect(r.pricing).toBeUndefined();
    expect(r.headline).toMatch(/couldn't read x\.com/i);
  });
});
