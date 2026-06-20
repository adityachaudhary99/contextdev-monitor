'use client';
import { useState } from "react";
import { cn } from "../lib/cn.js";

interface PlayerLogoProps {
  name: string;
  domain: string;
  size?: number;
  className?: string;
}

/** Real company logo by domain with a graceful fallback chain:
 *  DuckDuckGo icons → Google favicon → monogram. */
export default function PlayerLogo({ name, domain, size = 40, className }: PlayerLogoProps) {
  const sources = [
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];
  const [idx, setIdx] = useState(0);
  const initial = (name.trim()[0] ?? domain[0] ?? "?").toUpperCase();

  if (idx >= sources.length) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg bg-surface-2 font-mono font-semibold text-muted",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initial}
      </span>
    );
  }
  return (
    <img
      src={sources[idx]}
      alt={`${name} logo`}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setIdx((i) => i + 1)}
      className={cn("shrink-0 rounded-lg border border-border bg-surface object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
