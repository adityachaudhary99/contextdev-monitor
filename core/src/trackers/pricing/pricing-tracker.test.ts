// core/src/trackers/pricing/pricing-tracker.test.ts
import { describe, it, expect, vi } from "vitest";
import { PricingTracker } from "./pricing-tracker.js";

function fakeClient(over: Partial<Record<"scrapeMarkdown" | "webSearch", unknown>>) {
  return {
    scrapeMarkdown: vi.fn(over.scrapeMarkdown as never),
    webSearch: vi.fn(over.webSearch as never),
  } as never;
}

describe("PricingTracker.locate", () => {
  it("uses /pricing when it scrapes successfully", async () => {
    const client = fakeClient({
      scrapeMarkdown: async () => ({ ok: true, value: { url: "https://x.com/pricing", markdown: "# Pricing" } }),
    });
    const r = await new PricingTracker().locate("x.com", client);
    expect(r).toEqual({ ok: true, value: { url: "https://x.com/pricing", markdown: "# Pricing" } });
  });
  it("falls back to web search when /pricing fails", async () => {
    const client = fakeClient({
      scrapeMarkdown: async (url: string) => {
        if (url === "https://x.com/pricing") {
          return { ok: false, failure: { url: "https://x.com/pricing", reason: "http_404" } };
        }
        return { ok: true, value: { url, markdown: "# Plans" } };
      },
      webSearch: async () => ({ ok: true, value: { results: [{ title: "Plans", url: "https://x.com/plans" }] } }),
    });
    const r = await new PricingTracker().locate("x.com", client);
    expect(r).toEqual({ ok: true, value: { url: "https://x.com/plans", markdown: "# Plans" } });
  });
});
