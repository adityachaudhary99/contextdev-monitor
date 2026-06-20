// Terminal Landscape Cartographer + the agent-skill's CLI fallback.
//   CONTEXTDEV_API_KEY=… npm -w @contextdev/core run cartographer -- "<category>" [--max N] [--json <path>]
import { writeFileSync } from "node:fs";
import { ContextClient, CreditLedger, InMemoryBudgetStore, runLandscape } from "../index.js";
import { formatLandscapeSummary } from "../landscape/format.js";

const argv = process.argv.slice(2);
const VALUE_FLAGS = new Set(["--max", "--json"]);
const positionals: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) { if (VALUE_FLAGS.has(a)) i++; continue; }
  positionals.push(a);
}
const flag = (name: string) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };

const category = positionals[0];
const apiKey = process.env.CONTEXTDEV_API_KEY;
if (!apiKey) { console.error("Set CONTEXTDEV_API_KEY"); process.exit(1); }
if (!category) { console.error('Usage: npm -w @contextdev/core run cartographer -- "<category>" [--max N] [--json <path>]'); process.exit(1); }

const maxPlayers = Number(flag("--max") ?? 8);
const jsonPath = flag("--json");
const day = new Date().toISOString().slice(0, 10);
const ledger = new CreditLedger();
const client = new ContextClient({ apiKey, ledger, budget: new InMemoryBudgetStore(100_000), day });

const landscape = await runLandscape({ category, client, ledger, maxPlayers });
console.log(formatLandscapeSummary(landscape));
if (jsonPath) { writeFileSync(jsonPath, JSON.stringify(landscape, null, 2) + "\n"); console.error(`\nwrote ${jsonPath}`); }
