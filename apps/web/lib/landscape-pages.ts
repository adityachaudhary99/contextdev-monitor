import "server-only";
import type { Landscape } from "@contextdev/core";
import { deslugify } from "@contextdev/core";
import { getCurated } from "./landscape-catalog.js";
import { landscapeStore } from "./landscape-store.js";
import { runLandscapeReport, type RunLandscapeReportResult } from "./landscape-action.js";

export type PagesDeps = { generate?: (category: string) => Promise<RunLandscapeReportResult> };

const ON_DEMAND_ENABLED = Boolean(process.env.CONTEXTDEV_API_KEY);

export async function getOrGenerateLandscape(slug: string, deps: PagesDeps = {}): Promise<Landscape | null> {
  const curated = getCurated(slug);
  if (curated) return curated;
  const cached = await landscapeStore.get(slug);
  if (cached) return cached;
  if (!deps.generate && !ON_DEMAND_ENABLED) return null;
  const category = deslugify(slug);
  const generate = deps.generate ?? ((c: string) =>
    runLandscapeReport({ category: c, sessionId: `page:${slug}`, day: new Date().toISOString().slice(0, 10) }));
  const result = await generate(category);
  if (!result.ok) return null;
  await landscapeStore.save(slug, result.landscape);
  return result.landscape;
}
