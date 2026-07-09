import { describe, it, expect, vi } from "vitest";
import { KvLandscapeStore } from "./kv-landscape-store.js";
import type { Landscape } from "@contextdev/core";

const LS = { category: "x", players: [], failures: [], comparison: { dimensions: [] }, brief: "", citations: [], creditsUsed: 0, latencyMs: 0 } as Landscape;
const mk = (fetchFn: typeof fetch) => new KvLandscapeStore({ url: "https://kv.example", token: "tok", fetchFn });
const jsonRes = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("KvLandscapeStore", () => {
  it("get: GETs {url}/get/ls:{slug} with bearer token and parses result", async () => {
    const fetchFn = vi.fn(async () => jsonRes({ result: JSON.stringify(LS) }));
    const got = await mk(fetchFn as unknown as typeof fetch).get("web-scraping-apis");
    expect(got?.category).toBe("x");
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://kv.example/get/ls:web-scraping-apis");
    expect((init as RequestInit).headers).toMatchObject({ Authorization: "Bearer tok" });
  });
  it("get: null result -> null", async () => {
    const fetchFn = vi.fn(async () => jsonRes({ result: null }));
    expect(await mk(fetchFn as unknown as typeof fetch).get("nope")).toBeNull();
  });
  it("get: non-200 / network error / bad JSON -> null, never throws", async () => {
    expect(await mk(vi.fn(async () => jsonRes({}, 500)) as unknown as typeof fetch).get("a")).toBeNull();
    expect(await mk(vi.fn(async () => { throw new Error("net"); }) as unknown as typeof fetch).get("a")).toBeNull();
    expect(await mk(vi.fn(async () => jsonRes({ result: "{not json" })) as unknown as typeof fetch).get("a")).toBeNull();
  });
  it("save: POSTs the serialized landscape to {url}/set/ls:{slug}; errors are swallowed", async () => {
    const fetchFn = vi.fn(async () => jsonRes({ result: "OK" }));
    await mk(fetchFn as unknown as typeof fetch).save("s", LS);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://kv.example/set/ls:s");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).body).toBe(JSON.stringify(LS));
    await expect(mk(vi.fn(async () => { throw new Error("net"); }) as unknown as typeof fetch).save("s", LS)).resolves.toBeUndefined();
  });
  it("list: parses {url}/keys/ls:* and strips the prefix; [] on error", async () => {
    const fetchFn = vi.fn(async () => jsonRes({ result: ["ls:a", "ls:b"] }));
    expect(await mk(fetchFn as unknown as typeof fetch).list()).toEqual(["a", "b"]);
    expect(await mk(vi.fn(async () => jsonRes({}, 500)) as unknown as typeof fetch).list()).toEqual([]);
  });
});
