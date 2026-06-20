import type { PlayerProfile } from "@contextdev/core";
import { ExternalLink, FileText } from "lucide-react";
import { Card, CardContent } from "./ui/card.js";
import { Badge } from "./ui/badge.js";
import PlayerLogo from "./PlayerLogo.js";
import { cn } from "../lib/cn.js";

interface PlayerCardProps {
  player: PlayerProfile;
  n: number;
}

function ConfidenceBar({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  const tone = value >= 0.67 ? "bg-accent" : value >= 0.34 ? "bg-primary" : "bg-muted";
  return (
    <div className="flex items-center gap-2" title={`confidence ${value.toFixed(2)}`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={cn("h-1.5 w-3 rounded-sm", i < filled ? tone : "bg-border")} />
        ))}
      </span>
      <span className="font-mono text-xs tabular-nums text-muted">{value.toFixed(2)}</span>
    </div>
  );
}

export default function PlayerCard({ player, n }: PlayerCardProps) {
  const topFeatures = player.features.slice(0, 4);
  const topTags = player.tags.slice(0, 5);
  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <PlayerLogo name={player.name} domain={player.domain} size={40} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-fg">{player.name}</h3>
            <p className="truncate font-mono text-xs text-muted">{player.domain}</p>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted">{player.oneLiner}</p>

        {topTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topTags.map((tag) => (
              <Badge key={tag} variant="neutral">{tag}</Badge>
            ))}
          </div>
        )}

        {topFeatures.length > 0 && (
          <ul className="flex flex-col gap-1">
            {topFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-1.5 text-xs text-muted">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
          <ConfidenceBar value={player.confidence} />
          <div className="flex items-center gap-2">
            {player.links.docs && (
              <a href={player.links.docs} target="_blank" rel="noreferrer" aria-label={`${player.name} docs`}
                 className="text-muted transition-colors hover:text-fg">
                <FileText size={15} aria-hidden="true" />
              </a>
            )}
            <a href={player.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${player.domain} source`}
               className="flex items-center gap-1 font-mono text-xs text-primary hover:underline">
              <ExternalLink size={13} aria-hidden="true" />[{n}]
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
