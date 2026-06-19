// budget.ts — module-singleton demo BudgetStore (shared across all demo requests)
import { InMemoryBudgetStore } from "@contextdev/core";

/** Daily global credit cap for demo (no byoKey) requests. */
const DEMO_DAILY_CAP = 500;

/** Singleton InMemoryBudgetStore for the demo path. One instance per server process. */
export const demoBudget = new InMemoryBudgetStore(DEMO_DAILY_CAP);
