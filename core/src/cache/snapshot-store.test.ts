import { describe, it, expect } from "vitest";
import { InMemorySnapshotStore, type Snapshot } from "./snapshot-store.js";

const snap = (hash: string, data: unknown): Snapshot<unknown> => ({
  trackerId: "pricing", domain: "x.com", capturedDay: "2026-06-19",
  sourceUrl: "https://x.com/pricing", sourceHash: hash, data,
});

describe("InMemorySnapshotStore", () => {
  it("returns null before any save", async () => {
    expect(await new InMemorySnapshotStore().latest("pricing", "x.com")).toBeNull();
  });
  it("returns the most recently saved snapshot for the key", async () => {
    const s = new InMemorySnapshotStore();
    await s.save(snap("h1", { v: 1 }));
    await s.save(snap("h2", { v: 2 }));
    const got = await s.latest<{ v: number }>("pricing", "x.com");
    expect(got?.sourceHash).toBe("h2");
    expect(got?.data).toEqual({ v: 2 });
  });
});
