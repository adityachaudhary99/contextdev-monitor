import type { ContextClient } from "../client/context-client.js";
import type { Result } from "../client/types.js";

const DENY = new Set([
  "g2.com","capterra.com","getapp.com","trustradius.com","producthunt.com","wikipedia.org",
  "reddit.com","youtube.com","medium.com","quora.com","linkedin.com","twitter.com","x.com",
  "github.com","stackoverflow.com","gartner.com","forbes.com","techcrunch.com",
  // v1.1: blog / publishing / aggregator / registry / social platforms — not products
  "dev.to","substack.com","hashnode.com","blogspot.com","wordpress.com","tumblr.com",
  "notion.site","webflow.io","gitbook.io","npmjs.com","pypi.org","slideshare.net",
  "glassdoor.com","crunchbase.com","g2crowd.com","softwareadvice.com","sourceforge.net",
  "slant.co","facebook.com","instagram.com","pinterest.com","tiktok.com",
]);
export function rootDomain(url: string): string | null {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return null; }
}
function isAggregator(domain: string): boolean {
  return (
    /(^|\.)(blog|news|reviews?|compare|comparison|alternatives?|vs|versus|listicle|directory|wiki)\./.test(domain) ||
    /\.(medium|substack|wordpress|blogspot|hashnode|tumblr)\.com$/.test(domain) ||
    domain.includes("best-") || /(^|[.-])top-/.test(domain) || /-vs-/.test(domain) || /-alternatives?/.test(domain)
  );
}
export async function discoverPlayers(
  category: string, client: ContextClient, opts?: { maxPlayers?: number },
): Promise<Result<{ name: string; url: string }[]>> {
  const max = opts?.maxPlayers ?? 8;
  const queries = [category, `best ${category} tools`, `${category} alternatives`];
  const seen = new Map<string, { name: string; url: string }>();
  for (const q of queries) {
    const r = await client.webSearch(q);
    if (!r.ok) continue;
    for (const res of r.value.results) {
      const d = rootDomain(res.url);
      if (!d || DENY.has(d) || isAggregator(d) || seen.has(d)) continue;
      seen.set(d, { name: res.title?.trim() || d, url: `https://${d}` });
      if (seen.size >= max) break;
    }
    if (seen.size >= max) break;
  }
  if (seen.size === 0) return { ok: false, failure: { url: "", reason: "no_players_found" } };
  return { ok: true, value: [...seen.values()].slice(0, max) };
}
