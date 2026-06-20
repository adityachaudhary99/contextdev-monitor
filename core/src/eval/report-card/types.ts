// core/src/eval/report-card/types.ts
import type { ProfileExtract } from "../../landscape/profile-schema.js";

export type GroundTruth = {
  name: string;
  oneLiner: string;
  tags: string[];
  features: string[];
  positioning: string;
  links: { site: string | null; docs: string | null; pricing: string | null };
};

export type CorpusCase = {
  url: string;
  domain: string;
  groundTruth: GroundTruth;
  extracted: ProfileExtract | null; // null when collection failed
  failureReason?: string;
  latencyMs?: number;
  credits?: number;
};

export type TextGrade = "hit" | "partial" | "miss";
export type LinkGrade = "correct" | "wrong" | "missing" | "n/a";
export type SetScore = { precision: number; recall: number; f1: number };

export type CaseGrade = {
  url: string;
  domain: string;
  graded: boolean; // false when there was no extracted output
  name: "hit" | "miss";
  oneLiner: TextGrade;
  positioning: TextGrade;
  tags: SetScore;
  features: SetScore;
  links: { site: LinkGrade; docs: LinkGrade; pricing: LinkGrade };
  fieldsCaptured: number; // 0..1
};

export type FailureCategory =
  | "contract/path-prefix" | "contract/scrape-method" | "contract/data-unwrap"
  | "contract/null-enum-500" | "contract/search-billing"
  | "extraction/http-4xx" | "extraction/schema-reject" | "extraction/empty-field"
  | "extraction/timeout" | "network" | "budget" | "other";

export type ReportCard = {
  corpusSize: number;
  gradedCount: number;
  failedCount: number;
  fieldAccuracy: {
    name: number; oneLiner: number; positioning: number;
    tagsF1: number; featuresF1: number; linksCorrect: number;
  };
  headlineScore: number; // mean fieldsCaptured over graded cases
  latencyMs: { mean: number; p50: number; p95: number };
  creditsPerPage: number;
  totalCredits: number;
  failures: { category: FailureCategory; count: number }[];
};
