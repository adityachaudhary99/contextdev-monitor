import type { EvidenceDiff } from "../diff/evidence-diff.js";
import type { SourceFailure } from "../client/types.js";

export type Citation = { n: number; title: string; url: string };
export type Report = {
  domain: string;
  trackerId: string;
  headline: string;
  changes: { detail: string; confidence: number; citation: number }[];
  citations: Citation[];
  creditsUsed: number;
  latencyMs: number;
  failures: SourceFailure[];
};

export function assembleReport(input: {
  domain: string; trackerId: string; diff: EvidenceDiff; sourceUrl: string; sourceTitle: string;
  creditsUsed: number; latencyMs: number; failures: SourceFailure[];
}): Report {
  const citations: Citation[] = [{ n: 1, title: input.sourceTitle, url: input.sourceUrl }];
  const changes = input.diff.changes.map((c) => ({ detail: c.detail, confidence: c.confidence, citation: 1 }));
  const headline = input.diff.changed
    ? `${changes.length} change${changes.length === 1 ? "" : "s"} detected for ${input.domain}`
    : `No change detected for ${input.domain}`;
  return {
    domain: input.domain, trackerId: input.trackerId, headline, changes, citations,
    creditsUsed: input.creditsUsed, latencyMs: input.latencyMs, failures: input.failures,
  };
}
