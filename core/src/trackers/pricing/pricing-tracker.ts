// core/src/trackers/pricing/pricing-tracker.ts
import type { Tracker } from "../tracker.js";
import type { ContextClient } from "../../client/context-client.js";
import type { Result } from "../../client/types.js";
import { PricingSchema, pricingJsonSchema, type Pricing } from "./schema.js";
import { normalizePricing, type NormalizedSnapshot } from "./normalize.js";
import { diffPricing } from "../../diff/evidence-diff.js";
import type { EvidenceDiff } from "../../diff/evidence-diff.js";

export class PricingTracker implements Tracker<Pricing> {
  id = "pricing";
  jsonSchema = pricingJsonSchema;

  async locate(domain: string, client: ContextClient): Promise<Result<{ url: string; markdown: string }>> {
    const guess = `https://${domain}/pricing`;
    const direct = await client.scrapeMarkdown(guess);
    if (direct.ok) return { ok: true, value: { url: guess, markdown: direct.value.markdown } };
    const search = await client.webSearch(`${domain} pricing`);
    if (search.ok && search.value.results.length > 0) {
      const found = await client.scrapeMarkdown(search.value.results[0].url);
      if (found.ok) return { ok: true, value: { url: search.value.results[0].url, markdown: found.value.markdown } };
      return found;
    }
    return { ok: false, failure: { url: guess, reason: "pricing_page_not_found" } };
  }

  parse(raw: unknown): Pricing {
    return PricingSchema.parse(raw);
  }
  normalize(raw: Pricing): NormalizedSnapshot<Pricing> {
    return normalizePricing(raw);
  }
  diff(prev: NormalizedSnapshot<Pricing>, next: NormalizedSnapshot<Pricing>): EvidenceDiff {
    return diffPricing(prev, next);
  }
}
