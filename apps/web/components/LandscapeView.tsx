'use client';

import type { ReactNode } from "react";
import type { Landscape } from "@contextdev/core";
import { AlertTriangle, Copy } from "lucide-react";
import { Button } from "./ui/button.js";
import ComparisonTable from "./ComparisonTable.js";
import PlayerCard from "./PlayerCard.js";
import AnalystReport from "./AnalystReport.js";
import MarketAnalytics from "./MarketAnalytics.js";
import ExportWebdogButton from "./ExportWebdogButton.js";

interface LandscapeViewProps {
  landscape: Landscape;
  /** Dossier pages inject the Motion Ledger here (right after the header). */
  motionSlot?: ReactNode;
  /** Dossier pages inject the positioning map here (framed as an exhibit). */
  mapSlot?: ReactNode;
}

export default function LandscapeView({ landscape, motionSlot, mapSlot }: LandscapeViewProps) {
  const { category, players, failures, brief, creditsUsed, latencyMs } = landscape;

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <h1 className="display text-3xl text-fg sm:text-4xl">{category}</h1>
        <p className="stamp tnum text-muted">
          {players.length} player{players.length === 1 ? "" : "s"} mapped · {creditsUsed} credits, {(latencyMs / 1000).toFixed(1)}s
        </p>
        <p className="narrative max-w-[72ch] text-muted">{brief}</p>
        <div>
          <ExportWebdogButton landscape={landscape} />
        </div>
      </header>

      {motionSlot}

      {mapSlot && <div className="exhibit">{mapSlot}</div>}

      {landscape.analyst && <AnalystReport report={landscape.analyst} />}

      <div className="exhibit">
        <MarketAnalytics players={players} />
        <p className="exhibit-caption">Derived from {players.length} profiles, no extra credits</p>
      </div>

      <section className="flex flex-col gap-3 rule-t pt-5">
        <h2 className="display text-lg text-fg">Capability matrix</h2>
        <ComparisonTable landscape={landscape} />
      </section>

      <section className="flex flex-col gap-4 rule-t pt-5">
        <h2 className="display text-lg text-fg">Subject profiles</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player, idx) => (
            <div key={player.domain} className="reveal" style={{ animationDelay: `${idx * 50}ms` }}>
              <PlayerCard player={player} n={idx + 1} />
            </div>
          ))}
        </div>
      </section>

      {failures.length > 0 && (
        <section className="flex flex-col gap-2 rule-t pt-5">
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
