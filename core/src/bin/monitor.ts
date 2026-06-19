// core/src/bin/monitor.ts
import { ContextClient, CreditLedger, InMemoryBudgetStore, InMemorySnapshotStore, PricingTracker, runTracker } from "../index.js";

const apiKey = process.env.CONTEXTDEV_API_KEY;
const domain = process.argv[2];
if (!apiKey) { console.error("Set CONTEXTDEV_API_KEY"); process.exit(1); }
if (!domain) { console.error("Usage: npm -w @contextdev/core run smoke -- <domain>"); process.exit(1); }

const day = new Date().toISOString().slice(0, 10);
const ledger = new CreditLedger();
const client = new ContextClient({ apiKey, ledger, budget: new InMemoryBudgetStore(50), day });
const report = await runTracker({ tracker: new PricingTracker(), domain, client, ledger, store: new InMemorySnapshotStore(), day });
console.log(JSON.stringify(report, null, 2));
