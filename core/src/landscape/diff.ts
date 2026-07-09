import type { Landscape } from "./types.js";
import { parsePrice } from "./analytics.js";

export type PlayerSnapshot = {
  name: string; domain: string; tags: string[];
  startingPrice: string | null; free: boolean | null; openSource: boolean | null; oneLiner: string;
};
export type LandscapeSnapshot = { category: string; capturedAt: string; players: PlayerSnapshot[]; failed?: { domain: string; reason: string }[] };

export type PricingChange = { domain: string; name: string; field: "price" | "freeTier"; from: string; to: string };
export type CapabilityChange = { domain: string; name: string; added: string[]; removed: string[] };
export type LandscapeDiff = {
  fromCapturedAt: string; toCapturedAt: string;
  entered: { name: string; domain: string }[];
  exited: { name: string; domain: string }[];
  lostFromMap: { name: string; domain: string; reason: string }[];
  pricingChanges: PricingChange[];
  capabilityChanges: CapabilityChange[];
  hasChanges: boolean;
};

const norm = (d: string) => d.toLowerCase().replace(/^www\./, "");
const normTag = (t: string) => t.trim().toLowerCase();
const freeLabel = (f: boolean | null) => (f === true ? "free tier" : f === false ? "no free tier" : "unknown");
const rawPrice = (s: string | null) => s ?? "";

function priceChanged(prev: string | null, curr: string | null): boolean {
  const prevRaw = rawPrice(prev);
  const currRaw = rawPrice(curr);
  const prevParsed = parsePrice(prev);
  const currParsed = parsePrice(curr);
  if (prevParsed !== null && currParsed !== null) return prevParsed !== currParsed;
  return prevRaw !== currRaw;
}

const tagTokens = (tag: string) => new Set(
  tag
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => (t.endsWith("ies") && t.length > 3 ? `${t.slice(0, -3)}y` : t.replace(/s$/, "")))
    .filter(Boolean),
);

function tokenSetsIntersect(a: string, b: string): boolean {
  const aTokens = tagTokens(a);
  const bTokens = tagTokens(b);
  for (const t of aTokens) if (bTokens.has(t)) return true;
  return false;
}

function cancelFuzzyCapabilities(added: string[], removed: string[]): { added: string[]; removed: string[] } {
  const usedAdded = new Set<number>();
  const keptRemoved: string[] = [];
  for (const r of removed) {
    const match = added.findIndex((a, i) => !usedAdded.has(i) && tokenSetsIntersect(a, r));
    if (match >= 0) usedAdded.add(match);
    else keptRemoved.push(r);
  }
  return { added: added.filter((_, i) => !usedAdded.has(i)), removed: keptRemoved };
}

/** Reduce a Landscape to the lite, diff-relevant fields, stamped with a capture time. Pure. */
export function snapshotLandscape(ls: Landscape, capturedAt: string): LandscapeSnapshot {
  return {
    category: ls.category, capturedAt,
    players: ls.players.map((p) => ({
      name: p.name, domain: p.domain, tags: p.tags,
      startingPrice: p.pricing?.startingPrice ?? null,
      free: p.pricing?.free ?? null,
      openSource: p.openSource ?? null,
      oneLiner: p.oneLiner,
    })),
    failed: ls.failures.map((f) => ({ domain: f.domain, reason: f.reason })),
  };
}

/** Diff two landscape snapshots by normalized domain. Pure, never throws. */
export function diffLandscapes(prev: LandscapeSnapshot, curr: LandscapeSnapshot): LandscapeDiff {
  const prevBy = new Map(prev.players.map((p) => [norm(p.domain), p]));
  const currBy = new Map(curr.players.map((p) => [norm(p.domain), p]));

  const entered = curr.players.filter((p) => !prevBy.has(norm(p.domain))).map((p) => ({ name: p.name, domain: p.domain }));
  const failedBy = new Map((curr.failed ?? []).map((f) => [norm(f.domain), f]));
  const exited: { name: string; domain: string }[] = [];
  const lostFromMap: { name: string; domain: string; reason: string }[] = [];
  for (const p of prev.players.filter((player) => !currBy.has(norm(player.domain)))) {
    const failed = failedBy.get(norm(p.domain));
    if (failed) lostFromMap.push({ name: p.name, domain: p.domain, reason: failed.reason });
    else exited.push({ name: p.name, domain: p.domain });
  }

  const pricingChanges: PricingChange[] = [];
  const capabilityChanges: CapabilityChange[] = [];
  for (const [d, cp] of currBy) {
    const pp = prevBy.get(d);
    if (!pp) continue;
    if (priceChanged(pp.startingPrice, cp.startingPrice)) {
      pricingChanges.push({ domain: cp.domain, name: cp.name, field: "price", from: pp.startingPrice ?? "—", to: cp.startingPrice ?? "—" });
    }
    if (pp.free != null && cp.free != null && pp.free !== cp.free) {
      pricingChanges.push({ domain: cp.domain, name: cp.name, field: "freeTier", from: freeLabel(pp.free), to: freeLabel(cp.free) });
    }
    const prevTags = new Set(pp.tags.map(normTag));
    const currTags = new Set(cp.tags.map(normTag));
    const added = [...currTags].filter((t) => !prevTags.has(t));
    const removed = [...prevTags].filter((t) => !currTags.has(t));
    const caps = cancelFuzzyCapabilities(added, removed);
    if (caps.added.length || caps.removed.length) capabilityChanges.push({ domain: cp.domain, name: cp.name, added: caps.added, removed: caps.removed });
  }
  const hasChanges = entered.length > 0 || exited.length > 0 || pricingChanges.length > 0;
  return { fromCapturedAt: prev.capturedAt, toCapturedAt: curr.capturedAt, entered, exited, lostFromMap, pricingChanges, capabilityChanges, hasChanges };
}
