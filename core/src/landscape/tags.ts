// core/src/landscape/tags.ts
// Heuristic tag hygiene for the landscape comparison matrix.
// (Full semantic capability clustering is a v2 lever — this is normalize + derive.)

const MAX_TAGS = 8;

/** Trim, lowercase, collapse internal whitespace, drop empties, de-duplicate, cap. */
export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const t = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

/** Derive lightweight tags from short feature strings (<=3 words) when none were extracted. */
export function deriveTags(features: string[]): string[] {
  const derived: string[] = [];
  for (const f of features) {
    const t = f.trim();
    if (t && t.split(/\s+/).length <= 3) derived.push(t);
  }
  return normalizeTags(derived);
}

/** Final tag set for a player: normalized extracted tags, or derived from features when empty. */
export function resolveTags(tags: string[], features: string[]): string[] {
  const norm = normalizeTags(tags);
  return norm.length > 0 ? norm : deriveTags(features);
}
