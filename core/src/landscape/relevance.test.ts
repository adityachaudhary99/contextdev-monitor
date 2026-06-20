import { describe, it, expect } from "vitest";
import { categoryTerms, isRelevant } from "./relevance.js";

const p = (name: string, oneLiner: string, tags: string[] = [], positioning = "") => ({ name, oneLiner, tags, positioning });

describe("categoryTerms", () => {
  it("keeps content words, drops generic ones", () => {
    expect(categoryTerms("AI code review tools")).toEqual(["code", "review"]);   // 'ai' (<3 chars) + 'tools' (generic) dropped
    expect(categoryTerms("web scraping APIs")).toEqual(["web", "scraping"]);     // 'apis' generic
  });
});
describe("isRelevant", () => {
  it("keeps a player sharing a category content-word (word-level, not substring)", () => {
    expect(isRelevant(p("CodeRabbit", "AI code review for pull requests", ["code review"]), "AI code review tools")).toBe(true);
    expect(isRelevant(p("DeepSource", "Automated code review and static analysis"), "AI code review tools")).toBe(true);
  });
  it("drops an off-category player with zero overlap (and is not fooled by substrings)", () => {
    expect(isRelevant(p("IBM Planning Analytics", "Enterprise planning and analytics"), "AI code review tools")).toBe(false); // 'analytics' must NOT match 'ai'
    expect(isRelevant(p("DigitalOcean", "Cloud hosting and infrastructure"), "AI code review tools")).toBe(false);
  });
  it("keeps everything when the category has no content terms", () => {
    expect(isRelevant(p("Anything", ""), "the best tools")).toBe(true);
  });
});
