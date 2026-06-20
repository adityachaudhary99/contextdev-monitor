import type { Metadata } from "next";
import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import { curatedList } from "../../lib/landscape-catalog.js";

export const metadata: Metadata = {
  title: "Market landscapes — auto-built, cited competitive maps",
  description: "Browse auto-generated, evidence-cited competitive landscapes: the players in each market, compared on capabilities, with a positioning map.",
  alternates: { canonical: "/landscape" },
};

export default function LandscapeIndex() {
  const items = curatedList();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Market landscapes</h1>
        <p className="max-w-2xl text-sm text-muted">Auto-built, evidence-cited competitive maps — the players in a market, compared on capabilities, with a positioning map.</p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ slug, landscape }) => (
          <Link key={slug} href={`/landscape/${slug}`}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40">
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
              <MapIcon size={14} aria-hidden="true" /> landscape
            </span>
            <h2 className="font-semibold text-fg">{landscape.category}</h2>
            <p className="text-sm text-muted">{landscape.players.length} tools · {landscape.comparison.dimensions.slice(0, 3).join(", ")}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
