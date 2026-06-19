// budget.ts — module-singleton demo BudgetStore (shared across all demo requests)
import { InMemoryBudgetStore, InMemorySnapshotStore } from "@contextdev/core";

/** Daily global credit cap for demo (no byoKey) requests. */
const DEMO_DAILY_CAP = 500;

/** Singleton InMemoryBudgetStore for the demo path. One instance per server process. */
export const demoBudget = new InMemoryBudgetStore(DEMO_DAILY_CAP);

// Per-process/per-instance singleton: persists within a running server instance;
// resets on serverless cold start — a durable KV/Redis SnapshotStore is the
// hosted follow-up, same limitation as the demoBudget singleton above.
export const snapshotStore = new InMemorySnapshotStore();
