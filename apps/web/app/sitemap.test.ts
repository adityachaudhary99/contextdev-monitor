import { describe, it, expect } from "vitest";
import sitemap from "./sitemap.js";
describe("sitemap", () => {
  it("includes home, the landscape index, and curated slugs", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/landscape"))).toBe(true);
    expect(urls.some((u) => u.includes("/landscape/web-scraping-apis"))).toBe(true);
  });
});
