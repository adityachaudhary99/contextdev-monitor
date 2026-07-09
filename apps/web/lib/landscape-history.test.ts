import { describe, it, expect } from "vitest";
import { getMarketMotion } from "./landscape-history.js";

describe("getMarketMotion", () => {
  it("getMarketMotion returns the full chronological timeline for a curated slug", () => {
    const m = getMarketMotion("web-scraping-apis");
    expect(m).not.toBeNull();
    expect(m!.entries.length).toBeGreaterThanOrEqual(1);
    expect(m!.entries[0].diff).toBeNull();
    const times = m!.entries.map((e) => e.capturedAt);
    expect([...times].sort()).toEqual(times);
  });

  it("getMarketMotion returns null for unknown slugs", () => {
    expect(getMarketMotion("not-a-slug")).toBeNull();
  });
});
