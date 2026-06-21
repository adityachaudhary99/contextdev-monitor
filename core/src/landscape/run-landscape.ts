// core/src/landscape/run-landscape.ts
import type { ContextClient } from "../client/context-client.js";
import type { CreditLedger } from "../credits/ledger.js";
import type { LlmClient } from "../llm/llm-client.js";
import type { Landscape, PlayerProfile, ProfileFailure } from "./types.js";
import { discoverPlayers, rootDomain } from "./discovery.js";
import { profilePlayer } from "./profiler.js";
import { buildLandscape } from "./synthesis.js";
import { isRelevant } from "./relevance.js";
import { judgeCategoryFit } from "./category-fit.js";

async function mapBounded<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  });
  await Promise.all(workers);
  return out;
}

const norm = (d: string) => d.toLowerCase().replace(/^www\./, "");

export async function runLandscape(args: {
  category: string; client: ContextClient; ledger: CreditLedger;
  maxPlayers?: number; concurrency?: number; now?: () => number;
  seeds?: string[]; llm?: LlmClient | null;
}): Promise<Landscape> {
  const now = args.now ?? (() => Date.now());
  const start = now();
  const done = (players: PlayerProfile[], failures: ProfileFailure[]) =>
    buildLandscape({ category: args.category, players, failures, creditsUsed: args.ledger.total(), latencyMs: now() - start });

  const disc = await discoverPlayers(args.category, args.client, { maxPlayers: args.maxPlayers ?? 8, seeds: args.seeds });
  if (!disc.ok) return done([], [{ url: "", domain: "", reason: disc.failure.reason }]);

  const results = await mapBounded(disc.value, args.concurrency ?? 4, (pl) => profilePlayer(pl.url, args.client));
  const okPlayers: PlayerProfile[] = [];
  const failures: ProfileFailure[] = [];
  results.forEach((r, idx) => {
    if (r.ok) okPlayers.push(r.value);
    else failures.push({ url: disc.value[idx].url, domain: rootDomain(disc.value[idx].url) ?? "", reason: r.failure.reason });
  });

  const seedDomains = new Set((args.seeds ?? []).map((s) => rootDomain(s.startsWith("http") ? s : `https://${s}`) ?? norm(s)));
  const fit = await judgeCategoryFit(args.category, okPlayers, args.llm ?? null);

  const players: PlayerProfile[] = [];
  for (const p of okPlayers) {
    const relevant = seedDomains.has(norm(p.domain)) || (fit ? fit.has(norm(p.domain)) : isRelevant(p, args.category));
    if (relevant) players.push(p);
    else failures.push({ url: p.sourceUrl, domain: p.domain, reason: "off_category" });
  }
  return done(players, failures);
}
