"use client";
import { Download } from "lucide-react";
import { toWebdogWatchlist } from "@contextdev/core/webdog";
import type { Landscape } from "@contextdev/core";

const slugish = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function ExportWebdogButton({ landscape }: { landscape: Landscape }) {
  const download = () => {
    const blob = new Blob([JSON.stringify(toWebdogWatchlist(landscape), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webdog-watchlist-${slugish(landscape.category)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" onClick={download}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:text-fg"
      aria-label="Export a Webdog watch-list">
      <Download size={13} aria-hidden="true" /> Webdog watch-list
    </button>
  );
}
