import { describe, it, expect } from "vitest";
import { collectCase } from "./collect.js";
import { CreditLedger } from "../../credits/ledger.js";

const clientFor = (ledger: CreditLedger) => ({
  scrapeMarkdown: async () => { ledger.record("scrapeMarkdown"); return { ok: true, value: { url: "u", markdown: "# x" } }; },
  extractStructured: async () => { ledger.record("extractStructured"); return { ok: true, value: { name: "Acme", oneLiner: "o", tags: ["api"], features: ["f"], positioning: "p" } }; },
}) as never;

const failClient = () => ({
  scrapeMarkdown: async () => ({ ok: false, failure: { url: "u", reason: "http_403" } }),
  extractStructured: async () => { throw new Error("should not be called"); },
}) as never;

describe("collectCase", () => {
  it("returns the raw extracted profile, measured latency, and per-page credits", async () => {
    let t = 0; const now = () => (t += 500);     // start=500, end=1000 -> 500ms
    const r = await collectCase("https://acme.com", clientFor, now);
    expect(r.extracted?.name).toBe("Acme");
    expect(r.extracted?.tags).toEqual(["api"]);   // RAW tags, not resolved/derived
    expect(r.latencyMs).toBe(500);
    expect(r.credits).toBe(11);                   // scrape 1 + extract 10
    expect(r.failureReason).toBeUndefined();
  });
  it("never throws on scrape failure — returns extracted:null + reason", async () => {
    const r = await collectCase("https://x.com", failClient);
    expect(r.extracted).toBeNull();
    expect(r.failureReason).toBe("http_403");
  });
});
