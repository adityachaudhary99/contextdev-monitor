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
  it("derives tags from short features when the extractor returned none", async () => {
    const client = {
      scrapeMarkdown: ok({ url: "https://acme.com", markdown: "# Acme" }),
      extractStructured: ok({ name: "Acme", oneLiner: "x", tags: [], features: ["Proxies", "CAPTCHA solving", "Fully managed headless browser farm"], positioning: "p" }),
    } as never;
    const r = await profilePlayer("https://acme.com", client);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.tags).toContain("proxies");
      expect(r.value.tags).toContain("captcha solving");
      expect(r.value.tags).not.toContain("fully managed headless browser farm");
    }
  });
  it("passes through the richer profile fields (pricing, segment, founded, open-source)", async () => {
    const client = {
      scrapeMarkdown: ok({ url: "https://acme.com", markdown: "# Acme" }),
      extractStructured: ok({
        name: "Acme", oneLiner: "x", tags: ["api"], features: ["f"], positioning: "p",
        pricing: { free: true, startingPrice: "$49/mo", model: "per seat" },
        targetSegment: "Enterprise", differentiators: ["fastest"], socialProof: "10,000+ teams",
        founded: "2019", openSource: false,
      }),
    } as never;
    const r = await profilePlayer("https://acme.com", client);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.pricing).toEqual({ free: true, startingPrice: "$49/mo", model: "per seat" });
      expect(r.value.targetSegment).toBe("Enterprise");
      expect(r.value.founded).toBe("2019");
      expect(r.value.openSource).toBe(false);
      expect(r.value.socialProof).toBe("10,000+ teams");
      expect(r.value.differentiators).toEqual(["fastest"]);
    }
  });
  it("defaults the richer fields when the extractor omits them", async () => {
    const client = {
      scrapeMarkdown: ok({ url: "https://b.com", markdown: "# B" }),
      extractStructured: ok({ name: "B", oneLiner: "x", tags: ["t"], features: ["f"], positioning: "p" }),
    } as never;
    const r = await profilePlayer("https://b.com", client);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.pricing).toEqual({ free: null, startingPrice: null, model: null });
      expect(r.value.targetSegment).toBe("");
      expect(r.value.openSource).toBeNull();
    }
  });
});
