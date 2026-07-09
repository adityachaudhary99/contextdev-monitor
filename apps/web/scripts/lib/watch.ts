import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  runLandscape,
  slugify,
  snapshotLandscape,
  diffLandscapes,
  diffToMarkdown,
  ContextClient,
  CreditLedger,
  InMemoryBudgetStore,
  anthropicFromEnv,
  type Landscape,
  type LandscapeSnapshot,
  type LandscapeDiff,
} from "@contextdev/core";

export type WatchDeps = { generate?: (category: string) => Promise<Landscape>; dataDir?: string; capturedAt?: string };
export type WatchResult = { slug: string; landscape: Landscape; diff: LandscapeDiff | null };

function defaultDataDir(): string {
  try {
    return fileURLToPath(new URL("../../data", import.meta.url));
  } catch {
    return join(process.cwd(), "data");
  }
}

function defaultGenerate(category: string): Promise<Landscape> {
  const apiKey = process.env.CONTEXTDEV_API_KEY;
  if (!apiKey) throw new Error("CONTEXTDEV_API_KEY required");
  const ledger = new CreditLedger();
  const client = new ContextClient({
    apiKey,
    ledger,
    budget: new InMemoryBudgetStore(100_000),
    day: new Date().toISOString().slice(0, 10),
  });
  return runLandscape({ category, client, ledger, maxPlayers: 8, llm: anthropicFromEnv() });
}

/** Generate a landscape, persist snapshot + history, and diff vs the previous capture (null at baseline). */
export async function generateAndPersist(category: string, deps: WatchDeps = {}): Promise<WatchResult> {
  const generate = deps.generate ?? defaultGenerate;
  const dataDir = deps.dataDir ?? defaultDataDir();
  const capturedAt = deps.capturedAt ?? new Date().toISOString();
  const landscape = await generate(category);
  const slug = slugify(category);
  writeFileSync(join(dataDir, `landscapes/${slug}.json`), JSON.stringify(landscape, null, 2) + "\n");
  const histPath = join(dataDir, `landscape-history/${slug}.json`);
  const prior: LandscapeSnapshot[] = existsSync(histPath) ? JSON.parse(readFileSync(histPath, "utf8")) : [];
  const snap = snapshotLandscape(landscape, capturedAt);
  const diff = prior.length > 0 ? diffLandscapes(prior[prior.length - 1], snap) : null;
  prior.push(snap);
  writeFileSync(histPath, JSON.stringify(prior, null, 2) + "\n");
  return { slug, landscape, diff };
}

/** Assemble the watch-run report. Pure. hasChanges only when a real diff has changes. */
export function buildWatchReport(
  results: { category: string; result: WatchResult | { error: string } }[],
): { markdown: string; hasChanges: boolean } {
  const lines: string[] = ["## Weekly market watch", ""];
  let hasChanges = false;
  for (const { category, result } of results) {
    if ("error" in result) {
      lines.push(`### ${category} — watch FAILED`, "", `\`${result.error}\``, "");
      continue;
    }
    if (!result.diff) {
      lines.push(`### ${category}`, "", "First capture — baseline recorded.", "");
      continue;
    }
    lines.push(diffToMarkdown(category, result.diff), "");
    if (result.diff.hasChanges) hasChanges = true;
  }
  return { markdown: lines.join("\n"), hasChanges };
}
