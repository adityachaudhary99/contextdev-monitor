// server-only: this module must only be used from Next.js Server Components / Route Handlers
import "server-only";

import {
  ContextClient,
  CreditLedger,
  InMemoryBudgetStore,
  PricingTracker,
  runTracker as coreRunTracker,
  type BudgetStore,
  type Report,
  type SnapshotStore,
} from "@contextdev/core";
import { demoBudget, snapshotStore } from "./budget.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Worst-case credit cost for one pricing run: scrape(1) + search(10) + extract(10) = 21. */
const ESTIMATED_MAX_COST = 21;

/** High daily cap for BYO-key mode — effectively uncapped per session. */
const BYO_DAILY_CAP = 100_000;

// ---------------------------------------------------------------------------
// Domain validation
// ---------------------------------------------------------------------------

const HOSTNAME_RE =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

function isValidHostname(domain: string): boolean {
  return HOSTNAME_RE.test(domain);
}

// ---------------------------------------------------------------------------
// Public API types
// ---------------------------------------------------------------------------

export interface RunPricingReportInput {
  domain: string;
  byoKey?: string;
  sessionId: string;
  day: string;
}

export type RunPricingReportResult =
  | { ok: true; report: Report }
  | { ok: false; error: "bad_domain" | "demo_cap_reached" | "missing_key" };

// ---------------------------------------------------------------------------
// Injectable deps (for tests)
// ---------------------------------------------------------------------------

export interface TrackActionDeps {
  runTracker: typeof coreRunTracker;
  maintainerKey: string | undefined;
  budget: BudgetStore;
  store: SnapshotStore;
}

const defaultDeps: TrackActionDeps = {
  runTracker: coreRunTracker,
  maintainerKey: process.env.CONTEXTDEV_API_KEY,
  budget: demoBudget,
  store: snapshotStore,
};

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runPricingReport(
  input: RunPricingReportInput,
  deps: TrackActionDeps = defaultDeps,
): Promise<RunPricingReportResult> {
  const { domain, byoKey, day } = input;
  const { runTracker, maintainerKey, budget, store } = deps;

  // 1. Validate domain
  if (!isValidHostname(domain)) {
    return { ok: false, error: "bad_domain" };
  }

  // 2. Key selection
  const key = byoKey || maintainerKey;
  if (!key) {
    return { ok: false, error: "missing_key" };
  }

  // 3. Budget gate (demo mode only — no byoKey means we use the shared cap)
  if (!byoKey) {
    const allowed = await budget.tryConsume(ESTIMATED_MAX_COST, day);
    if (!allowed) {
      return { ok: false, error: "demo_cap_reached" };
    }
  }

  // 4. Build fresh dependencies for this request
  const ledger = new CreditLedger();
  const tracker = new PricingTracker();

  // BYO mode gets a fresh high-cap budget so the shared demo cap is not touched
  const clientBudget = byoKey
    ? new InMemoryBudgetStore(BYO_DAILY_CAP)
    : budget;

  const client = new ContextClient({
    apiKey: key, // NEVER returned, logged, or exposed
    ledger,
    budget: clientBudget,
    day,
  });

  // 5. Run tracker
  const report = await runTracker({ tracker, domain, client, ledger, store, day });

  return { ok: true, report };
}
