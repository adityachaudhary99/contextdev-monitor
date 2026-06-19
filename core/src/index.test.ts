// core/src/index.test.ts
import { describe, it, expect } from "vitest";
import * as core from "./index.js";

describe("public API surface", () => {
  it("exports the building blocks", () => {
    for (const name of ["ContextClient", "CreditLedger", "InMemoryBudgetStore", "InMemorySnapshotStore", "PricingTracker", "runTracker"]) {
      expect(core).toHaveProperty(name);
    }
  });
});
