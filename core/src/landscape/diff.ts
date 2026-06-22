import type { Landscape } from "./types.js";

export type PlayerSnapshot = {
  name: string; domain: string; tags: string[];
  startingPrice: string | null; free: boolean | null; openSource: boolean | null; oneLiner: string;
};
export type LandscapeSnapshot = { category: string; capturedAt: string; players: PlayerSnapshot[] };

export type PricingChange = { domain: string; name: string; field: "price" | "freeTier"; from: string; to: string };
export type CapabilityChange = { domain: string; name: string; added: string[]; removed: string[] };
export type LandscapeDiff = {
  fromCapturedAt: string; toCapturedAt: string;
  entered: { name: string; domain: string }[];
  exited: { name: string; domain: string }[];
  pricingChanges: PricingChange[];
  capabilityChanges: CapabilityChange[];
  hasChanges: boolean;
};

const norm = (d: string) => d.toLowerCase().replace(/^www\./, "");
const normTag = (t: string) => t.trim().toLowerCase();
const freeLabel = (f: boolean | null) => (f === true ? "free tier" : f === false ? "no free tier" : "unknown");

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
  };
}

/** Diff two landscape snapshots by normalized domain. Pure, never throws. */
export function diffLandscapes(prev: LandscapeSnapshot, curr: LandscapeSnapshot): LandscapeDiff {
  const prevBy = new Map(prev.players.map((p) => [norm(p.domain), p]));
  const currBy = new Map(curr.players.map((p) => [norm(p.domain), p]));

  const entered = curr.players.filter((p) => !prevBy.has(norm(p.domain))).map((p) => ({ name: p.name, domain: p.domain }));
  const exited = prev.players.filter((p) => !currBy.has(norm(p.domain))).map((p) => ({ name: p.name, domain: p.domain }));

  const pricingChanges: PricingChange[] = [];
  const capabilityChanges: CapabilityChange[] = [];
  for (const [d, cp] of currBy) {
    const pp = prevBy.get(d);
    if (!pp) continue;
    if ((pp.startingPrice ?? "") !== (cp.startingPrice ?? "")) {
      pricingChanges.push({ domain: cp.domain, name: cp.name, field: "price", from: pp.startingPrice ?? "—", to: cp.startingPrice ?? "—" });
    }
    if ((pp.free ?? null) !== (cp.free ?? null)) {
      pricingChanges.push({ domain: cp.domain, name: cp.name, field: "freeTier", from: freeLabel(pp.free), to: freeLabel(cp.free) });
    }
    const prevTags = new Set(pp.tags.map(normTag));
    const currTags = new Set(cp.tags.map(normTag));
    const added = [...currTags].filter((t) => !prevTags.has(t));
    const removed = [...prevTags].filter((t) => !currTags.has(t));
    if (added.length || removed.length) capabilityChanges.push({ domain: cp.domain, name: cp.name, added, removed });
  }
  const hasChanges = entered.length > 0 || exited.length > 0 || pricingChanges.length > 0 || capabilityChanges.length > 0;
  return { fromCapturedAt: prev.capturedAt, toCapturedAt: curr.capturedAt, entered, exited, pricingChanges, capabilityChanges, hasChanges };
}
