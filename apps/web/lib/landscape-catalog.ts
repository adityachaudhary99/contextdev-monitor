import type { Landscape } from "@contextdev/core";
import webScrapingApis from "../data/landscapes/web-scraping-apis.json";

// Curated landscapes → static, indexable /landscape/<slug> pages.
// To add one: commit data/landscapes/<slug>.json and add it here.
const CATALOG: Record<string, Landscape> = {
  "web-scraping-apis": webScrapingApis as Landscape,
};

export function curatedSlugs(): string[] { return Object.keys(CATALOG); }
export function getCurated(slug: string): Landscape | null { return CATALOG[slug] ?? null; }
export function curatedList(): { slug: string; landscape: Landscape }[] {
  return Object.entries(CATALOG).map(([slug, landscape]) => ({ slug, landscape }));
}
