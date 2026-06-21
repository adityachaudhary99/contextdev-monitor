// Heuristic category-relevance gate: keep a player only if it matches at least half of the
// category's content-words. Cuts keyword false positives ("DigitalOcean" for "AI code review",
// "IBM Planning Analytics" for "open source models"). A coarse fallback for the LLM gate.
const GENERIC = new Set([
  "tools","tool","software","platform","platforms","api","apis","service","services","app","apps",
  "solution","solutions","best","top","online","the","for","and","of","a","an","to","in","with","vs",
]);

function words(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
}

export function categoryTerms(category: string): string[] {
  return [...new Set(words(category).filter((t) => t.length > 2 && !GENERIC.has(t)))];
}

export function isRelevant(
  player: { name: string; oneLiner: string; tags: string[]; positioning: string },
  category: string,
): boolean {
  const terms = categoryTerms(category);
  if (terms.length === 0) return true; // can't judge → keep
  const hay = new Set(words([player.name, player.oneLiner, player.positioning, ...player.tags].join(" ")));
  const matches = terms.filter((t) => hay.has(t)).length;
  return matches >= Math.ceil(terms.length / 2);
}
