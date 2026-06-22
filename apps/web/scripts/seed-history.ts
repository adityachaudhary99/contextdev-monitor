// Maintainer tool: capture the current curated landscape(s) as a history snapshot.
//   npx tsx apps/web/scripts/seed-history.ts [ISO_TIMESTAMP] ["slug" ...]
// Appends a snapshot to apps/web/data/landscape-history/<slug>.json (creates it if absent).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { snapshotLandscape, type Landscape, type LandscapeSnapshot } from "@contextdev/core";

const argv = process.argv.slice(2);
const capturedAt = argv.find((a) => a.includes("T")) ?? "2026-06-22T00:00:00.000Z";
const slugs = argv.filter((a) => !a.includes("T"));
const SLUGS = slugs.length ? slugs : ["web-scraping-apis", "headless-cms"];

const dir = fileURLToPath(new URL("../data/landscape-history/", import.meta.url));
mkdirSync(dir, { recursive: true });
for (const slug of SLUGS) {
  const curatedPath = fileURLToPath(new URL(`../data/landscapes/${slug}.json`, import.meta.url));
  const histPath = fileURLToPath(new URL(`../data/landscape-history/${slug}.json`, import.meta.url));
  const curated = JSON.parse(readFileSync(curatedPath, "utf8")) as Landscape;
  const snap = snapshotLandscape(curated, capturedAt);
  const existing: LandscapeSnapshot[] = existsSync(histPath) ? JSON.parse(readFileSync(histPath, "utf8")) : [];
  existing.push(snap);
  writeFileSync(histPath, JSON.stringify(existing, null, 2) + "\n");
  console.log(`${slug}: history now ${existing.length} snapshot(s)`);
}
