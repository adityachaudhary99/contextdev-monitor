import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runEvalCase } from "./harness.js";

const load = (f: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${f}`, import.meta.url)), "utf8"));

describe("runEvalCase", () => {
  it("detects exactly the expected change kinds on the firecrawl fixtures", () => {
    const res = runEvalCase({
      name: "firecrawl-standard-price-bump",
      t1: load("pricing-firecrawl-t1.json"),
      t2: load("pricing-firecrawl-t2.json"),
      expectChangedKinds: ["price_changed"],
    });
    expect(res.parsed).toBe(true);
    expect(res.detectedKinds).toEqual(["price_changed"]);
    expect(res.pass).toBe(true);
  });
});
