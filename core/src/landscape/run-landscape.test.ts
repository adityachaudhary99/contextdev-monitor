// core/src/landscape/run-landscape.test.ts
import { describe, it, expect, vi } from "vitest";
import { runLandscape } from "./run-landscape.js";
import { CreditLedger } from "../credits/ledger.js";

function client(searchResults: { title: string; url: string }[], profileByUrl: Record<string, unknown>) {
  return {
    webSearch: vi.fn(async () => ({ ok: true, value: { results: searchResults } })),
    scrapeMarkdown: vi.fn(async (url: string) => ({ ok: true, value: { url, markdown: "# x" } })),
    extractStructured: vi.fn(async (url: string) =>
      profileByUrl[url] ? { ok: true, value: profileByUrl[url] } : { ok: false, failure: { url, reason: "http_500" } }),
  } as never;
}

describe("runLandscape", () => {
  it("discovers + profiles players, isolating failures", async () => {
    const c = client(
      [{ title: "Firecrawl", url: "https://firecrawl.dev/" }, { title: "Jina", url: "https://jina.ai/" }],
      { "https://firecrawl.dev": { name: "Firecrawl", oneLiner: "web scraping and crawling", features: ["markdown"], positioning: "scraping dev" } },
      // jina has no profile → extract fails → ProfileFailure
    );
    const ls = await runLandscape({ category: "scraping apis", client: c, ledger: new CreditLedger(), now: () => 1000 });
    expect(ls.players.map((p) => p.name)).toEqual(["Firecrawl"]);
    expect(ls.failures.map((f) => f.domain)).toEqual(["jina.ai"]);
    expect(ls.category).toBe("scraping apis");
  });
  it("returns an empty landscape with a failure when discovery finds nothing", async () => {
    const c = client([{ title: "Reddit", url: "https://reddit.com/r/x" }], {});
    const ls = await runLandscape({ category: "x", client: c, ledger: new CreditLedger(), now: () => 1000 });
    expect(ls.players).toHaveLength(0);
    expect(ls.failures[0].reason).toBe("no_players_found");
  });
  it("uses the LLM category-fit set when an llm is provided (off-category → failures)", async () => {
    const client = {
      webSearch: async () => ({ ok: true, value: { results: [
        { title: "Fireworks", url: "https://fireworks.ai/" }, { title: "IBM", url: "https://ibm.com/" },
      ] } }),
      scrapeMarkdown: async (url: string) => ({ ok: true, value: { url, markdown: "# x" } }),
      extractStructured: async (url: string) => ({ ok: true, value: url.includes("fireworks")
        ? { name: "Fireworks", oneLiner: "open source model inference", tags: ["models"], features: ["f"], positioning: "models" }
        : { name: "IBM", oneLiner: "planning analytics models", tags: ["planning"], features: ["f"], positioning: "planning" } }),
    } as never;
    const ledger = { total: () => 0, record: () => {} } as never;
    const llm = { complete: async () => ({ ok: true as const, value: '["fireworks.ai"]' }) };
    const ls = await runLandscape({ category: "open source models", client, ledger, concurrency: 2, now: () => 0, llm });
    expect(ls.players.map((p) => p.domain)).toEqual(["fireworks.ai"]);
    expect(ls.failures.some((f) => f.reason === "off_category" && f.domain === "ibm.com")).toBe(true);
  });
  it("always keeps a seeded player even if the gate would drop it", async () => {
    const client = {
      webSearch: async () => ({ ok: true, value: { results: [{ title: "Acme", url: "https://acme-seed.com/" }] } }),
      scrapeMarkdown: async (url: string) => ({ ok: true, value: { url, markdown: "# x" } }),
      extractStructured: async () => ({ ok: true, value: { name: "Acme", oneLiner: "totally unrelated", tags: [], features: [], positioning: "" } }),
    } as never;
    const ledger = { total: () => 0, record: () => {} } as never;
    const ls = await runLandscape({ category: "open source models", client, ledger, concurrency: 1, now: () => 0, seeds: ["acme-seed.com"] });
    expect(ls.players.map((p) => p.domain)).toEqual(["acme-seed.com"]); // seeded → kept despite being off-category
  });
  it("drops off-category profiled players into failures (relevance gate)", async () => {
    const c = {
      webSearch: async () => ({ ok: true, value: { results: [
        { title: "CodeRabbit", url: "https://coderabbit.ai/" },
        { title: "DigitalOcean", url: "https://digitalocean.com/" },
      ] } }),
      scrapeMarkdown: async (url: string) => ({ ok: true, value: { url, markdown: "# x" } }),
      extractStructured: async (url: string) => ({ ok: true, value: url.includes("coderabbit")
        ? { name: "CodeRabbit", oneLiner: "AI code review for pull requests", tags: ["code review"], features: ["reviews"], positioning: "code review", domain: "coderabbit.ai" }
        : { name: "DigitalOcean", oneLiner: "Cloud hosting and infrastructure", tags: ["cloud"], features: ["droplets"], positioning: "hosting", domain: "digitalocean.com" } }),
    } as never;
    const ls = await runLandscape({ category: "AI code review tools", client: c, ledger: new CreditLedger(), maxPlayers: 8, concurrency: 2, now: () => 0 });
    expect(ls.players.map((p) => p.name)).toEqual(["CodeRabbit"]);
    expect(ls.failures.some((f) => f.reason === "off_category" && f.domain === "digitalocean.com")).toBe(true);
  });
});
