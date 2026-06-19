import { describe, it, expect, vi } from "vitest";
import { runPricingReport } from "./track-action.js";

const fakeReport = { domain: "x.com", trackerId: "pricing", headline: "No change detected for x.com", changes: [], citations: [{ n: 1, title: "x.com pricing", url: "https://x.com/pricing" }], creditsUsed: 11, latencyMs: 1200, failures: [] };

describe("runPricingReport", () => {
  it("rejects an invalid domain without spending", async () => {
    const r = await runPricingReport({ domain: "not a domain!!", sessionId: "s1", day: "2026-06-19" }, { runTracker: vi.fn(), maintainerKey: "k", budget: { tryConsume: vi.fn(), spent: vi.fn() } as never });
    expect(r).toEqual({ ok: false, error: "bad_domain" });
  });
  it("returns demo_cap_reached when the demo budget refuses", async () => {
    const r = await runPricingReport({ domain: "x.com", sessionId: "s1", day: "2026-06-19" }, { runTracker: vi.fn(), maintainerKey: "k", budget: { tryConsume: vi.fn(async () => false), spent: vi.fn(async () => 1000) } as never });
    expect(r).toEqual({ ok: false, error: "demo_cap_reached" });
  });
  it("runs the tracker in demo mode and returns the report", async () => {
    const runTracker = vi.fn(async () => fakeReport);
    const r = await runPricingReport({ domain: "x.com", sessionId: "s1", day: "2026-06-19" }, { runTracker: runTracker as never, maintainerKey: "k", budget: { tryConsume: vi.fn(async () => true), spent: vi.fn() } as never });
    expect(r).toEqual({ ok: true, report: fakeReport });
    expect(runTracker).toHaveBeenCalledOnce();
  });
  it("errors missing_key in BYO mode with no key and no maintainer key", async () => {
    const r = await runPricingReport({ domain: "x.com", byoKey: "", sessionId: "s1", day: "2026-06-19" }, { runTracker: vi.fn(), maintainerKey: undefined, budget: { tryConsume: vi.fn(async () => true), spent: vi.fn() } as never });
    expect(r).toEqual({ ok: false, error: "missing_key" });
  });
});
