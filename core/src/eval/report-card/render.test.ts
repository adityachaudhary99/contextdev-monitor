import { describe, it, expect } from "vitest";
import { renderReportCardMarkdown } from "./render.js";
import type { ReportCard } from "./types.js";

const card: ReportCard = {
  corpusSize: 6, gradedCount: 5, failedCount: 1,
  fieldAccuracy: { name: 1, oneLiner: 0.8, positioning: 0.6, tagsF1: 0.5, featuresF1: 0.4, linksCorrect: 0.75 },
  headlineScore: 0.78, latencyMs: { mean: 2100, p50: 1900, p95: 3300 }, creditsPerPage: 11, totalCredits: 66,
  failures: [{ category: "extraction/http-4xx", count: 1 }],
};

describe("renderReportCardMarkdown", () => {
  it("renders summary, per-field accuracy, taxonomy, contract findings, and methodology", () => {
    const md = renderReportCardMarkdown(card);
    expect(md).toContain("# context.dev Extraction Report Card");
    expect(md).toContain("78%");                       // headline score
    expect(md).toContain("Credits / page");
    expect(md).toContain("extraction/http-4xx");       // taxonomy row
    expect(md).toContain("Historical contract findings");
    expect(md).toContain("/web/");                      // a contract finding fix
    expect(md).toContain("## Methodology");
  });
});
