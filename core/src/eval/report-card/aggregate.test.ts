import { describe, it, expect } from "vitest";
import { buildReportCard } from "./aggregate.js";
import { gradeCase } from "./grade.js";
import type { CorpusCase } from "./types.js";

const good: CorpusCase = {
  url: "https://a.com", domain: "a.com", latencyMs: 1000, credits: 11,
  groundTruth: { name: "A", oneLiner: "alpha beta gamma", tags: ["x"], features: ["feature one"], positioning: "delta epsilon", links: { site: "https://a.com", docs: null, pricing: null } },
  extracted: { name: "A", oneLiner: "alpha beta gamma", tagline: null, tags: ["x"], features: ["feature one"], positioning: "delta epsilon", links: { site: "https://a.com", docs: null, pricing: null } },
};
const failed: CorpusCase = {
  url: "https://b.com", domain: "b.com", latencyMs: 3000, credits: 1, failureReason: "http_403",
  groundTruth: { name: "B", oneLiner: "x", tags: [], features: [], positioning: "y", links: { site: null, docs: null, pricing: null } },
  extracted: null,
};

describe("buildReportCard", () => {
  it("aggregates accuracy, latency percentiles, credits/page, and failure taxonomy", () => {
    const cases = [good, failed];
    const card = buildReportCard({ cases, grades: cases.map(gradeCase) });
    expect(card.corpusSize).toBe(2);
    expect(card.gradedCount).toBe(1);
    expect(card.failedCount).toBe(1);
    expect(card.fieldAccuracy.name).toBe(1);      // the one graded case is a name hit
    expect(card.headlineScore).toBeGreaterThan(0);
    expect(card.totalCredits).toBe(12);
    expect(card.creditsPerPage).toBe(6);          // 12 / 2 pages
    expect(card.latencyMs.p95).toBe(3000);
    expect(card.failures).toContainEqual({ category: "extraction/http-4xx", count: 1 });
  });
});
