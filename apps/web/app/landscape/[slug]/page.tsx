import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { deslugify } from "@contextdev/core";
import { curatedSlugs, getCurated } from "../../../lib/landscape-catalog.js";
import { getOrGenerateLandscape } from "../../../lib/landscape-pages.js";
import { getMarketMotion } from "../../../lib/landscape-history.js";
import DossierBand from "../../../components/DossierBand.js";
import LandscapeMap from "../../../components/LandscapeMap.js";
import LandscapeMonitor from "../../../components/LandscapeMonitor.js";
import LandscapeView from "../../../components/LandscapeView.js";
import ShareButton from "../../../components/ShareButton.js";

export const dynamicParams = true;

export function generateStaticParams() {
  return curatedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const curated = getCurated(slug);
  const category = curated?.category ?? deslugify(slug);
  const title = `${category} landscape — tools compared & cited`;
  const description = curated
    ? `${curated.players.length} ${category} tools compared on capabilities, with evidence-cited profiles and a positioning map.`
    : `An auto-built, cited competitive landscape of the ${category} market.`;
  return {
    title, description,
    alternates: { canonical: `/landscape/${slug}` },
    openGraph: { title, description, type: "article" },
    robots: curated ? undefined : { index: false, follow: true },
  };
}

/* Dossier reference code from real data: slug initials + latest capture date. */
function refCode(slug: string, capturedAt: string | null): string {
  const initials = slug.split("-").map((w) => w[0]?.toUpperCase() ?? "").join("").slice(0, 4);
  return capturedAt ? `${initials}-${capturedAt.slice(0, 10)}` : initials;
}

export default async function LandscapePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landscape = await getOrGenerateLandscape(slug);
  const category = landscape?.category ?? deslugify(slug);
  const motion = getMarketMotion(slug);
  const latestCapture = motion?.entries[motion.entries.length - 1]?.capturedAt ?? null;

  return (
    <>
      {landscape && <DossierBand refCode={refCode(slug, latestCapture)} prepared={latestCapture?.slice(0, 10) ?? "on demand"} />}
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/landscape" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <ArrowLeft size={14} aria-hidden="true" /> All landscapes
          </Link>
          {landscape && <ShareButton slug={slug} />}
        </div>
        {landscape ? (
          <LandscapeView
            landscape={landscape}
            motionSlot={motion ? <LandscapeMonitor category={motion.category} entries={motion.entries} /> : undefined}
            mapSlot={<LandscapeMap landscape={landscape} />}
          />
        ) : (
          <div className="flex flex-col items-start gap-3 rule-t pt-8">
            <h1 className="display text-2xl text-fg">We haven&apos;t mapped &ldquo;{category}&rdquo; yet</h1>
            <p className="narrative text-muted">This market hasn&apos;t been generated. Map it from the home page and it becomes a shareable dossier.</p>
            <Link href="/" className="text-sm font-semibold text-primary hover:underline">Map a market →</Link>
          </div>
        )}
      </main>
    </>
  );
}
