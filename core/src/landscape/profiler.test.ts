import { describe, it, expect, vi } from "vitest";
import { profilePlayer } from "./profiler.js";

const ok = (v: unknown) => async () => ({ ok: true, value: v });
const fail = (reason: string) => async () => ({ ok: false, failure: { url: "u", reason } });

describe("profilePlayer", () => {
  it("returns a typed profile with derived domain + confidence", async () => {
    const client = {
      scrapeMarkdown: ok({ url: "https://jina.ai", markdown: "# Jina" }),
      extractStructured: ok({ name: "Jina", oneLiner: "Reader API", tags: ["api"], features: ["reader", "embeddings"], positioning: "search infra" }),
    } as never;
    const r = await profilePlayer("https://jina.ai", client);
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.value.domain).toBe("jina.ai"); expect(r.value.confidence).toBeGreaterThan(0.5); expect(r.value.features).toContain("reader"); }
  });
  it("never throws — scrape failure becomes a ProfileFailure", async () => {
    const client = { scrapeMarkdown: fail("http_403"), extractStructured: vi.fn() } as never;
    const r = await profilePlayer("https://x.com", client);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure.reason).toBe("http_403");
  });
});
