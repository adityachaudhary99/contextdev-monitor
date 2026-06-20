import { describe, it, expect, vi } from "vitest";
import { runLandscapeReport } from "./landscape-action.js";
import { InMemoryBudgetStore } from "@contextdev/core";

const fakeLandscape = { category: "x", players: [], failures: [], comparison: { dimensions: [] }, brief: "b", citations: [], creditsUsed: 0, latencyMs: 1 };
const deps = (over = {}) => ({ runLandscape: vi.fn(async () => fakeLandscape), maintainerKey: "k",
  budget: new InMemoryBudgetStore(1000), sessionBudget: new InMemoryBudgetStore(1000), ...over });

describe("runLandscapeReport", () => {
  it("rejects an empty category without spending", async () => {
    const r = await runLandscapeReport({ category: "  ", sessionId: "s", day: "2026-06-20" }, deps());
    expect(r).toEqual({ ok: false, error: "bad_category" });
  });
  it("returns the landscape on success (demo)", async () => {
    const d = deps();
    const r = await runLandscapeReport({ category: "scraping apis", sessionId: "s", day: "2026-06-20" }, d);
    expect(r).toEqual({ ok: true, landscape: fakeLandscape });
    expect(d.runLandscape).toHaveBeenCalledOnce();
  });
  it("demo_cap_reached when the shared budget refuses", async () => {
    const r = await runLandscapeReport({ category: "x", sessionId: "s", day: "2026-06-20" },
      deps({ budget: new InMemoryBudgetStore(0) }));
    expect(r).toEqual({ ok: false, error: "demo_cap_reached" });
  });
  it("missing_key in BYO mode with empty key and no maintainer key", async () => {
    const r = await runLandscapeReport({ category: "x", byoKey: "", sessionId: "s", day: "2026-06-20" },
      deps({ maintainerKey: undefined }));
    expect(r).toEqual({ ok: false, error: "missing_key" });
  });
});
