// Runner: `tsx src/eval/report-card/run-report-card.ts [--collect]`
// Default: grade the committed corpus offline and (re)write core/REPORT-CARD.md.
// --collect (key-gated, CONTEXTDEV_API_KEY): refresh each case's extracted/latency/credits live, then grade.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gradeCase } from "./grade.js";
import { buildReportCard } from "./aggregate.js";
import { renderReportCardMarkdown } from "./render.js";
import { collectCase } from "./collect.js";
import { ContextClient } from "../../client/context-client.js";
import { CreditLedger } from "../../credits/ledger.js";
import { InMemoryBudgetStore } from "../../credits/budget-store.js";
import type { CorpusCase } from "./types.js";

const corpusPath = fileURLToPath(new URL("./fixtures/corpus.json", import.meta.url));
const reportPath = fileURLToPath(new URL("../../../REPORT-CARD.md", import.meta.url));

async function main() {
  const collect = process.argv.includes("--collect");
  const raw = JSON.parse(readFileSync(corpusPath, "utf8")) as { _note?: string; cases: CorpusCase[] };
  let cases = raw.cases;

  if (collect) {
    const apiKey = process.env.CONTEXTDEV_API_KEY;
    if (!apiKey) { console.error("CONTEXTDEV_API_KEY required for --collect"); process.exit(2); }
    const day = new Date().toISOString().slice(0, 10);
    const clientFor = (ledger: CreditLedger) =>
      new ContextClient({ apiKey, ledger, budget: new InMemoryBudgetStore(100_000), day });
    cases = [];
    for (const c of raw.cases) {
      const got = await collectCase(c.url, clientFor);
      cases.push({ ...c, extracted: got.extracted, failureReason: got.failureReason, latencyMs: got.latencyMs, credits: got.credits });
      console.log(`collected ${c.domain}: ${got.extracted ? "ok" : `FAILED(${got.failureReason})`} ${got.latencyMs}ms ${got.credits}cr`);
    }
    writeFileSync(corpusPath, JSON.stringify({ _note: raw._note, cases }, null, 2) + "\n");
  }

  const card = buildReportCard({ cases, grades: cases.map(gradeCase) });
  const provenance = collect
    ? "Live context.dev run (refreshed via --collect)."
    : "Committed example corpus — run `npm run report-card -- --collect` to refresh from live context.dev output.";
  writeFileSync(reportPath, renderReportCardMarkdown(card, provenance) + "\n");
  console.log(`headline ${Math.round(card.headlineScore * 100)}% | ${card.gradedCount}/${card.corpusSize} profiled | ${card.creditsPerPage}cr/page | wrote ${reportPath}`);
  // CI floor: a non-empty corpus should grade above a minimal bar.
  if (card.corpusSize > 0 && card.headlineScore < 0.2) { console.error("headline score below floor (0.2)"); process.exit(1); }
}
main().catch((e) => { console.error(e); process.exit(1); });
