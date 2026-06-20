import { describe, it, expect } from "vitest";
import { gradeCase, textGrade, exactSetScore, fuzzySetScore, linkGrade } from "./grade.js";
import type { CorpusCase, ProfileExtractLike } from "./grade-test-helpers.js";

const ex = (over: Partial<ProfileExtractLike> = {}): CorpusCase["extracted"] => ({
  name: "Firecrawl", oneLiner: "Turn websites into LLM-ready markdown data", tagline: null,
  tags: ["api", "markdown"], features: ["Markdown output", "JS rendering"], positioning: "Developer scraping for AI",
  links: { site: "https://firecrawl.dev", docs: "https://docs.firecrawl.dev", pricing: null }, ...over,
});
const gt: CorpusCase["groundTruth"] = {
  name: "Firecrawl", oneLiner: "Turn any website into clean LLM-ready markdown", tags: ["api", "markdown", "crawl"],
  features: ["Markdown & structured output", "JavaScript rendering"], positioning: "Developer-friendly scraping for AI workloads",
  links: { site: "https://firecrawl.dev", docs: "https://docs.firecrawl.dev", pricing: "https://firecrawl.dev/pricing" },
};

describe("textGrade", () => {
  it("hit when >=50% of truth content-words are recalled, miss when 0, partial between", () => {
    expect(textGrade("clean llm-ready markdown website", "Turn any website into clean LLM-ready markdown")).toBe("hit");
    expect(textGrade("totally unrelated words here", "Turn any website into clean LLM-ready markdown")).toBe("miss");
    expect(textGrade("", "anything here")).toBe("miss");
  });
});
describe("exactSetScore", () => {
  it("computes precision/recall/f1 on normalized sets", () => {
    const s = exactSetScore(["api", "markdown"], ["api", "markdown", "crawl"]);
    expect(s.recall).toBe(0.67);
    expect(s.precision).toBe(1);
  });
});
describe("fuzzySetScore", () => {
  it("matches features by token overlap, not exact string", () => {
    const s = fuzzySetScore(["Markdown output", "JS rendering"], ["Markdown & structured output", "JavaScript rendering"]);
    expect(s.recall).toBeGreaterThan(0); // "Markdown output" fuzzy-matches "Markdown & structured output"
  });
});
describe("linkGrade", () => {
  it("correct on host match, wrong on mismatch, missing when truth present but extracted null, n/a when no truth", () => {
    expect(linkGrade("https://firecrawl.dev/p", "https://www.firecrawl.dev")).toBe("correct");
    expect(linkGrade("https://other.com", "https://firecrawl.dev")).toBe("wrong");
    expect(linkGrade(null, "https://firecrawl.dev/pricing")).toBe("missing");
    expect(linkGrade(null, null)).toBe("n/a");
  });
});
describe("gradeCase", () => {
  it("grades a good extraction with a high fieldsCaptured", () => {
    const g = gradeCase({ url: "https://firecrawl.dev", domain: "firecrawl.dev", groundTruth: gt, extracted: ex() });
    expect(g.graded).toBe(true);
    expect(g.name).toBe("hit");
    expect(g.fieldsCaptured).toBeGreaterThanOrEqual(0.5);
  });
  it("a failed extraction (no output) grades as un-graded, all-miss, never throws", () => {
    const g = gradeCase({ url: "https://x.com", domain: "x.com", groundTruth: gt, extracted: null, failureReason: "http_403" });
    expect(g.graded).toBe(false);
    expect(g.name).toBe("miss");
    expect(g.fieldsCaptured).toBe(0);
  });
});
