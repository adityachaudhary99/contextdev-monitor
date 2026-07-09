import { describe, it, expect } from "vitest";
import { selectLandscapeStore } from "./landscape-store.js";
import { KvLandscapeStore } from "./kv-landscape-store.js";
import { InMemoryLandscapeStore } from "@contextdev/core";

describe("selectLandscapeStore", () => {
  it("uses KV when both env vars are set", () => {
    expect(selectLandscapeStore({ KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "t" } as NodeJS.ProcessEnv)).toBeInstanceOf(KvLandscapeStore);
  });
  it("falls back to in-memory when either is missing", () => {
    expect(selectLandscapeStore({} as NodeJS.ProcessEnv)).toBeInstanceOf(InMemoryLandscapeStore);
    expect(selectLandscapeStore({ KV_REST_API_URL: "https://kv.example" } as NodeJS.ProcessEnv)).toBeInstanceOf(InMemoryLandscapeStore);
  });
  it("accepts Vercel marketplace-integration prefixed names (e.g. STORAGE_)", () => {
    expect(selectLandscapeStore({ STORAGE_KV_REST_API_URL: "https://kv.example", STORAGE_KV_REST_API_TOKEN: "t" } as NodeJS.ProcessEnv)).toBeInstanceOf(KvLandscapeStore);
  });
});
