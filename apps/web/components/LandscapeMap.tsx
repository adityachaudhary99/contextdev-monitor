'use client';
import type { Landscape, PlayerProfile } from "@contextdev/core";
import PlayerLogo from "./PlayerLogo.js";
import { cn } from "../lib/cn.js";

interface LandscapeMapProps { landscape: Landscape; }

function breadth(player: PlayerProfile, dims: string[]): number {
  if (dims.length === 0) return 0;
  const tags = new Set(player.tags.map((t) => t.toLowerCase()));
  return dims.filter((d) => tags.has(d.toLowerCase())).length;
}

export default function LandscapeMap({ landscape }: LandscapeMapProps) {
  const dims = landscape.comparison.dimensions;
  const players = landscape.players;
  if (players.length === 0) return null;
  const maxB = Math.max(1, dims.length);
  const maxF = Math.max(1, ...players.map((p) => p.features.length));

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="text-sm font-semibold uppercase tracking-wide text-muted">Positioning map</figcaption>
      <div className="relative w-full rounded-2xl border border-border bg-surface shadow-card">
        <div className="relative aspect-[16/10] w-full">
          {/* gridlines */}
          <div className="absolute inset-10 rounded-lg border border-border" aria-hidden="true">
            <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-border" />
          </div>
          {/* axis labels */}
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[11px] text-muted" aria-hidden="true">capability breadth →</span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 font-mono text-[11px] text-muted" aria-hidden="true">feature depth ↑</span>
          <span className="absolute right-3 top-3 font-mono text-[10px] uppercase tracking-wide text-muted/70" aria-hidden="true">leaders</span>
          {/* markers */}
          <div className="absolute inset-10">
            {players.map((p) => {
              const x = (breadth(p, dims) / maxB) * 100;
              const depth = p.features.length / maxF;
              const y = depth * 100;
              const tone = depth >= 0.67 ? "ring-accent" : depth >= 0.34 ? "ring-primary" : "ring-muted";
              return (
                <div key={p.domain} className="group absolute -translate-x-1/2 translate-y-1/2" style={{ left: `${x}%`, bottom: `${y}%` }}>
                  <span className={cn("block rounded-lg ring-2", tone)} title={`${p.name} — breadth ${breadth(p, dims)}/${maxB}, ${p.features.length} features`}>
                    <PlayerLogo name={p.name} domain={p.domain} size={28} />
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-fg px-1.5 py-0.5 text-[10px] font-medium text-bg opacity-0 transition-opacity group-hover:opacity-100">
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>Players by capability breadth and feature depth</caption>
        <thead><tr><th>Player</th><th>Breadth</th><th>Features</th></tr></thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.domain}><td>{p.name}</td><td>{breadth(p, dims)}/{maxB}</td><td>{p.features.length}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
