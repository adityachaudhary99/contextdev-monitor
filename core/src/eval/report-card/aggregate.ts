// core/src/eval/report-card/aggregate.ts
import type { CorpusCase, CaseGrade, ReportCard, FailureCategory } from "./types.js";
import { classifyFailure } from "./taxonomy.js";

const round = (x: number) => Math.round(x * 100) / 100;
const mean = (xs: number[]) => (xs.length ? round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
function percentile(xs: number[], p: number): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

export function buildReportCard(input: { cases: CorpusCase[]; grades: CaseGrade[] }): ReportCard {
  const { cases, grades } = input;
  const graded = grades.filter((g) => g.graded);
  const failedCases = cases.filter((c) => !c.extracted);
  const latencies = cases.map((c) => c.latencyMs).filter((x): x is number => typeof x === "number");
  const totalCredits = cases.map((c) => c.credits ?? 0).reduce((a, b) => a + b, 0);

  const linksCorrect = mean(graded.map((g) => {
    const slots = [g.links.site, g.links.docs, g.links.pricing].filter((l) => l !== "n/a");
    return slots.length === 0 ? 1 : slots.filter((l) => l === "correct").length / slots.length;
  }));

  const tax = new Map<FailureCategory, number>();
  for (const c of failedCases) {
    const cat = classifyFailure(c.failureReason ?? "other");
    tax.set(cat, (tax.get(cat) ?? 0) + 1);
  }

  return {
    corpusSize: cases.length,
    gradedCount: graded.length,
    failedCount: failedCases.length,
    fieldAccuracy: {
      name: mean(graded.map((g) => (g.name === "hit" ? 1 : 0))),
      oneLiner: mean(graded.map((g) => (g.oneLiner === "hit" ? 1 : g.oneLiner === "partial" ? 0.5 : 0))),
      positioning: mean(graded.map((g) => (g.positioning === "hit" ? 1 : g.positioning === "partial" ? 0.5 : 0))),
      tagsF1: mean(graded.map((g) => g.tags.f1)),
      featuresF1: mean(graded.map((g) => g.features.f1)),
      linksCorrect,
    },
    headlineScore: mean(graded.map((g) => g.fieldsCaptured)),
    latencyMs: { mean: mean(latencies), p50: percentile(latencies, 50), p95: percentile(latencies, 95) },
    creditsPerPage: cases.length ? round(totalCredits / cases.length) : 0,
    totalCredits,
    failures: [...tax.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category)),
  };
}
