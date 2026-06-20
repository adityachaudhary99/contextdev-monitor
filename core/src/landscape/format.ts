// Pure, terminal-readable summary of a Landscape (used by the cartographer CLI + the skill example).
import type { Landscape } from "./types.js";

export function formatLandscapeSummary(ls: Landscape): string {
  const out: string[] = [];
  const n = ls.players.length;
  out.push(`# ${ls.category} — ${n} player${n === 1 ? "" : "s"} mapped`, "");
  if (ls.brief) out.push(ls.brief, "");
  if (ls.comparison.dimensions.length) out.push(`Capabilities: ${ls.comparison.dimensions.join(", ")}`, "");
  ls.players.forEach((p, i) => {
    out.push(`${i + 1}. ${p.name}  (${p.domain})`);
    if (p.oneLiner) out.push(`   ${p.oneLiner}`);
    if (p.tags.length) out.push(`   tags: ${p.tags.slice(0, 6).join(", ")}`);
    out.push(`   [${i + 1}] ${p.sourceUrl}`);
  });
  if (ls.failures.length) {
    out.push("", `Couldn't profile (${ls.failures.length}): ${ls.failures.map((f) => `${f.domain || "?"} (${f.reason})`).join(", ")}`);
  }
  out.push("", `${ls.creditsUsed} credits · ${(ls.latencyMs / 1000).toFixed(1)}s`);
  return out.join("\n");
}
