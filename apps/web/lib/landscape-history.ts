import "server-only";
import type { LandscapeSnapshot, MotionEntry } from "@contextdev/core";
import { buildMotionTimeline } from "@contextdev/core";
import webScrapingApisHistory from "../data/landscape-history/web-scraping-apis.json";
import headlessCmsHistory from "../data/landscape-history/headless-cms.json";

// Keep this map in sync with the curated catalog (lib/landscape-catalog.ts): a slug
// present there but missing here just hides the motion panel (getMarketMotion -> null),
// it does not error. Add a `data/landscape-history/<slug>.json` (via scripts/seed-history.ts)
// and an entry below when adding a curated landscape.
const HISTORY: Record<string, LandscapeSnapshot[]> = {
  "web-scraping-apis": webScrapingApisHistory as LandscapeSnapshot[],
  "headless-cms": headlessCmsHistory as LandscapeSnapshot[],
};

export type MarketMotion = { category: string; entries: MotionEntry[] };

/** Full market-motion timeline for a curated slug (chronological; entries[0].diff === null). */
export function getMarketMotion(slug: string): MarketMotion | null {
  const hist = HISTORY[slug];
  if (!hist || hist.length === 0) return null;
  return { category: hist[hist.length - 1].category, entries: buildMotionTimeline(hist) };
}
