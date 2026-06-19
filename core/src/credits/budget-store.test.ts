import { describe, it, expect } from "vitest";
import { InMemoryBudgetStore } from "./budget-store.js";

describe("InMemoryBudgetStore", () => {
  it("allows spend up to the daily cap then refuses", async () => {
    const s = new InMemoryBudgetStore(3);
    expect(await s.tryConsume(2, "2026-06-19")).toBe(true);
    expect(await s.tryConsume(1, "2026-06-19")).toBe(true);
    expect(await s.tryConsume(1, "2026-06-19")).toBe(false); // would exceed
    expect(await s.spent("2026-06-19")).toBe(3);
  });
  it("tracks budget per day independently", async () => {
    const s = new InMemoryBudgetStore(2);
    expect(await s.tryConsume(2, "2026-06-19")).toBe(true);
    expect(await s.tryConsume(2, "2026-06-20")).toBe(true);
  });
});
