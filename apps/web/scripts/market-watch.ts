// CI entrypoint: re-map every curated category, persist snapshots + history, emit motion-report.md.
//   CONTEXTDEV_API_KEY=... npx tsx apps/web/scripts/market-watch.ts
import { appendFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { curatedList } from "../lib/landscape-catalog.js";
import { generateAndPersist, buildWatchReport, type WatchResult } from "./lib/watch.js";

async function main() {
  const categories = curatedList().map(({ landscape }) => landscape.category);
  const results: { category: string; result: WatchResult | { error: string } }[] = [];
  for (const category of categories) {
    try {
      const result = await generateAndPersist(category);
      results.push({ category, result });
      console.log(`${category}: ok (${result.landscape.players.length} players, diff=${result.diff?.hasChanges ?? "baseline"})`);
    } catch (e) {
      results.push({ category, result: { error: e instanceof Error ? e.message : String(e) } });
      console.error(`${category}: FAILED — ${e instanceof Error ? e.message : e}`);
    }
  }
  const { markdown, hasChanges } = buildWatchReport(results);
  writeFileSync(fileURLToPath(new URL("../../../motion-report.md", import.meta.url)), markdown + "\n");
  console.log(`hasChanges=${hasChanges}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `has_changes=${hasChanges}\n`);
  if (results.every(({ result }) => "error" in result)) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
