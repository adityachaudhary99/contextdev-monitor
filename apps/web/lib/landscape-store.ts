import { InMemoryLandscapeStore } from "@contextdev/core";

// Runtime cache for on-demand landscapes. Resets on serverless cold start —
// a durable KV store is the hosted follow-up (same caveat as the snapshot store).
export const landscapeStore = new InMemoryLandscapeStore();
