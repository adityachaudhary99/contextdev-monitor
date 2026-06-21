'use client';

import type { ReactNode } from "react";
import type { Landscape } from "@contextdev/core";
import { Users, Coins, Clock, AlertTriangle, Copy, Gauge } from "lucide-react";
import { Button } from "./ui/button.js";
import ComparisonTable from "./ComparisonTable.js";
import PlayerCard from "./PlayerCard.js";
import AnalystReport from "./AnalystReport.js";

interface LandscapeViewProps {
  landscape: Landscape;
}

function Kpi({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-primary" aria-hidden="true">{icon}</span>
      <span className="flex flex-col">
        <span className="font-mono text-lg font-semibold leading-none tabular-nums text-fg">{value}</span>
        <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      </span>
    </div>
  );
}

export default function LandscapeView({ landscape }: LandscapeViewProps) {
  const { category, players, failures, brief, creditsUsed, latencyMs } = landscape;
  const avgConf = players.length ? players.reduce((s, p) => s + p.confidence, 0) / players.length : 0;

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          Market landscape
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {category} <span className="text-muted">· {players.length} player{players.length === 1 ? "" : "s"} mapped</span>
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted">{brief}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi icon={<Users size={16} />} label="players" value={String(players.length)} />
        <Kpi icon={<Gauge size={16} />} label="avg conf" value={avgConf.toFixed(2)} />
        <Kpi icon={<Coins size={16} />} label="credits" value={String(creditsUsed)} />
        <Kpi icon={<Clock size={16} />} label="latency" value={`${(latencyMs / 1000).toFixed(1)}s`} />
        <Kpi icon={<AlertTriangle size={16} />} label="failures" value={String(failures.length)} />
      </div>

      {landscape.analyst && <AnalystReport report={landscape.analyst} />}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Capability matrix</h2>
        <ComparisonTable landscape={landscape} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player, idx) => (
          <div key={player.domain} className="reveal" style={{ animationDelay: `${idx * 50}ms` }}>
            <PlayerCard player={player} n={idx + 1} />
          </div>
        ))}
      </section>

      {failures.length > 0 && (
        <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2/40 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-warn">
            <AlertTriangle size={14} aria-hidden="true" /> Couldn&apos;t profile ({failures.length})
          </p>
          <ul className="flex flex-col gap-1">
            {failures.map((f, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="font-mono text-fg">{f.domain}</span>
                <span className="text-muted">{f.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div>
        <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(landscape, null, 2))}>
          <Copy size={14} aria-hidden="true" /> Copy JSON
        </Button>
      </div>
    </article>
  );
}
