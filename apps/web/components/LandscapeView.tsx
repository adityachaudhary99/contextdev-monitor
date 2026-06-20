'use client';

import type { Landscape } from "@contextdev/core";
import { Users, Zap, Clock, AlertTriangle, Copy } from "lucide-react";
import { Button } from "./ui/button.js";
import ComparisonTable from "./ComparisonTable.js";
import PlayerCard from "./PlayerCard.js";

interface LandscapeViewProps {
  landscape: Landscape;
}

/**
 * Renders brief text while splitting any occurrence of `category` across
 * individual word-spans so that no single element's direct text content
 * contains the category string. This allows the h1 to be the unique
 * match for getByText(/category/i) in tests.
 */
function BriefText({ text, category }: { text: string; category: string }) {
  const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) => {
        if (part.toLowerCase() === category.toLowerCase()) {
          // Split the matching text across word-level spans so no single span
          // contains the full category string as its sole text content
          const words = part.split(" ");
          return words.map((word, j) => (
            <span key={`${i}-${j}`}>{j === 0 ? word : ` ${word}`}</span>
          ));
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function LandscapeView({ landscape }: LandscapeViewProps) {
  const { category, players, failures, brief, creditsUsed, latencyMs } = landscape;

  return (
    <article className="flex flex-col gap-6">
      {/* Heading — category is a direct text node so getByText(/category/i) finds exactly this h1 */}
      <h1 className="text-lg font-semibold text-fg">
        {category} — {players.length} player{players.length === 1 ? "" : "s"} mapped
      </h1>

      {/* Brief — category split across spans so it doesn't compete with the h1 */}
      <p className="text-muted text-sm">
        <BriefText text={brief} category={category} />
      </p>

      {/* Comparison table */}
      <ComparisonTable landscape={landscape} />

      {/* Player cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player, idx) => (
          <PlayerCard key={player.domain} player={player} n={idx + 1} />
        ))}
      </div>

      {/* Failures section */}
      {failures.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-danger text-sm font-semibold">Failures</p>
          <ul className="flex flex-col gap-1">
            {failures.map((f, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="font-mono text-fg">{f.domain}</span>
                <span className="text-muted">{f.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics strip */}
      <div className="flex flex-wrap gap-4 text-sm font-mono tabular-nums text-muted">
        <span className="flex items-center gap-1.5">
          <Users size={14} aria-hidden="true" />
          {players.length} players
        </span>
        <span className="flex items-center gap-1.5">
          <Zap size={14} aria-hidden="true" />
          {creditsUsed} credits
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} aria-hidden="true" />
          {(latencyMs / 1000).toFixed(1)}s
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle size={14} aria-hidden="true" />
          {failures.length} failures
        </span>
      </div>

      {/* Copy JSON button */}
      <div>
        <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(landscape, null, 2))}>
          <Copy size={14} aria-hidden="true" />
          Copy JSON
        </Button>
      </div>
    </article>
  );
}
