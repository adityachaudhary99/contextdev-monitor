// Maintainer tool: live-generate curated landscape snapshots for the public SEO pages.
//
//   CONTEXTDEV_API_KEY=… npx tsx apps/web/scripts/gen-landscapes.ts "web scraping APIs" "headless CMS"
//
// Writes apps/web/data/landscapes/<slug>.json for each category (real context.dev data).
// After running, register the new slugs in apps/web/lib/landscape-catalog.ts.
import { generateAndPersist } from "./lib/watch.js";

async function main() {
  const categories = process.argv.slice(2);
  if (categories.length === 0) {
    console.error('usage: tsx gen-landscapes.ts "<category>" ["<category>" ...]');
    process.exit(2);
  }
  const apiKey = process.env.CONTEXTDEV_API_KEY;
  if (!apiKey) {
    console.error("CONTEXTDEV_API_KEY required");
    process.exit(2);
  }
  const day = new Date().toISOString().slice(0, 10);

  for (const category of categories) {
    const { slug, landscape } = await generateAndPersist(category, { capturedAt: day + "T00:00:00.000Z" });
    console.log(
      `${slug}: ${landscape.players.length} players, ${landscape.failures.length} failures, ` +
      `${landscape.creditsUsed}cr, ${(landscape.latencyMs / 1000).toFixed(1)}s -> data/landscapes/${slug}.json`,
    );
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
