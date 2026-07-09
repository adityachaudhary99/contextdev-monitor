/* The classification band: a thin navy strip of real report metadata under the header.
   Every token is real data (ref from slug+date, counts) — never slogans. */
export default function DossierBand({ refCode, prepared }: { refCode: string; prepared: string }) {
  return (
    <div className="bg-primary text-primary-fg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-1.5">
        <span className="stamp tnum">Market dossier {refCode}</span>
        <span className="stamp tnum hidden sm:inline">Prepared {prepared} · open-source intelligence</span>
      </div>
    </div>
  );
}
