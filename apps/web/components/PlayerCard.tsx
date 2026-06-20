import type { PlayerProfile } from "@contextdev/core";
import { Card, CardHeader, CardContent } from "./ui/card.js";
import { Badge } from "./ui/badge.js";

interface PlayerCardProps {
  player: PlayerProfile;
  n: number;
}

export default function PlayerCard({ player, n }: PlayerCardProps) {
  const topFeatures = player.features.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-fg font-semibold">{player.name}</h3>
        <p className="text-muted text-sm">{player.oneLiner}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {/* Tags */}
          {player.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {player.tags.map((tag) => (
                <Badge key={tag} variant="neutral">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Top features */}
          {topFeatures.length > 0 && (
            <ul className="flex flex-col gap-1">
              {topFeatures.map((feature) => (
                <li key={feature} className="text-xs text-muted">
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {/* Confidence badge + source link */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="neutral">
              conf {player.confidence.toFixed(2)}
            </Badge>
            <a
              href={player.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline text-sm font-mono"
            >
              [{n}] {player.domain}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
