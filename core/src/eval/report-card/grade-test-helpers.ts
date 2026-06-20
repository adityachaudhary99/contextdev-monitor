// core/src/eval/report-card/grade-test-helpers.ts
export type { CorpusCase } from "./types.js";
export type ProfileExtractLike = {
  name: string; oneLiner: string; tagline: string | null; tags: string[];
  features: string[]; positioning: string;
  links: { site: string | null; docs: string | null; pricing: string | null };
};
