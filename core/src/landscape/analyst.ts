import { z } from "zod";
import type { LlmClient } from "../llm/llm-client.js";
import type { PlayerProfile } from "./types.js";

export const AnalystReportSchema = z.object({
  overview: z.string().default(""),
  segments: z.array(z.object({
    name: z.string(),
    members: z.array(z.string()).default([]),
    note: z.string().default(""),
  })).default([]),
  leaders: z.array(z.object({ name: z.string(), why: z.string().default("") })).default([]),
  tableStakes: z.array(z.string()).default([]),
  differentiators: z.array(z.object({ player: z.string(), edge: z.string().default("") })).default([]),
  gaps: z.array(z.string()).default([]),
  picks: z.array(z.object({
    useCase: z.string(),
    player: z.string().default(""),
    why: z.string().default(""),
  })).default([]),
});
export type AnalystReport = z.infer<typeof AnalystReportSchema>;

function digest(players: PlayerProfile[]): string {
  return players.map((p, i) => {
    const lines = [`${i + 1}. ${p.name} (${p.domain})`];
    if (p.oneLiner) lines.push(`   summary: ${p.oneLiner}`);
    if (p.tags.length) lines.push(`   tags: ${p.tags.slice(0, 8).join(", ")}`);
    if (p.features.length) lines.push(`   features: ${p.features.slice(0, 6).join("; ")}`);
    if (p.differentiators?.length) lines.push(`   edge: ${p.differentiators.slice(0, 3).join("; ")}`);
    if (p.pricing?.startingPrice || p.pricing?.free)
      lines.push(`   pricing: ${p.pricing?.startingPrice ? `from ${p.pricing.startingPrice}` : "see site"}${p.pricing?.free ? " (free tier)" : ""}`);
    if (p.targetSegment) lines.push(`   segment: ${p.targetSegment}`);
    return lines.join("\n");
  }).join("\n");
}

function hasContent(r: AnalystReport): boolean {
  return Boolean(r.overview.trim()) || r.segments.length > 0 || r.leaders.length > 0 ||
    r.tableStakes.length > 0 || r.differentiators.length > 0 || r.picks.length > 0;
}

/**
 * LLM-synthesized competitive analysis for a landscape. One batched call.
 * Returns null when there is no llm / no players / the call fails / output is
 * unparseable or contentless — the caller then keeps the templated brief. Never throws.
 */
export async function synthesizeAnalystReport(
  category: string, players: PlayerProfile[], dimensions: string[], llm: LlmClient | null,
): Promise<AnalystReport | null> {
  if (!llm || players.length === 0) return null;
  const common = dimensions.slice(0, 8).join(", ") || "—";
  const prompt =
    `You are a market analyst writing a competitive-intelligence brief for the category "${category}".\n` +
    `Below are the ${players.length} players that were discovered and profiled, with their extracted data.\n\n` +
    `${digest(players)}\n\n` +
    `Capabilities seen across the set: ${common}.\n\n` +
    `Produce a STRUCTURED analysis as a single JSON object with EXACTLY these keys:\n` +
    `- "overview": 2-4 sentences on the market's shape, maturity, and dynamics.\n` +
    `- "segments": 2-4 objects { "name": short label, "members": [player names from the list], "note": one sentence }. Group the players meaningfully.\n` +
    `- "leaders": 2-3 objects { "name": player name, "why": one sentence } — the most established/comprehensive players.\n` +
    `- "tableStakes": short phrases for capabilities nearly every player offers (the price of entry).\n` +
    `- "differentiators": objects { "player": name, "edge": one sentence } — what uniquely sets specific players apart.\n` +
    `- "gaps": short phrases naming underserved needs / whitespace in this market.\n` +
    `- "picks": 3-4 objects { "useCase": a buyer need, "player": the name you'd recommend, "why": one sentence }.\n\n` +
    `Base every claim ONLY on the provided data. Use player names EXACTLY as written above. ` +
    `Reply with ONLY the JSON object — no prose, no markdown fences.`;
  const r = await llm.complete(prompt, { maxTokens: 3000 });
  if (!r.ok) return null;
  try {
    const match = r.value.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = AnalystReportSchema.safeParse(JSON.parse(match[0]));
    if (!parsed.success) return null;
    return hasContent(parsed.data) ? parsed.data : null;
  } catch {
    return null;
  }
}
