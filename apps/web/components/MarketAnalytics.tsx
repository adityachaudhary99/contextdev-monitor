import type { PlayerProfile } from "@contextdev/core";
import { computeMarketAnalytics } from "@contextdev/core/analytics";
import { BarChart3, DollarSign, GitBranch } from "lucide-react";
import { cn } from "../lib/cn.js";

function coverageTone(pct: number): string {
  if (pct >= 67) return "bg-primary";   // table stakes
  if (pct <= 33) return "bg-accent";    // differentiating / niche
  return "bg-muted";
}

export default function MarketAnalytics({ players }: { players: PlayerProfile[] }) {
  if (players.length === 0) return null;
  const { capabilityCoverage, pricing, composition } = computeMarketAnalytics(players);
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const compMax = Math.max(composition.openSource, composition.proprietary, composition.unknown, 1);

  return (
    <article className="flex flex-col gap-6 rounded-2xl border border-border bg-surface/60 p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
        <BarChart3 size={13} aria-hidden="true" /> Market analytics
      </div>

      {capabilityCoverage.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Capability coverage</h3>
          <ul className="flex flex-col gap-2">
            {capabilityCoverage.map((c) => (
              <li key={c.capability} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm text-fg" title={c.capability}>{c.capability}</span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-bg/60">
                  <span className={cn("absolute inset-y-0 left-0 rounded-full", coverageTone(c.pct))} style={{ width: `${c.pct}%` }} aria-hidden="true" />
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-muted">
                  {c.count}/{players.length} · {c.pct}%
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-primary align-middle" aria-hidden="true" /> table stakes ·{" "}
            <span className="inline-block h-2 w-2 rounded-full bg-accent align-middle" aria-hidden="true" /> differentiating
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section className="flex flex-col gap-2.5">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <DollarSign size={13} className="text-primary" aria-hidden="true" /> Pricing
          </h3>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Free tier</dt>
              <dd className="font-mono tabular-nums text-fg">{pricing.withFreeTier}/{pricing.total} players</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Entry price</dt>
              <dd className="font-mono tabular-nums text-fg">
                {pricing.min != null && pricing.max != null
                  ? (pricing.min === pricing.max ? fmt(pricing.min) : `${fmt(pricing.min)}–${fmt(pricing.max)}`)
                  : "not disclosed"}
              </dd>
            </div>
            {pricing.median != null && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Median</dt>
                <dd className="font-mono tabular-nums text-fg">{fmt(pricing.median)}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="flex flex-col gap-2.5">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <GitBranch size={13} className="text-primary" aria-hidden="true" /> Composition
          </h3>
          <ul className="flex flex-col gap-1.5">
            {[
              { label: "Open source", value: composition.openSource, tone: "bg-success" },
              { label: "Proprietary", value: composition.proprietary, tone: "bg-primary" },
              { label: "Unknown", value: composition.unknown, tone: "bg-muted" },
            ].map((row) => (
              <li key={row.label} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-muted">{row.label}</span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-bg/60">
                  <span className={cn("absolute inset-y-0 left-0 rounded-full", row.tone)} style={{ width: `${(row.value / compMax) * 100}%` }} aria-hidden="true" />
                </span>
                <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-fg">{row.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
