import { describe, it, expect } from "vitest";
import { computeBackoffMs } from "./backoff.js";

describe("computeBackoffMs", () => {
  it("grows exponentially within the jitter envelope", () => {
    const a1 = computeBackoffMs(1, { rng: () => 1 }); // full envelope
    const a2 = computeBackoffMs(2, { rng: () => 1 });
    expect(a1).toBe(500);
    expect(a2).toBe(1000);
  });
  it("applies full jitter (rng=0 => 0 added)", () => {
    expect(computeBackoffMs(3, { rng: () => 0 })).toBe(0);
  });
  it("never returns less than retryAfterMs", () => {
    expect(computeBackoffMs(1, { retryAfterMs: 5000, rng: () => 0 })).toBe(5000);
  });
  it("clamps to capMs", () => {
    expect(computeBackoffMs(20, { rng: () => 1, capMs: 30000 })).toBe(30000);
  });
});
