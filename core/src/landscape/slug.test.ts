import { describe, it, expect } from "vitest";
import { slugify, deslugify } from "./slug.js";
describe("slugify", () => {
  it("lowercases, hyphenates, strips punctuation, expands &, collapses", () => {
    expect(slugify("AI Code-Review Tools")).toBe("ai-code-review-tools");
    expect(slugify("  Web Scraping APIs  ")).toBe("web-scraping-apis");
    expect(slugify("CI/CD & DevOps")).toBe("ci-cd-and-devops");
  });
});
describe("deslugify", () => {
  it("turns a slug back into a readable category", () => {
    expect(deslugify("web-scraping-apis")).toBe("web scraping apis");
  });
});
