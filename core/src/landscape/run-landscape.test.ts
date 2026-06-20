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
      { "https://firecrawl.dev": { name: "Firecrawl", oneLiner: "scrape", features: ["markdown"], positioning: "dev" } },
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
});
