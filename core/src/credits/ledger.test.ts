import { describe, it, expect } from "vitest";
import { CreditLedger } from "./ledger.js";

describe("CreditLedger", () => {
  it("accumulates credit cost per recorded endpoint", () => {
    const l = new CreditLedger();
    l.record("scrapeMarkdown");
    l.record("extractStructured");
    expect(l.total()).toBe(2);
    expect(l.entries()).toHaveLength(2);
    expect(l.entries()[0]).toEqual({ endpoint: "scrapeMarkdown", cost: 1 });
  });
});
