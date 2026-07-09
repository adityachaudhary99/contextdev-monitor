import type { LandscapeSnapshot, LandscapeDiff } from "./diff.js";
import { diffLandscapes } from "./diff.js";

export type MotionEntry = { capturedAt: string; playerCount: number; diff: LandscapeDiff | null };

/** Full check-by-check timeline over a snapshot history. Pure; sorts a copy; diff is null at baseline. */
export function buildMotionTimeline(history: LandscapeSnapshot[]): MotionEntry[] {
  const sorted = [...history].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  return sorted.map((s, i) => ({
    capturedAt: s.capturedAt,
    playerCount: s.players.length,
    diff: i === 0 ? null : diffLandscapes(sorted[i - 1], s),
  }));
}

const day = (iso: string) => iso.slice(0, 10);

/** GitHub-flavored markdown rendering of one landscape diff. Pure; used by the web page, the market-watch issue body, and the agent skill. */
export function diffToMarkdown(category: string, diff: LandscapeDiff): string {
  const lines: string[] = [`### ${category} — market motion (${day(diff.fromCapturedAt)} → ${day(diff.toCapturedAt)})`, ""];
  const lostFromMap = diff.lostFromMap ?? [];
  const hasIndicativeRows = lostFromMap.length > 0 || diff.capabilityChanges.length > 0;
  if (!diff.hasChanges && !hasIndicativeRows) { lines.push("No material changes."); return lines.join("\n"); }
  if (!diff.hasChanges) lines.push("No confirmed market changes.");
  for (const p of diff.entered) lines.push(`- 🟢 **${p.name}** (${p.domain}) entered the market`);
  for (const p of diff.exited) lines.push(`- 🔴 **${p.name}** (${p.domain}) no longer found — possible market exit`);
  for (const p of lostFromMap) lines.push(`- ⚪ **${p.name}** (${p.domain}) left the map this check (${p.reason}) — extraction loss, not necessarily a market exit`);
  for (const c of diff.pricingChanges)
    lines.push(`- 💰 **${c.name}** ${c.field === "price" ? "starting price" : "free tier"}: \`${c.from}\` → \`${c.to}\``);
  if (diff.capabilityChanges.length) lines.push("**Capability mix** (indicative — extraction-sensitive):");
  for (const c of diff.capabilityChanges) {
    const parts: string[] = [];
    if (c.added.length) parts.push(c.added.map((t) => `+${t}`).join(" "));
    if (c.removed.length) parts.push(c.removed.map((t) => `−${t}`).join(" "));
    lines.push(`- 🏷️ **${c.name}** capabilities: ${parts.join(" · ")}`);
  }
  return lines.join("\n");
}
