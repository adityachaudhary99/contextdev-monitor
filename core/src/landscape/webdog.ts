// Pure mapper: Landscape → a Webdog (github.com/context-dot-dev/webdog) watch-list.
// Cartographer tells you who to watch; Webdog watches them.
import type { Landscape } from "./types.js";

export type WebdogTarget = { kind: "page_content" | "site_links" | "product_price"; url: string; watchNote: string };
export type WebdogWatchlist = {
  version: 1; generatedBy: "contextdev-monitor"; category: string;
  sites: { name: string; domain: string; url: string; targets: WebdogTarget[] }[];
};

export function toWebdogWatchlist(landscape: Landscape): WebdogWatchlist {
  return {
    version: 1,
    generatedBy: "contextdev-monitor",
    category: landscape.category,
    sites: landscape.players.map((p) => {
      const url = p.links.site ?? `https://${p.domain}`;
      const targets: WebdogTarget[] = [{
        kind: "site_links", url,
        watchNote: `New or removed pages from ${p.name} — a ${landscape.category} player`,
      }];
      if (p.links.pricing) targets.push({
        kind: "product_price", url: p.links.pricing,
        watchNote: `Pricing changes for ${p.name} in the ${landscape.category} market`,
      });
      if (p.links.docs) targets.push({
        kind: "page_content", url: p.links.docs,
        watchNote: `${p.name} docs/changelog changes (${landscape.category})`,
      });
      return { name: p.name, domain: p.domain, url, targets };
    }),
  };
}
