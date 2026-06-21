import { describe, it, expect } from "vitest";
import { synthesizeAnalystReport, AnalystReportSchema } from "./analyst.js";
import type { LlmClient } from "../llm/llm-client.js";
import type { PlayerProfile } from "./types.js";
import type { Result } from "../client/types.js";

const player = (name: string, domain: string): PlayerProfile => ({
  name, domain, oneLiner: `${name} does things`, tagline: null,
  tags: ["api", "cloud"], features: ["fast", "scalable"], positioning: "p",
  links: { site: null, docs: null, pricing: null }, sourceUrl: `https://${domain}`, confidence: 1,
  differentiators: ["unique edge"], pricing: { free: true, startingPrice: "$49", model: null },
  targetSegment: "Enterprise", socialProof: "", founded: "", openSource: null,
});
const players = [player("Acme", "acme.com"), player("Globex", "globex.com")];

const llmReturning = (text: string): LlmClient => ({
  async complete(): Promise<Result<string>> { return { ok: true, value: text }; },
});
const llmFailing: LlmClient = {
  async complete(): Promise<Result<string>> { return { ok: false, failure: { url: "anthropic", reason: "http_500" } }; },
};

const goodJson = JSON.stringify({
  overview: "A maturing market with two strong players.",
  segments: [{ name: "Enterprise platforms", members: ["Acme"], note: "for large orgs" }],
  leaders: [{ name: "Acme", why: "most complete" }],
  tableStakes: ["api access", "cloud hosting"],
  differentiators: [{ player: "Globex", edge: "cheapest" }],
  gaps: ["no on-prem option"],
  picks: [{ useCase: "enterprise scale", player: "Acme", why: "breadth" }],
});

describe("synthesizeAnalystReport", () => {
  it("returns null when there is no llm", async () => {
    expect(await synthesizeAnalystReport("apis", players, ["api"], null)).toBeNull();
  });
  it("returns null when there are no players", async () => {
    expect(await synthesizeAnalystReport("apis", [], ["api"], llmReturning(goodJson))).toBeNull();
  });
  it("returns null when the llm call fails", async () => {
    expect(await synthesizeAnalystReport("apis", players, ["api"], llmFailing)).toBeNull();
  });
  it("parses a well-formed JSON report", async () => {
    const r = await synthesizeAnalystReport("apis", players, ["api"], llmReturning(goodJson));
    expect(r).not.toBeNull();
    expect(r!.overview).toMatch(/maturing market/);
    expect(r!.segments[0].members).toEqual(["Acme"]);
    expect(r!.leaders[0].name).toBe("Acme");
    expect(r!.tableStakes).toContain("api access");
    expect(r!.differentiators[0].player).toBe("Globex");
    expect(r!.picks[0].player).toBe("Acme");
  });
  it("extracts JSON even when wrapped in prose / markdown fences", async () => {
    const wrapped = "Here is the analysis:\n```json\n" + goodJson + "\n```\nDone.";
    const r = await synthesizeAnalystReport("apis", players, ["api"], llmReturning(wrapped));
    expect(r).not.toBeNull();
    expect(r!.overview).toMatch(/maturing market/);
  });
  it("returns null on unparseable output", async () => {
    expect(await synthesizeAnalystReport("apis", players, ["api"], llmReturning("no json here"))).toBeNull();
  });
  it("returns null on an empty/contentless report object", async () => {
    const empty = JSON.stringify({ overview: "", segments: [], leaders: [] });
    expect(await synthesizeAnalystReport("apis", players, ["api"], llmReturning(empty))).toBeNull();
  });
  it("schema fills defaults for missing optional keys", () => {
    const parsed = AnalystReportSchema.safeParse({ overview: "x" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.segments).toEqual([]);
      expect(parsed.data.tableStakes).toEqual([]);
    }
  });
});
