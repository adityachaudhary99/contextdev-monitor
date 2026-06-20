import { describe, it, expect } from "vitest";
import { generateStaticParams, generateMetadata } from "./page.js";
describe("landscape/[slug]", () => {
  it("generateStaticParams returns the curated slugs", async () => {
    const params = await generateStaticParams();
    expect(params.some((p) => p.slug === "web-scraping-apis")).toBe(true);
  });
  it("curated slug → indexable metadata; unknown slug → noindex", async () => {
    const curated = await generateMetadata({ params: Promise.resolve({ slug: "web-scraping-apis" }) });
    expect(String(curated.title)).toMatch(/landscape/i);
    expect(curated.robots).toBeUndefined();
    const unknown = await generateMetadata({ params: Promise.resolve({ slug: "totally-unknown-xyz" }) });
    expect((unknown.robots as { index: boolean }).index).toBe(false);
  });
});
