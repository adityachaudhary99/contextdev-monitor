import type { LandscapeDiff, MotionEntry } from "@contextdev/core";
import { Activity, ArrowUpRight, ArrowDownRight, DollarSign, Tags, CircleDashed } from "lucide-react";

const day = (iso: string) => iso.slice(0, 10);

function ChangeRow({ icon, tone, index, children }: { icon: React.ReactNode; tone: string; index?: number; children: React.ReactNode }) {
  return (
    <li className="file-in flex items-start gap-2.5 text-[15px] leading-relaxed" style={index === undefined ? undefined : ({ "--i": index } as React.CSSProperties)}>
      <span className={`mt-1 shrink-0 ${tone}`} aria-hidden="true">{icon}</span>
      <span className="text-muted">{children}</span>
    </li>
  );
}

function DiffRows({ diff, stagger = false }: { diff: LandscapeDiff; stagger?: boolean }) {
  const lostFromMap = diff.lostFromMap ?? [];
  let i = 0;
  const idx = () => (stagger ? i++ : undefined);

  return (
    <>
      {diff.entered.map((p) => (
        <ChangeRow key={`in-${p.domain}`} index={idx()} icon={<ArrowUpRight size={15} />} tone="text-success">
          <span className="font-semibold text-fg">{p.name}</span> entered the market
        </ChangeRow>
      ))}
      {diff.exited.map((p) => (
        <ChangeRow key={`out-${p.domain}`} index={idx()} icon={<ArrowDownRight size={15} />} tone="text-danger">
          <span className="font-semibold text-fg">{p.name}</span> no longer found (possible exit)
        </ChangeRow>
      ))}
      {diff.pricingChanges.map((c, n) => (
        <ChangeRow key={`price-${c.domain}-${n}`} index={idx()} icon={<DollarSign size={15} />} tone="text-primary">
          <span className="font-semibold text-fg">{c.name}</span>{" "}
          {c.field === "price" ? "price" : "free tier"}: <span className="font-mono tnum text-[13px]">{c.from}</span> → <span className="font-mono tnum text-[13px] font-medium text-fg">{c.to}</span>
        </ChangeRow>
      ))}
      {lostFromMap.map((p) => (
        <ChangeRow key={`lost-${p.domain}`} index={idx()} icon={<CircleDashed size={15} />} tone="text-ghost">
          <span className="font-semibold text-fg">{p.name}</span> lost from map ({p.reason}), extraction, not a confirmed exit
        </ChangeRow>
      ))}
      {diff.capabilityChanges.length > 0 && (
        <li className="stamp pt-2 text-ghost">Capability mix (indicative)</li>
      )}
      {diff.capabilityChanges.map((c) => (
        <ChangeRow key={`cap-${c.domain}`} index={idx()} icon={<Tags size={15} />} tone="text-ghost">
          <span className="font-semibold text-fg">{c.name}</span>
          {c.added.length > 0 && <> +{c.added.join(", ")}</>}
          {c.removed.length > 0 && <> −{c.removed.join(", ")}</>}
        </ChangeRow>
      ))}
    </>
  );
}

const hasIndicativeRows = (diff: LandscapeDiff) => (diff.lostFromMap ?? []).length > 0 || diff.capabilityChanges.length > 0;

/** The Motion Ledger — the dossier's signature artifact: a dated, ruled ledger of market checks. */
export default function LandscapeMonitor({
  category, entries,
}: { category: string; entries: MotionEntry[] }) {
  const latest = entries[entries.length - 1];
  const older = entries.slice(0, -1).reverse();

  if (!latest) return null;

  return (
    <section aria-label="Market motion">
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 rule-t pt-5">
        <h2 className="stamp flex items-center gap-2 text-accent">
          <Activity size={13} aria-hidden="true" /> Market motion
        </h2>
        <span className="stamp tnum text-muted">
          {entries.length} check{entries.length === 1 ? "" : "s"} · {latest.playerCount} players tracked
        </span>
      </div>

      <div className="border-l-2 border-accent pl-5 sm:pl-6">
        <p className="stamp tnum mb-2 text-fg">{day(latest.capturedAt)} · latest check</p>

        {!latest.diff && (
          <p className="narrative text-muted">
            <span className="font-semibold text-fg">Baseline captured {day(latest.capturedAt)}.</span>{" "}
            Tracking the {category} market. The next check surfaces new entrants, exits, and pricing moves.
          </p>
        )}

        {latest.diff && !latest.diff.hasChanges && (
          <div className="flex flex-col gap-2.5">
            <p className="narrative text-muted">
              {hasIndicativeRows(latest.diff)
                ? <><span className="font-semibold text-fg">No confirmed changes</span> since {day(latest.diff.fromCapturedAt)}. Last checked {day(latest.capturedAt)}.</>
                : <><span className="font-semibold text-fg">No material changes</span> since {day(latest.diff.fromCapturedAt)}. Last checked {day(latest.capturedAt)}.</>}
            </p>
            {hasIndicativeRows(latest.diff) && (
              <ul className="flex flex-col gap-2">
                <DiffRows diff={latest.diff} />
              </ul>
            )}
          </div>
        )}

        {latest.diff && latest.diff.hasChanges && (
          <div className="flex flex-col gap-2.5">
            <p className="text-sm text-muted">Changes since {day(latest.diff.fromCapturedAt)}:</p>
            <ul className="flex flex-col gap-2">
              <DiffRows diff={latest.diff} stagger />
            </ul>
          </div>
        )}
      </div>

      {older.length > 0 && (
        <details className="group mt-4 border-l-2 border-border pl-5 sm:pl-6">
          <summary className="stamp cursor-pointer list-none text-muted transition-colors hover:text-fg">
            History
            <span className="ml-2 font-normal normal-case tracking-normal text-ghost group-open:hidden">show {older.length} earlier check{older.length === 1 ? "" : "s"}</span>
          </summary>
          <ol className="mt-3 flex flex-col gap-4">
            {older.map((e) => (
              <li key={e.capturedAt} className="flex flex-col gap-1.5">
                <span className="stamp tnum text-muted">{e.capturedAt.slice(0, 10)} · {e.playerCount} players</span>
                {e.diff && (e.diff.hasChanges || hasIndicativeRows(e.diff))
                  ? <ul className="flex flex-col gap-1.5"><DiffRows diff={e.diff} /></ul>
                  : <span className="text-sm text-ghost">{e.diff ? "No material changes" : "Baseline captured"}</span>}
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}
