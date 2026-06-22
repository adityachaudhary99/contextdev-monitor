import type { PlayerProfile } from "./types.js";

export type CapabilityCoverage = { capability: string; count: number; pct: number };
export type PricingStats = {
  total: number; withFreeTier: number; pricedCount: number;
  min: number | null; median: number | null; max: number | null;
};
export type CompositionStats = { openSource: number; proprietary: number; unknown: number; total: number };
export type MarketAnalytics = {
  capabilityCoverage: CapabilityCoverage[];
  pricing: PricingStats;
  composition: CompositionStats;
};

const norm = (s: string) => s.trim().toLowerCase();

/** Best-effort numeric extraction from a free-text price (e.g. "$49/mo" → 49). Null when none. */
export function parsePrice(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.match(/([\d,]+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function median(sorted: number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
}

/** Pure, deterministic market analytics derived from the player profiles. Never throws. */
export function computeMarketAnalytics(
  players: PlayerProfile[], opts: { topCapabilities?: number } = {},
): MarketAnalytics {
  const total = players.length;
  const cap = opts.topCapabilities ?? 10;

  // Capability coverage: frequency of each normalized tag across players.
  const freq = new Map<string, number>();
  for (const p of players) {
    const seen = new Set<string>();
    for (const t of p.tags) {
      const k = norm(t);
      if (k && !seen.has(k)) { seen.add(k); freq.set(k, (freq.get(k) ?? 0) + 1); }
    }
  }
  const capabilityCoverage: CapabilityCoverage[] = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, cap)
    .map(([capability, count]) => ({ capability, count, pct: total ? Math.round((count / total) * 100) : 0 }));

  // Pricing.
  const prices = players.map((p) => parsePrice(p.pricing?.startingPrice)).filter((n): n is number => n !== null);
  const sorted = [...prices].sort((a, b) => a - b);
  const pricing: PricingStats = {
    total,
    withFreeTier: players.filter((p) => p.pricing?.free === true).length,
    pricedCount: prices.length,
    min: sorted.length ? sorted[0] : null,
    median: median(sorted),
    max: sorted.length ? sorted[sorted.length - 1] : null,
  };

  // Composition.
  const composition: CompositionStats = {
    openSource: players.filter((p) => p.openSource === true).length,
    proprietary: players.filter((p) => p.openSource === false).length,
    unknown: players.filter((p) => p.openSource == null).length,
    total,
  };

  return { capabilityCoverage, pricing, composition };
}
