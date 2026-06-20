// core/src/landscape/profile-schema.test.ts
import { describe, it, expect } from "vitest";
import { ProfileSchema } from "./profile-schema.js";

describe("ProfileSchema", () => {
  it("parses a well-formed extracted profile", () => {
    const r = ProfileSchema.parse({
      name: "Firecrawl", oneLiner: "Web scraping API", tagline: null,
      tags: ["scraping", "api"], features: ["markdown", "crawl"], positioning: "dev-first",
      links: { site: "https://firecrawl.dev", docs: null, pricing: null },
    });
    expect(r.name).toBe("Firecrawl");
    expect(r.tags).toContain("api");
  });
  it("defaults missing arrays/links to empty/null", () => {
    const r = ProfileSchema.parse({ name: "X", oneLiner: "y", positioning: "z" });
    expect(r.tags).toEqual([]);
    expect(r.features).toEqual([]);
    expect(r.links.site).toBeNull();
  });
});
