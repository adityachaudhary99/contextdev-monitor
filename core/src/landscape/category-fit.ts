import type { LlmClient } from "../llm/llm-client.js";
import type { PlayerProfile } from "./types.js";

const norm = (d: string) => d.toLowerCase().replace(/^www\./, "");

/**
 * LLM-judged category fit. Returns the set of player domains that genuinely belong in the
 * category, or null when no LLM / the call or parse fails (caller falls back to the heuristic).
 * Never throws. One batched call.
 */
export async function judgeCategoryFit(
  category: string, players: PlayerProfile[], llm: LlmClient | null,
): Promise<Set<string> | null> {
  if (!llm || players.length === 0) return null;
  const list = players.map((p, i) => `${i + 1}. ${p.domain} — ${p.name}: ${p.oneLiner}`).join("\n");
  const prompt =
    `You are curating a competitive market landscape for the category: "${category}".\n` +
    `For each candidate, decide whether it GENUINELY belongs in that exact category (a direct ` +
    `player in that market) — not merely adjacent or keyword-matching. Be strict: exclude tooling, ` +
    `infrastructure, benchmarks, and unrelated products.\n` +
    `If the category contains a qualifier (e.g. "open source", "free", "self-hosted", "no-code"), ` +
    `the player must actually satisfy it — EXCLUDE closed/proprietary-only or non-matching vendors ` +
    `even if they are prominent in the broader space (e.g. exclude a closed-source vendor from an ` +
    `"open source" category).\n\n${list}\n\n` +
    `Reply with ONLY a JSON array of the domains that genuinely belong, e.g. ["a.com","b.com"]. No prose.`;
  const r = await llm.complete(prompt);
  if (!r.ok) return null;
  try {
    const match = r.value.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const arr = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(arr)) return null;
    return new Set(arr.filter((x): x is string => typeof x === "string").map(norm));
  } catch {
    return null;
  }
}
