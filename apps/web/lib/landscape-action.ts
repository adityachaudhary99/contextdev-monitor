// server-only: this module must only be used from Next.js Server Components / Route Handlers
import "server-only";

import {
  ContextClient,
  CreditLedger,
  InMemoryBudgetStore,
  runLandscape as coreRunLandscape,
  type BudgetStore,
  type Landscape,
} from "@contextdev/core";
import {
  demoBudget,
  sessionBudget,
  DEMO_DAILY_CAP,
  SESSION_DAILY_CAP,
} from "./budget.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Worst-case credit cost for one landscape run: discovery + profiling × N players. */
const EST_MAX_COST = 130;

/** High daily cap for BYO-key mode — effectively uncapped per session. */
const BYO_DAILY_CAP = 100_000;

// ---------------------------------------------------------------------------
// Public API types
// ---------------------------------------------------------------------------

export interface RunLandscapeReportInput {
  category: string;
  byoKey?: string;
  sessionId: string;
  day: string;
}

export type RunLandscapeReportResult =
  | { ok: true; landscape: Landscape }
  | { ok: false; error: "bad_category" | "demo_cap_reached" | "missing_key" };

// ---------------------------------------------------------------------------
// Injectable deps (for tests)
// ---------------------------------------------------------------------------

export interface LandscapeActionDeps {
  runLandscape: typeof coreRunLandscape;
  maintainerKey: string | undefined;
  budget: BudgetStore;
  sessionBudget: BudgetStore;
}

const defaultDeps: LandscapeActionDeps = {
  runLandscape: coreRunLandscape,
  maintainerKey: process.env.CONTEXTDEV_API_KEY,
  budget: demoBudget,
  sessionBudget: sessionBudget,
};

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runLandscapeReport(
  input: RunLandscapeReportInput,
  deps: LandscapeActionDeps = defaultDeps,
): Promise<RunLandscapeReportResult> {
  const { category, byoKey, sessionId, day } = input;
  const { runLandscape, maintainerKey, budget, sessionBudget: sessionBudgetDep } = deps;

  // 1. Validate category
  const trimmedCategory = category.trim();
  if (!trimmedCategory || trimmedCategory.length > 80) {
    return { ok: false, error: "bad_category" };
  }

  // 2. Key selection
  const key = byoKey || maintainerKey;
  if (!key) {
    return { ok: false, error: "missing_key" };
  }

  // 3. Budget gate (demo mode only — no byoKey means we use the shared cap)
  if (!byoKey) {
    const sessionKey = `${sessionId}::${day}`;
    // Try to consume from both; if either fails, rollback and return cap error
    const [sessionOk, globalOk] = await Promise.all([
      sessionBudgetDep.tryConsume(EST_MAX_COST, sessionKey),
      budget.tryConsume(EST_MAX_COST, day),
    ]);
    if (!sessionOk || !globalOk) {
      // Rollback whichever succeeded (by convention we check the inverse)
      // InMemoryBudgetStore has no explicit rollback, so we note this is
      // best-effort — shared cap enforcement is the primary guard.
      return { ok: false, error: "demo_cap_reached" };
    }
  }

  // 4. Build fresh dependencies for this request
  const ledger = new CreditLedger();

  // Always use a fresh high-cap budget for ContextClient so per-call debits
  // do NOT touch the shared demo cap (the gate above is the sole enforcer).
  const clientBudget = new InMemoryBudgetStore(BYO_DAILY_CAP);

  const client = new ContextClient({
    apiKey: key, // NEVER returned, logged, or exposed
    ledger,
    budget: clientBudget,
    day,
  });

  // 5. Run landscape
  const landscape = await runLandscape({ category: trimmedCategory, client, ledger, maxPlayers: 8 });

  return { ok: true, landscape };
}
