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
      <header className="mb-10 flex flex-col gap-3">
        <h1 className="display text-3xl text-fg">Published dossiers</h1>
        <p className="narrative max-w-[72ch] text-muted">Auto-built, evidence-cited competitive maps: the players in a market, compared on capabilities, with a positioning map and a motion ledger.</p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ slug, landscape }) => (
          <Link key={slug} href={`/landscape/${slug}`}
            className="group flex flex-col gap-3 rounded-md border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary">
            <span className="stamp flex items-center gap-2 text-accent">
              <MapIcon size={13} aria-hidden="true" /> Market dossier
            </span>
            <h2 className="display text-lg text-fg">{landscape.category}</h2>
            <p className="text-sm text-muted">{landscape.players.length} tools · {landscape.comparison.dimensions.slice(0, 3).join(", ")}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
