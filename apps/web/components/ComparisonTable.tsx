import type { Landscape } from "@contextdev/core";
import { Check, Minus } from "lucide-react";
import PlayerLogo from "./PlayerLogo.js";
import { cn } from "../lib/cn.js";

interface ComparisonTableProps {
  landscape: Landscape;
}

export default function ComparisonTable({ landscape }: ComparisonTableProps) {
  const { players, comparison } = landscape;
  const dims = comparison.dimensions;
  if (dims.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 z-10 bg-surface px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
              Player
            </th>
            {dims.map((dim) => (
              <th key={dim} className="whitespace-nowrap px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                {dim}
              </th>
            ))}
            <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted">Conf</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => {
            const tagSet = new Set(player.tags.map((t) => t.toLowerCase()));
            return (
              <tr key={player.domain} className={cn("border-b border-border transition-colors hover:bg-surface-2", i % 2 === 1 && "bg-surface-2/50")}>
                <th scope="row" className="sticky left-0 z-10 bg-inherit px-4 py-3 text-left font-medium text-fg">
                  <span className="flex items-center gap-2.5">
                    <PlayerLogo name={player.name} domain={player.domain} size={22} />
                    <span className="min-w-0">
                      <span className="block truncate">{player.name}</span>
                      <span className="block truncate font-mono text-[11px] font-normal text-muted">{player.domain}</span>
                    </span>
                  </span>
                </th>
                {dims.map((dim) => (
                  <td key={dim} className="px-3 py-3 text-center">
                    {tagSet.has(dim.toLowerCase()) ? (
                      <Check size={15} aria-label="yes" className="mx-auto text-success" />
                    ) : (
                      <Minus size={15} aria-label="no" className="mx-auto text-border" />
                    )}
                  </td>
                ))}
                <td className="px-3 py-3 text-right font-mono text-xs tabular-nums text-muted">{player.confidence.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
