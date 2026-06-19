// core/src/client/context-client.test.ts
import { describe, it, expect, vi } from "vitest";
import { ContextClient } from "./context-client.js";
import { CreditLedger } from "../credits/ledger.js";
import { InMemoryBudgetStore } from "../credits/budget-store.js";
import { BASE_URL, PATHS } from "./paths.js";

function deps(fetchFn: typeof fetch, cap = 100) {
  return {
    apiKey: "k", fetchFn, ledger: new CreditLedger(),
    budget: new InMemoryBudgetStore(cap), day: "2026-06-19",
    sleep: async () => {}, rng: () => 0,
  };
}
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

describe("ContextClient.scrapeMarkdown", () => {
  it("issues a GET to /web/scrape/markdown?url=... and returns { url, markdown }", async () => {
    const fetchFn = vi.fn(async () => json({ success: true, url: "https://x.com/pricing", markdown: "# Pricing" }));
    const d = deps(fetchFn as unknown as typeof fetch);
    const c = new ContextClient(d);
    const r = await c.scrapeMarkdown("https://x.com/pricing");
    expect(r).toEqual({ ok: true, value: { success: true, url: "https://x.com/pricing", markdown: "# Pricing" } });
    expect(d.ledger.total()).toBe(1);
    // Must be a GET, not a POST
    const [url, opts] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(opts.method).toBe("GET");
    expect(opts.body).toBeUndefined();
    // URL must include the /web/ prefix and query-encode the target URL
    expect(url).toContain(`${BASE_URL}${PATHS.scrapeMarkdown}?`);
    expect(url).toContain("url=");
    expect(url).toContain(encodeURIComponent("https://x.com/pricing"));
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

  it("exhausts all attempts on 429 every time → returns http_429", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      json({}, 429, { "retry-after": "0" })
    );
    const c = new ContextClient(deps(fetchFn as unknown as typeof fetch));
    const r = await c.scrapeMarkdown("u");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure.reason).toBe("http_429");
    expect(fetchFn).toHaveBeenCalledTimes(4);
  });

  it("exhausts all attempts on network error → returns network_error: prefix", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    const c = new ContextClient(deps(fetchFn as unknown as typeof fetch));
    const r = await c.scrapeMarkdown("u");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure.reason.startsWith("network_error:")).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(4);
  });
});

describe("ContextClient.webSearch", () => {
  it("issues a POST to /web/search with {query} body and returns results", async () => {
    const fetchFn = vi.fn(async () =>
      json({ results: [{ url: "https://x.com/pricing", title: "Pricing" }], query: "x pricing" }),
    );
    const d = deps(fetchFn as unknown as typeof fetch);
    const c = new ContextClient(d);
    const r = await c.webSearch("x pricing");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.results[0].url).toBe("https://x.com/pricing");
      expect(r.value.results[0].title).toBe("Pricing");
    }
    const [url, opts] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(opts.method).toBe("POST");
    expect(url).toBe(`${BASE_URL}${PATHS.webSearch}`);
    const body = JSON.parse(opts.body as string);
    expect(body).toEqual({ query: "x pricing" });
  });

  it("records 10 credits (1 per result, default 10 results)", async () => {
    const fetchFn = vi.fn(async () =>
      json({ results: [{ url: "u", title: "t" }], query: "q" }),
    );
    const d = deps(fetchFn as unknown as typeof fetch);
    await new ContextClient(d).webSearch("q");
    expect(d.ledger.total()).toBe(10);
  });

  it("is blocked by budget when fewer than 10 credits remain", async () => {
    const fetchFn = vi.fn(async () => json({ results: [] }));
    const c = new ContextClient(deps(fetchFn as unknown as typeof fetch, 5)); // cap=5, cost=10
    const r = await c.webSearch("q");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure.reason).toBe("budget_exceeded");
    expect(fetchFn).not.toHaveBeenCalled();
  });
});

describe("ContextClient.extractStructured", () => {
  it("issues a POST to /web/extract and unwraps .data from the response", async () => {
    const plans = { plans: [{ name: "Pro", price: { amount: 20, currency: "USD", period: "mo" }, features: [], cta: null }] };
    const fetchFn = vi.fn(async () =>
      json({ status: "ok", url: "https://x.com/pricing", data: plans }),
    );
    const d = deps(fetchFn as unknown as typeof fetch);
    const r = await new ContextClient(d).extractStructured("https://x.com/pricing", { type: "object" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual(plans); // value is .data, not the wrapper
    const [url, opts] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(opts.method).toBe("POST");
    expect(url).toBe(`${BASE_URL}${PATHS.extractStructured}`);
    const body = JSON.parse(opts.body as string);
    expect(body.url).toBe("https://x.com/pricing");
    expect(body.schema).toEqual({ type: "object" });
  });

  it("records 10 credits for extractStructured", async () => {
    const fetchFn = vi.fn(async () => json({ status: "ok", data: {} }));
    const d = deps(fetchFn as unknown as typeof fetch);
    await new ContextClient(d).extractStructured("u", {});
    expect(d.ledger.total()).toBe(10);
  });
});
