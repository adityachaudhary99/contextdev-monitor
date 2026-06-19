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
import {
  demoBudget,
  sessionBudget,
  snapshotStore,
  DEMO_DAILY_CAP,
  SESSION_DAILY_CAP,
} from "./budget.js";

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
  sessionBudget: BudgetStore;
  store: SnapshotStore;
}

const defaultDeps: TrackActionDeps = {
  runTracker: coreRunTracker,
  maintainerKey: process.env.CONTEXTDEV_API_KEY,
  budget: demoBudget,
  sessionBudget: sessionBudget,
  store: snapshotStore,
};

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runPricingReport(
  input: RunPricingReportInput,
  deps: TrackActionDeps = defaultDeps,
): Promise<RunPricingReportResult> {
  const { domain, byoKey, sessionId, day } = input;
  const { runTracker, maintainerKey, budget, sessionBudget: sessionBudgetDep, store } = deps;

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
    const sessionKey = `${sessionId}::${day}`;
    const [sessionSpent, globalSpent] = await Promise.all([
      sessionBudgetDep.spent(sessionKey),
      budget.spent(day),
    ]);
    if (
      sessionSpent + ESTIMATED_MAX_COST > SESSION_DAILY_CAP ||
      globalSpent + ESTIMATED_MAX_COST > DEMO_DAILY_CAP
    ) {
      return { ok: false, error: "demo_cap_reached" };
    }
    // Both have room — consume both
    await Promise.all([
      sessionBudgetDep.tryConsume(ESTIMATED_MAX_COST, sessionKey),
      budget.tryConsume(ESTIMATED_MAX_COST, day),
    ]);
  }

  // 4. Build fresh dependencies for this request
  const ledger = new CreditLedger();
  const tracker = new PricingTracker();

  // Always use a fresh high-cap budget for ContextClient so per-call debits
  // do NOT touch the shared demo cap (the gate above is the sole enforcer).
  const clientBudget = new InMemoryBudgetStore(BYO_DAILY_CAP);

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
