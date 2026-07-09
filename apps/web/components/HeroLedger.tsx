import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, CircleDashed, Activity } from "lucide-react";
// Client-bundle-safe subpath (pure module, no node built-ins) — never the root barrel here.
import { buildMotionTimeline } from "@contextdev/core/motion";
import type { LandscapeSnapshot } from "@contextdev/core";
import history from "../data/landscape-history/web-scraping-apis.json";

/* A real excerpt of the web-scraping-APIs dossier, rendered from committed snapshot data.
   The hero shows the actual product output, not a mockup. */
export default function HeroLedger() {
  const timeline = buildMotionTimeline(history as LandscapeSnapshot[]);
  const latest = timeline[timeline.length - 1];
  if (!latest) return null;

  const diff = latest.diff;
  const rows: { key: string; icon: React.ReactNode; tone: string; text: React.ReactNode }[] = [];
  if (diff) {
    for (const p of diff.entered) rows.push({
      key: `in-${p.domain}`, icon: <ArrowUpRight size={14} />, tone: "text-success",
      text: <><span className="font-semibold text-fg">{p.name}</span> entered the market</>,
    });
    for (const p of diff.exited) rows.push({
      key: `out-${p.domain}`, icon: <ArrowDownRight size={14} />, tone: "text-danger",
      text: <><span className="font-semibold text-fg">{p.name}</span> no longer found (possible exit)</>,
    });
    for (const p of diff.lostFromMap ?? []) rows.push({
      key: `lost-${p.domain}`, icon: <CircleDashed size={14} />, tone: "text-ghost",
      text: <><span className="font-semibold text-fg">{p.name}</span> lost from map ({p.reason})</>,
    });
  }
  const shown = rows.slice(0, 4);

  return (
    <Link
      href="/landscape/web-scraping-apis"
      className="group block rounded-md border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary"
      aria-label="Open the web scraping APIs dossier"
    >
      <div className="flex items-baseline justify-between gap-2 border-b border-border pb-3">
        <span className="stamp flex items-center gap-1.5 text-accent"><Activity size={12} aria-hidden="true" /> Market motion</span>
        <span className="stamp tnum text-muted">{latest.capturedAt.slice(0, 10)}</span>
      </div>
      <p className="narrative mt-3 text-[15px] text-fg">web scraping APIs</p>
      <ul className="mt-2 flex flex-col gap-1.5 border-l-2 border-accent pl-4">
        {shown.map((r) => (
          <li key={r.key} className="flex items-start gap-2 text-sm text-muted">
            <span className={`mt-0.5 shrink-0 ${r.tone}`} aria-hidden="true">{r.icon}</span>
            <span>{r.text}</span>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="text-sm text-muted">Baseline captured. {latest.playerCount} players tracked.</li>
        )}
      </ul>
      <p className="stamp mt-4 text-primary transition-colors group-hover:text-fg">Read the dossier →</p>
    </Link>
  );
}
