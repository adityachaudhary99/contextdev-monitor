import { describe, it, expect } from "vitest";
import { AnthropicClient } from "./llm-client.js";

const fetchOk = (text: string) => (async () => ({ ok: true, json: async () => ({ content: [{ type: "text", text }] }) })) as unknown as typeof fetch;
const fetch500 = (async () => ({ ok: false, status: 500, json: async () => ({}) })) as unknown as typeof fetch;
const fetchThrows = (async () => { throw new Error("boom"); }) as unknown as typeof fetch;

describe("AnthropicClient.complete", () => {
  it("returns the joined text content on success", async () => {
    const c = new AnthropicClient({ apiKey: "k", fetchFn: fetchOk('["a.com"]') });
    const r = await c.complete("hi");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe('["a.com"]');
  });
  it("never throws — non-2xx and network errors become Result failures", async () => {
    const a = await new AnthropicClient({ apiKey: "k", fetchFn: fetch500 }).complete("x");
    expect(a.ok).toBe(false);
    const b = await new AnthropicClient({ apiKey: "k", fetchFn: fetchThrows }).complete("x");
    expect(b.ok).toBe(false);
  });
});
