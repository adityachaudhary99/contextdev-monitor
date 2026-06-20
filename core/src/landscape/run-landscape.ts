// core/src/landscape/run-landscape.ts
import type { ContextClient } from "../client/context-client.js";
import type { CreditLedger } from "../credits/ledger.js";
import type { Landscape, PlayerProfile, ProfileFailure } from "./types.js";
import { discoverPlayers, rootDomain } from "./discovery.js";
import { profilePlayer } from "./profiler.js";
import { buildLandscape } from "./synthesis.js";
import { isRelevant } from "./relevance.js";

async function mapBounded<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  });
  await Promise.all(workers);
  return out;
}

export async function runLandscape(args: {
  category: string; client: ContextClient; ledger: CreditLedger;
  maxPlayers?: number; concurrency?: number; now?: () => number;
}): Promise<Landscape> {
  const now = args.now ?? (() => Date.now());
  const start = now();
  const done = (players: PlayerProfile[], failures: ProfileFailure[]) =>
    buildLandscape({ category: args.category, players, failures, creditsUsed: args.ledger.total(), latencyMs: now() - start });

  const disc = await discoverPlayers(args.category, args.client, { maxPlayers: args.maxPlayers ?? 8 });
  if (!disc.ok) return done([], [{ url: "", domain: "", reason: disc.failure.reason }]);

  const results = await mapBounded(disc.value, args.concurrency ?? 4, (pl) => profilePlayer(pl.url, args.client));
  const players: PlayerProfile[] = [];
  const failures: ProfileFailure[] = [];
  results.forEach((r, idx) => {
    if (r.ok) {
      if (isRelevant(r.value, args.category)) players.push(r.value);
      else failures.push({ url: disc.value[idx].url, domain: r.value.domain, reason: "off_category" });
    } else {
      failures.push({ url: disc.value[idx].url, domain: rootDomain(disc.value[idx].url) ?? "", reason: r.failure.reason });
    }
  });
  return done(players, failures);
}
