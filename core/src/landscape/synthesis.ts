// core/src/landscape/synthesis.ts
import type { PlayerProfile, ProfileFailure, Landscape } from "./types.js";

function topDimensions(players: PlayerProfile[], k: number): string[] {
  const freq = new Map<string, number>();
  for (const p of players) for (const f of p.features) {
    const key = f.trim().toLowerCase();
    if (key) freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, k).map(([d]) => d);
}
function buildBrief(category: string, players: PlayerProfile[], failures: ProfileFailure[], dims: string[]): string {
  const n = players.length, m = failures.length;
  const common = dims.slice(0, 3).join(", ") || "—";
  const names = players.map((p) => p.name).join(", ");
  return `Mapped ${n} player${n === 1 ? "" : "s"} in "${category}"${m ? ` (${m} couldn't be profiled)` : ""}. ` +
    `Most common capabilities: ${common}. Players: ${names || "none"}.`;
}
export function buildLandscape(input: {
  category: string; players: PlayerProfile[]; failures: ProfileFailure[]; creditsUsed: number; latencyMs: number;
}): Landscape {
  const citations = input.players.map((p, i) => ({ n: i + 1, title: `${p.name} — ${p.domain}`, url: p.sourceUrl }));
  const dimensions = topDimensions(input.players, 6);
  return {
    category: input.category, players: input.players, failures: input.failures,
    comparison: { dimensions }, brief: buildBrief(input.category, input.players, input.failures, dimensions),
    citations, creditsUsed: input.creditsUsed, latencyMs: input.latencyMs,
  };
}
