// core/src/pipeline/run-tracker.test.ts
import { describe, it, expect, vi } from "vitest";
import { runTracker } from "./run-tracker.js";
import { PricingTracker } from "../trackers/pricing/pricing-tracker.js";
import { InMemorySnapshotStore } from "../cache/snapshot-store.js";
import { CreditLedger } from "../credits/ledger.js";

function clientFor(markdown: string, extracted: unknown) {
  return {
    scrapeMarkdown: vi.fn(async (url: string) => ({ ok: true, value: { url, markdown } })),
    webSearch: vi.fn(),
    extractStructured: vi.fn(async () => ({ ok: true, value: extracted })),
  } as never;
}
const pricing = (amount: number) => ({ plans: [{ name: "Pro", price: { amount, currency: "USD", period: "mo" }, features: ["api"], limits: {}, cta: null }] });

describe("runTracker", () => {
  it("first run reports no prior baseline and saves a snapshot", async () => {
    const store = new InMemorySnapshotStore();
    const report = await runTracker({
      tracker: new PricingTracker(), domain: "x.com", client: clientFor("# Pricing v1", pricing(20)),
      ledger: new CreditLedger(), store, day: "2026-06-19", now: () => 1000,
    });
    expect(report.headline).toMatch(/no change/i);
    expect(await store.latest("pricing", "x.com")).not.toBeNull();
  });

  it("detects a price change on the second run", async () => {
    const store = new InMemorySnapshotStore();
    const common = { tracker: new PricingTracker(), domain: "x.com", store, day: "2026-06-19", now: () => 1000 };
    await runTracker({ ...common, client: clientFor("# Pricing v1", pricing(20)), ledger: new CreditLedger() });
    const second = await runTracker({ ...common, client: clientFor("# Pricing v2 CHANGED", pricing(25)), ledger: new CreditLedger() });
    expect(second.headline).toMatch(/1 change/i);
    expect(second.changes[0].detail).toContain("2500");
  });

  it("skips extraction when the source hash is unchanged (the gate)", async () => {
    const store = new InMemorySnapshotStore();
    const c1 = clientFor("# Pricing SAME", pricing(20));
    await runTracker({ tracker: new PricingTracker(), domain: "x.com", client: c1, ledger: new CreditLedger(), store, day: "2026-06-19", now: () => 1000 });
    const c2 = clientFor("# Pricing SAME", pricing(20));
    await runTracker({ tracker: new PricingTracker(), domain: "x.com", client: c2, ledger: new CreditLedger(), store, day: "2026-06-19", now: () => 1000 });
    expect((c2 as unknown as { extractStructured: { mock: { calls: unknown[] } } }).extractStructured.mock.calls).toHaveLength(0);
  });
});
