import { describe, it, expect } from "vitest";
import { CreditLedger } from "./ledger.js";

describe("CreditLedger", () => {
  it("accumulates credit cost per recorded endpoint using the confirmed live costs", () => {
    const l = new CreditLedger();
    l.record("scrapeMarkdown");    // 1 credit
    l.record("extractStructured"); // 10 credits
    expect(l.total()).toBe(11);    // 1 + 10 = 11
    expect(l.entries()).toHaveLength(2);
    expect(l.entries()[0]).toEqual({ endpoint: "scrapeMarkdown", cost: 1 });
    expect(l.entries()[1]).toEqual({ endpoint: "extractStructured", cost: 10 });
  });
  it("records webSearch at 10 credits (1 per result, default 10 results)", () => {
    const l = new CreditLedger();
    l.record("webSearch");
    expect(l.total()).toBe(10);
    expect(l.entries()[0]).toEqual({ endpoint: "webSearch", cost: 10 });
  });
});
