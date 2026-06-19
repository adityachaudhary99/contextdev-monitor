import { describe, it, expect, vi } from "vitest";
import { InMemorySnapshotStore, InMemoryBudgetStore, type BudgetStore } from "@contextdev/core";
import { runPricingReport } from "./track-action.js";
import { SESSION_DAILY_CAP } from "./budget.js";

const fakeReport = { domain: "x.com", trackerId: "pricing", headline: "No change detected for x.com", changes: [], citations: [{ n: 1, title: "x.com pricing", url: "https://x.com/pricing" }], creditsUsed: 11, latencyMs: 1200, failures: [] };

describe("runPricingReport", () => {
  it("rejects an invalid domain without spending", async () => {
    const r = await runPricingReport(
      { domain: "not a domain!!", sessionId: "s1", day: "2026-06-19" },
      {
        runTracker: vi.fn(),
        maintainerKey: "k",
        budget: { tryConsume: vi.fn(), spent: vi.fn() } as never,
        sessionBudget: { tryConsume: vi.fn(), spent: vi.fn() } as never,
        store: new InMemorySnapshotStore(),
      }
    );
    expect(r).toEqual({ ok: false, error: "bad_domain" });
  });
  it("returns demo_cap_reached when the demo budget refuses", async () => {
    const r = await runPricingReport(
      { domain: "x.com", sessionId: "s1", day: "2026-06-19" },
      {
        runTracker: vi.fn(),
        maintainerKey: "k",
        budget: { tryConsume: vi.fn(async () => false), spent: vi.fn(async () => 500) } as never,
        sessionBudget: { tryConsume: vi.fn(async () => true), spent: vi.fn(async () => 0) } as never,
        store: new InMemorySnapshotStore(),
      }
    );
    expect(r).toEqual({ ok: false, error: "demo_cap_reached" });
  });
  it("runs the tracker in demo mode and returns the report", async () => {
    const runTracker = vi.fn(async () => fakeReport);
    const r = await runPricingReport(
      { domain: "x.com", sessionId: "s1", day: "2026-06-19" },
      {
        runTracker: runTracker as never,
        maintainerKey: "k",
        budget: { tryConsume: vi.fn(async () => true), spent: vi.fn(async () => 0) } as never,
        sessionBudget: { tryConsume: vi.fn(async () => true), spent: vi.fn(async () => 0) } as never,
        store: new InMemorySnapshotStore(),
      }
    );
    expect(r).toEqual({ ok: true, report: fakeReport });
    expect(runTracker).toHaveBeenCalledOnce();
  });
  it("errors missing_key in BYO mode with no key and no maintainer key", async () => {
    const r = await runPricingReport(
      { domain: "x.com", byoKey: "", sessionId: "s1", day: "2026-06-19" },
      {
        runTracker: vi.fn(),
        maintainerKey: undefined,
        budget: { tryConsume: vi.fn(async () => true), spent: vi.fn() } as never,
        sessionBudget: { tryConsume: vi.fn(), spent: vi.fn() } as never,
        store: new InMemorySnapshotStore(),
      }
    );
    expect(r).toEqual({ ok: false, error: "missing_key" });
  });
  it("passes the injected store to runTracker", async () => {
    const runTracker = vi.fn(async () => fakeReport);
    const store = new InMemorySnapshotStore();
    const r = await runPricingReport(
      { domain: "x.com", sessionId: "s1", day: "2026-06-19" },
      {
        runTracker: runTracker as never,
        maintainerKey: "k",
        budget: { tryConsume: vi.fn(async () => true), spent: vi.fn(async () => 0) } as never,
        sessionBudget: { tryConsume: vi.fn(async () => true), spent: vi.fn(async () => 0) } as never,
        store,
      }
    );
    expect(r).toEqual({ ok: true, report: fakeReport });
    expect(runTracker).toHaveBeenCalledWith(expect.objectContaining({ store }));
  });
  it("returns demo_cap_reached when the per-session cap is exhausted", async () => {
    // sessionBudget.spent(sessionKey) returns SESSION_DAILY_CAP (63) -> no room
    // global budget.spent(day) returns 0 -> has room
    const sessionBudgetMock: BudgetStore = {
      tryConsume: vi.fn(async () => false),
      spent: vi.fn(async () => 63), // full
    };
    const globalBudgetMock: BudgetStore = {
      tryConsume: vi.fn(async () => true),
      spent: vi.fn(async () => 0), // has room
    };
    const r = await runPricingReport(
      { domain: "x.com", sessionId: "s1", day: "2026-06-19" },
      {
        runTracker: vi.fn(),
        maintainerKey: "k",
        budget: globalBudgetMock,
        sessionBudget: sessionBudgetMock,
        store: new InMemorySnapshotStore(),
      }
    );
    expect(r).toEqual({ ok: false, error: "demo_cap_reached" });
  });
  it("consumes the global demo budget exactly once (not double-charged)", async () => {
    const globalBudget = new InMemoryBudgetStore(500);
    const sessionBudgetInst = new InMemoryBudgetStore(SESSION_DAILY_CAP);
    const runTracker = vi.fn(async () => fakeReport);
    const r = await runPricingReport(
      { domain: "x.com", sessionId: "s1", day: "2026-06-19" },
      {
        runTracker: runTracker as never,
        maintainerKey: "k",
        budget: globalBudget,
        sessionBudget: sessionBudgetInst,
        store: new InMemorySnapshotStore(),
      }
    );
    expect(r).toEqual({ ok: true, report: fakeReport });
    // Global budget debited exactly ESTIMATED_MAX_COST (21), not 2x
    expect(await globalBudget.spent("2026-06-19")).toBe(21);
    // Session budget also debited once
    expect(await sessionBudgetInst.spent("s1::2026-06-19")).toBe(21);
  });
});
