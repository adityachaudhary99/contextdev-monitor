import { describe, it, expect } from "vitest";
import { InMemoryLandscapeStore } from "./landscape-store.js";
const ls = (category: string) => ({ category, players: [], failures: [], comparison: { dimensions: [] }, brief: "", citations: [], creditsUsed: 0, latencyMs: 0 });
describe("InMemoryLandscapeStore", () => {
  it("saves, gets, lists; miss returns null", async () => {
    const store = new InMemoryLandscapeStore();
    expect(await store.get("x")).toBeNull();
    await store.save("web-scraping-apis", ls("web scraping apis") as never);
    expect((await store.get("web-scraping-apis"))?.category).toBe("web scraping apis");
    expect(await store.list()).toEqual(["web-scraping-apis"]);
  });
});
