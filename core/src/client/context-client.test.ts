// core/src/client/context-client.test.ts
import { describe, it, expect, vi } from "vitest";
import { ContextClient } from "./context-client.js";
import { CreditLedger } from "../credits/ledger.js";
import { InMemoryBudgetStore } from "../credits/budget-store.js";

function deps(fetchFn: typeof fetch, cap = 100) {
  return {
    apiKey: "k", fetchFn, ledger: new CreditLedger(),
    budget: new InMemoryBudgetStore(cap), day: "2026-06-19",
    sleep: async () => {}, rng: () => 0,
  };
}
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

describe("ContextClient", () => {
  it("returns scraped markdown and records one credit", async () => {
    const fetchFn = vi.fn(async () => json({ url: "https://x.com/pricing", markdown: "# Pricing" }));
    const d = deps(fetchFn as unknown as typeof fetch);
    const c = new ContextClient(d);
    const r = await c.scrapeMarkdown("https://x.com/pricing");
    expect(r).toEqual({ ok: true, value: { url: "https://x.com/pricing", markdown: "# Pricing" } });
    expect(d.ledger.total()).toBe(1);
  });

  it("retries on 429 honoring Retry-After, then succeeds", async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce(json({}, 429, { "retry-after": "1" }))
      .mockResolvedValueOnce(json({ url: "u", markdown: "ok" }));
    const c = new ContextClient(deps(fetchFn as unknown as typeof fetch));
    const r = await c.scrapeMarkdown("u");
    expect(r.ok).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("never throws on a 500 — returns a SourceFailure", async () => {
    const fetchFn = vi.fn(async () => json({ error: "boom" }, 500));
    const r = await new ContextClient(deps(fetchFn as unknown as typeof fetch)).scrapeMarkdown("u");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure.reason).toContain("500");
  });

  it("refuses (no fetch) when the budget is exceeded", async () => {
    const fetchFn = vi.fn(async () => json({ url: "u", markdown: "x" }));
    const c = new ContextClient(deps(fetchFn as unknown as typeof fetch, 0));
    const r = await c.scrapeMarkdown("u");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure.reason).toBe("budget_exceeded");
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
