import { describe, it, expect } from "vitest";
import { judgeCategoryFit } from "./category-fit.js";
import type { LlmClient } from "../llm/llm-client.js";

const player = (name: string, domain: string) => ({
  name, domain, oneLiner: "x", tagline: null, tags: [], features: [], positioning: "",
  links: { site: null, docs: null, pricing: null }, sourceUrl: `https://${domain}`, confidence: 1,
});
const llm = (reply: string): LlmClient => ({ complete: async () => ({ ok: true, value: reply }) });
const players = [player("Fireworks", "fireworks.ai"), player("IBM", "ibm.com")];

describe("judgeCategoryFit", () => {
  it("returns the set of domains the LLM says belong", async () => {
    const fit = await judgeCategoryFit("open source models", players, llm('["fireworks.ai"]'));
    expect(fit).toEqual(new Set(["fireworks.ai"]));
  });
  it("parses a JSON array embedded in prose, lowercases + strips www", async () => {
    const fit = await judgeCategoryFit("x", players, llm('Sure: ["WWW.Fireworks.ai"] are valid.'));
    expect(fit?.has("fireworks.ai")).toBe(true);
  });
  it("returns null (→ heuristic fallback) when no LLM, empty players, bad JSON, or call failure", async () => {
    expect(await judgeCategoryFit("x", players, null)).toBeNull();
    expect(await judgeCategoryFit("x", [], llm("[]"))).toBeNull();
    expect(await judgeCategoryFit("x", players, llm("not json"))).toBeNull();
    expect(await judgeCategoryFit("x", players, { complete: async () => ({ ok: false, failure: { url: "a", reason: "http_500" } }) })).toBeNull();
  });
});
