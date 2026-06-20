// core/src/eval/report-card/collect.ts
import type { ContextClient } from "../../client/context-client.js";
import { CreditLedger } from "../../credits/ledger.js";
import { ProfileSchema, profileJsonSchema, type ProfileExtract } from "../../landscape/profile-schema.js";

export type Collected = { extracted: ProfileExtract | null; latencyMs: number; credits: number; failureReason?: string };

/**
 * Key-gated. Calls scrape + extract directly (mirroring the profiler's raw path) and grades the
 * RAW context.dev extraction — deliberately WITHOUT the profiler's resolveTags post-processing,
 * so the report measures context.dev's extraction, not our normalization. Never throws.
 */
export async function collectCase(
  url: string,
  clientFor: (ledger: CreditLedger) => ContextClient,
  now: () => number = () => Date.now(),
): Promise<Collected> {
  const ledger = new CreditLedger();
  const client = clientFor(ledger);
  const start = now();
  const scraped = await client.scrapeMarkdown(url);
  if (!scraped.ok) return { extracted: null, latencyMs: now() - start, credits: ledger.total(), failureReason: scraped.failure.reason };
  const ext = await client.extractStructured(url, profileJsonSchema);
  const latencyMs = now() - start;
  const credits = ledger.total();
  if (!ext.ok) return { extracted: null, latencyMs, credits, failureReason: ext.failure.reason };
  const parsed = ProfileSchema.safeParse(ext.value);
  if (!parsed.success) return { extracted: null, latencyMs, credits, failureReason: "profile_parse_failed" };
  return { extracted: parsed.data, latencyMs, credits };
}
