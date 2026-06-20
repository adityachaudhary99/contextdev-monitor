import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gradeCase } from "./grade.js";
import { buildReportCard } from "./aggregate.js";
import { renderReportCardMarkdown } from "./render.js";
import type { CorpusCase } from "./types.js";

const inline: CorpusCase[] = [
  {
    url: "https://a.com", domain: "a.com", latencyMs: 1000, credits: 11,
    groundTruth: { name: "A", oneLiner: "alpha beta gamma delta", tags: ["x", "y"], features: ["feature one"], positioning: "epsilon zeta", links: { site: "https://a.com", docs: null, pricing: null } },
    extracted: { name: "A", oneLiner: "alpha beta gamma delta", tagline: null, tags: ["x", "y"], features: ["feature one"], positioning: "epsilon zeta", links: { site: "https://a.com", docs: null, pricing: null } },
  },
  {
    url: "https://b.com", domain: "b.com", latencyMs: 3000, credits: 1, failureReason: "http_403",
    groundTruth: { name: "B", oneLiner: "x", tags: [], features: [], positioning: "y", links: { site: null, docs: null, pricing: null } },
    extracted: null,
  },
];

describe("report-card reproducibility", () => {
  it("produces a stable, deterministic report card from a fixed corpus", () => {
    const card = buildReportCard({ cases: inline, grades: inline.map(gradeCase) });
    expect(card.corpusSize).toBe(2);
    expect(card.gradedCount).toBe(1);
    expect(card.failedCount).toBe(1);
    expect(card.headlineScore).toBe(1);          // the one graded case is a perfect match
    expect(card.fieldAccuracy.name).toBe(1);
    expect(card.failures).toEqual([{ category: "extraction/http-4xx", count: 1 }]);
    // grading twice is identical (purity)
    const again = buildReportCard({ cases: inline, grades: inline.map(gradeCase) });
    expect(again).toEqual(card);
    expect(renderReportCardMarkdown(card)).toContain("Historical contract findings");
  });

  it("the committed example corpus grades + renders without throwing", () => {
    const raw = JSON.parse(readFileSync(fileURLToPath(new URL("./fixtures/corpus.json", import.meta.url)), "utf8"));
    const cases = raw.cases as CorpusCase[];
    const card = buildReportCard({ cases, grades: cases.map(gradeCase) });
    expect(card.corpusSize).toBe(cases.length);
    expect(typeof renderReportCardMarkdown(card)).toBe("string");
  });
});
