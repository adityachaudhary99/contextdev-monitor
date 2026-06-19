import type { EvidenceDiff } from "../diff/evidence-diff.js";
import type { SourceFailure } from "../client/types.js";
import type { NormalizedSnapshot } from "../trackers/pricing/normalize.js";
import type { Pricing } from "../trackers/pricing/schema.js";

export type ReportStatus = "baseline" | "no_change" | "changed" | "error";
export type Citation = { n: number; title: string; url: string };
export type Report = {
  domain: string;
  trackerId: string;
  status: ReportStatus;
  headline: string;
  pricing?: NormalizedSnapshot<Pricing>;
  changes: { detail: string; confidence: number; citation: number }[];
  citations: Citation[];
  creditsUsed: number;
  latencyMs: number;
  failures: SourceFailure[];
};

export function assembleReport(input: {
  domain: string; trackerId: string; diff: EvidenceDiff; sourceUrl: string; sourceTitle: string;
  creditsUsed: number; latencyMs: number; failures: SourceFailure[];
  pricing?: NormalizedSnapshot<Pricing>; priorExisted: boolean;
}): Report {
  const citations: Citation[] = [{ n: 1, title: input.sourceTitle, url: input.sourceUrl }];
  const changes = input.diff.changes.map((c) => ({ detail: c.detail, confidence: c.confidence, citation: 1 }));
  const planCount = input.pricing?.plans.length ?? 0;
  const status: ReportStatus =
    input.failures.length > 0 && !input.pricing ? "error"
    : input.diff.changed ? "changed"
    : input.priorExisted ? "no_change"
    : "baseline";
  const headline =
    status === "error" ? `Couldn't read ${input.domain}'s pricing`
    : status === "changed" ? `${changes.length} change${changes.length === 1 ? "" : "s"} detected for ${input.domain}`
    : status === "no_change" ? `No change since last check — ${planCount} plan${planCount === 1 ? "" : "s"}`
    : `Baseline captured for ${input.domain} — ${planCount} plan${planCount === 1 ? "" : "s"} tracked`;
  return {
    domain: input.domain, trackerId: input.trackerId, status, headline, pricing: input.pricing,
    changes, citations, creditsUsed: input.creditsUsed, latencyMs: input.latencyMs, failures: input.failures,
  };
}
