import { describe, it, expect } from "vitest";
import { assembleReport } from "./report.js";
import { validateCitations } from "./citation-validator.js";

const base = {
  domain: "x.com", trackerId: "pricing", sourceUrl: "https://x.com/pricing", sourceTitle: "Pricing",
  creditsUsed: 2, latencyMs: 1234, failures: [],
};

describe("assembleReport", () => {
  it("summarizes a changed diff and maps each change to citation 1", () => {
    const r = assembleReport({ ...base, diff: { changed: true, changes: [{ kind: "price_changed", plan: "Pro", detail: "Pro: 2000 → 2500 USD/mo", confidence: 1 }] } });
    expect(r.headline).toMatch(/1 change/i);
    expect(r.changes[0].citation).toBe(1);
    expect(r.citations[0]).toEqual({ n: 1, title: "Pricing", url: "https://x.com/pricing" });
    expect(() => validateCitations(r)).not.toThrow();
  });
  it("says no change when the diff is empty", () => {
    const r = assembleReport({ ...base, diff: { changed: false, changes: [] } });
    expect(r.headline).toMatch(/no change/i);
  });
});

describe("validateCitations", () => {
  it("throws when a change cites a missing citation", () => {
    const bad = assembleReport({ ...base, diff: { changed: true, changes: [{ kind: "price_changed", plan: "Pro", detail: "x", confidence: 1 }] } });
    bad.citations = []; // corrupt it
    expect(() => validateCitations(bad)).toThrow();
  });
});
