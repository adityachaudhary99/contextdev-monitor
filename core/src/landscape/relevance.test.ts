import { describe, it, expect } from "vitest";
import { categoryTerms, isRelevant } from "./relevance.js";
const p = (name: string, oneLiner: string, tags: string[] = [], positioning = "") => ({ name, oneLiner, tags, positioning });

describe("categoryTerms", () => {
  it("keeps content words incl. open/source, drops generic + short", () => {
    expect(categoryTerms("AI code review tools")).toEqual(["code", "review"]);
    expect(categoryTerms("open source models")).toEqual(["open", "source", "models"]);
  });
});
describe("isRelevant (>= half the content terms)", () => {
  it("keeps a genuine open-source model provider", () => {
    expect(isRelevant(p("Fireworks", "fastest inference for open source models", ["open source models"]), "open source models")).toBe(true);
  });
  it("drops a player that only matches one of three terms", () => {
    expect(isRelevant(p("IBM Planning Analytics", "AI-powered planning; eliminate manual models"), "open source models")).toBe(false); // only "models"
  });
  it("single/two-word categories still need their term(s)", () => {
    expect(isRelevant(p("CodeRabbit", "AI code review for pull requests"), "AI code review tools")).toBe(true); // code+review >= 1
    expect(isRelevant(p("DigitalOcean", "Cloud hosting and infrastructure"), "AI code review tools")).toBe(false);
  });
  it("keeps everything when the category has no content terms", () => {
    expect(isRelevant(p("Anything", ""), "the best tools")).toBe(true);
  });
});
