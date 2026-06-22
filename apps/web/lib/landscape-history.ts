import "server-only";
import type { LandscapeSnapshot, LandscapeDiff } from "@contextdev/core";
import { diffLandscapes } from "@contextdev/core";
import webScrapingApisHistory from "../data/landscape-history/web-scraping-apis.json";
import headlessCmsHistory from "../data/landscape-history/headless-cms.json";

const HISTORY: Record<string, LandscapeSnapshot[]> = {
  "web-scraping-apis": webScrapingApisHistory as LandscapeSnapshot[],
  "headless-cms": headlessCmsHistory as LandscapeSnapshot[],
};

export type MonitorState = {
  category: string; capturedAt: string; playerCount: number; checks: number; diff: LandscapeDiff | null;
};

/** Monitor state for a curated slug: latest capture + a diff vs the previous capture (null at baseline). */
export function getLandscapeMonitor(slug: string): MonitorState | null {
  const hist = HISTORY[slug];
  if (!hist || hist.length === 0) return null;
  const latest = hist[hist.length - 1];
  const diff = hist.length >= 2 ? diffLandscapes(hist[hist.length - 2], latest) : null;
  return { category: latest.category, capturedAt: latest.capturedAt, playerCount: latest.players.length, checks: hist.length, diff };
}
