import type { ContextClient } from "../client/context-client.js";
import type { Result } from "../client/types.js";
import type { PlayerProfile } from "./types.js";
import { ProfileSchema, profileJsonSchema } from "./profile-schema.js";
import { rootDomain } from "./discovery.js";
import { resolveTags } from "./tags.js";

export async function profilePlayer(url: string, client: ContextClient): Promise<Result<PlayerProfile>> {
  const scraped = await client.scrapeMarkdown(url);
  if (!scraped.ok) return scraped;
  const ext = await client.extractStructured(url, profileJsonSchema);
  if (!ext.ok) return ext;
  const parsed = ProfileSchema.safeParse(ext.value);
  if (!parsed.success) return { ok: false, failure: { url, reason: "profile_parse_failed" } };
  const p = parsed.data;
  const confidence = ([p.oneLiner !== "", p.features.length > 0, p.positioning !== ""].filter(Boolean).length) / 3;
  return { ok: true, value: {
    name: p.name, domain: rootDomain(url) ?? url, oneLiner: p.oneLiner, tagline: p.tagline,
    tags: resolveTags(p.tags, p.features), features: p.features, positioning: p.positioning, links: p.links,
    pricing: p.pricing, targetSegment: p.targetSegment, differentiators: p.differentiators,
    socialProof: p.socialProof, founded: p.founded, openSource: p.openSource,
    sourceUrl: url, confidence: Math.round(confidence * 100) / 100,
  } };
}
