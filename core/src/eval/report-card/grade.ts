// core/src/eval/report-card/grade.ts
import type { CorpusCase, CaseGrade, TextGrade, LinkGrade, SetScore } from "./types.js";

const STOP = new Set(["the","a","an","and","or","for","to","of","in","on","with","your","you","is","are","be","that","this","it","as","at","by","from","we","our","into","any"]);

export function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));
}
const round = (x: number) => Math.round(x * 100) / 100;

export function textGrade(extracted: string, truth: string): TextGrade {
  const t = tokens(truth);
  if (t.length === 0) return "hit";
  const e = new Set(tokens(extracted));
  const recall = t.filter((w) => e.has(w)).length / t.length;
  return recall >= 0.5 ? "hit" : recall > 0 ? "partial" : "miss";
}

function fuzzyMatch(a: string, b: string): boolean {
  const at = tokens(a), bt = tokens(b);
  if (at.length === 0 || bt.length === 0) return false;
  const bset = new Set(bt);
  const overlap = at.filter((w) => bset.has(w)).length;
  return overlap / Math.min(at.length, bt.length) >= 0.5;
}
const normSet = (arr: string[]) => [...new Set(arr.map((x) => x.trim().toLowerCase()).filter(Boolean))];

function f1Of(precision: number, recall: number): SetScore {
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision: round(precision), recall: round(recall), f1: round(f1) };
}

export function exactSetScore(extracted: string[], truth: string[]): SetScore {
  const e = normSet(extracted), t = normSet(truth);
  if (t.length === 0 && e.length === 0) return { precision: 1, recall: 1, f1: 1 };
  const tset = new Set(t);
  const inter = e.filter((x) => tset.has(x)).length;
  const precision = e.length === 0 ? 0 : inter / e.length;
  const recall = t.length === 0 ? 1 : inter / t.length;
  return f1Of(precision, recall);
}

export function fuzzySetScore(extracted: string[], truth: string[]): SetScore {
  if (truth.length === 0 && extracted.length === 0) return { precision: 1, recall: 1, f1: 1 };
  const recalled = truth.filter((tr) => extracted.some((exi) => fuzzyMatch(tr, exi))).length;
  const precise = extracted.filter((exi) => truth.some((tr) => fuzzyMatch(exi, tr))).length;
  const recall = truth.length === 0 ? 1 : recalled / truth.length;
  const precision = extracted.length === 0 ? 0 : precise / extracted.length;
  return f1Of(precision, recall);
}

function host(u: string | null): string | null {
  if (!u) return null;
  try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; }
}
export function linkGrade(extracted: string | null, truth: string | null): LinkGrade {
  if (!truth) return "n/a";
  if (!extracted) return "missing";
  return host(extracted) === host(truth) ? "correct" : "wrong";
}

export function gradeCase(c: CorpusCase): CaseGrade {
  const gt = c.groundTruth;
  const links = {
    site: linkGrade(c.extracted?.links.site ?? null, gt.links.site),
    docs: linkGrade(c.extracted?.links.docs ?? null, gt.links.docs),
    pricing: linkGrade(c.extracted?.links.pricing ?? null, gt.links.pricing),
  };
  if (!c.extracted) {
    return {
      url: c.url, domain: c.domain, graded: false, name: "miss", oneLiner: "miss", positioning: "miss",
      tags: { precision: 0, recall: 0, f1: 0 }, features: { precision: 0, recall: 0, f1: 0 },
      links, fieldsCaptured: 0,
    };
  }
  const ex = c.extracted;
  const name: "hit" | "miss" = ex.name.trim().toLowerCase() === gt.name.trim().toLowerCase() ? "hit" : "miss";
  const oneLiner = textGrade(ex.oneLiner, gt.oneLiner);
  const positioning = textGrade(ex.positioning, gt.positioning);
  const tags = exactSetScore(ex.tags, gt.tags);
  const features = fuzzySetScore(ex.features, gt.features);
  const linkVals = [links.site, links.docs, links.pricing].filter((l) => l !== "n/a");
  const linkCorrectFrac = linkVals.length === 0 ? 1 : linkVals.filter((l) => l === "correct").length / linkVals.length;
  const signals = [
    name === "hit", oneLiner !== "miss", positioning !== "miss",
    tags.f1 >= 0.5, features.f1 >= 0.5, linkCorrectFrac >= 0.5,
  ];
  const fieldsCaptured = round(signals.filter(Boolean).length / signals.length);
  return { url: c.url, domain: c.domain, graded: true, name, oneLiner, positioning, tags, features, links, fieldsCaptured };
}
