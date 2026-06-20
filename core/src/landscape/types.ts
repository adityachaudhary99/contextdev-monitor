// core/src/landscape/types.ts
export type PlayerProfile = {
  name: string; domain: string; oneLiner: string; tagline: string | null;
  tags: string[]; features: string[]; positioning: string;
  links: { site: string | null; docs: string | null; pricing: string | null };
  sourceUrl: string; confidence: number;
};
export type ProfileFailure = { url: string; domain: string; reason: string };
export type Landscape = {
  category: string; players: PlayerProfile[]; failures: ProfileFailure[];
  comparison: { dimensions: string[] }; brief: string;
  citations: { n: number; title: string; url: string }[];
  creditsUsed: number; latencyMs: number;
};
