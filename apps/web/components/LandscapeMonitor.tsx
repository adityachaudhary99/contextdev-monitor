import type { LandscapeDiff, MotionEntry } from "@contextdev/core";
import { Activity, ArrowUpRight, ArrowDownRight, DollarSign, Tags, CircleDashed } from "lucide-react";

const day = (iso: string) => iso.slice(0, 10);

function ChangeRow({ icon, tone, children }: { icon: React.ReactNode; tone: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className={`mt-0.5 shrink-0 ${tone}`} aria-hidden="true">{icon}</span>
      <span className="text-muted">{children}</span>
    </li>
  );
}

function DiffRows({ diff }: { diff: LandscapeDiff }) {
  const lostFromMap = diff.lostFromMap ?? [];

  return (
    <>
      {diff.entered.map((p) => (
        <ChangeRow key={`in-${p.domain}`} icon={<ArrowUpRight size={14} />} tone="text-success">
          <span className="font-medium text-fg">{p.name}</span> entered the market
        </ChangeRow>
      ))}
      {diff.exited.map((p) => (
        <ChangeRow key={`out-${p.domain}`} icon={<ArrowDownRight size={14} />} tone="text-danger">
          <span className="font-medium text-fg">{p.name}</span> left the map
        </ChangeRow>
      ))}
      {diff.pricingChanges.map((c, i) => (
        <ChangeRow key={`price-${c.domain}-${i}`} icon={<DollarSign size={14} />} tone="text-primary">
          <span className="font-medium text-fg">{c.name}</span>{" "}
          {c.field === "price" ? "price" : "free tier"}: <span className="font-mono">{c.from}</span> → <span className="font-mono text-fg">{c.to}</span>
        </ChangeRow>
      ))}
      {diff.capabilityChanges.map((c) => (
        <ChangeRow key={`cap-${c.domain}`} icon={<Tags size={14} />} tone="text-accent">
          <span className="font-medium text-fg">{c.name}</span>
          {c.added.length > 0 && <> +{c.added.join(", ")}</>}
          {c.removed.length > 0 && <> −{c.removed.join(", ")}</>}
        </ChangeRow>
      ))}
      {lostFromMap.map((p) => (
        <ChangeRow key={`lost-${p.domain}`} icon={<CircleDashed size={14} />} tone="text-muted">
          <span className="font-medium text-fg">{p.name}</span> lost from map ({p.reason}) — extraction, not a confirmed exit
        </ChangeRow>
      ))}
    </>
  );
}

export default function LandscapeMonitor({
  category, entries,
}: { category: string; entries: MotionEntry[] }) {
  const latest = entries[entries.length - 1];
  const older = entries.slice(0, -1).reverse();

  if (!latest) return null;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
          <Activity size={13} aria-hidden="true" /> Market motion
        </div>
        <span className="font-mono text-xs text-muted">
          {entries.length} check{entries.length === 1 ? "" : "s"} · {latest.playerCount} players tracked
        </span>
      </div>

      {!latest.diff && (
        <p className="text-sm text-muted">
          <span className="font-medium text-fg">Baseline captured {day(latest.capturedAt)}.</span>{" "}
          Tracking the {category} market — re-check to surface new entrants, exits, and pricing moves.
        </p>
      )}

      {latest.diff && !latest.diff.hasChanges && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">
            <span className="font-medium text-fg">No material changes</span> since {day(latest.diff.fromCapturedAt)}. Last checked {day(latest.capturedAt)}.
          </p>
          {(latest.diff.lostFromMap ?? []).length > 0 && (
            <ul className="flex flex-col gap-1.5">
              <DiffRows diff={latest.diff} />
            </ul>
          )}
        </div>
      )}

      {latest.diff && latest.diff.hasChanges && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted">Changes since {day(latest.diff.fromCapturedAt)}:</p>
          <ul className="flex flex-col gap-1.5">
            <DiffRows diff={latest.diff} />
          </ul>
        </div>
      )}

      {older.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">History</summary>
          <ul className="mt-3 flex flex-col gap-3 border-l border-border pl-4">
            {older.map((e) => (
              <li key={e.capturedAt} className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-muted">{e.capturedAt.slice(0, 10)} · {e.playerCount} players</span>
                {e.diff && e.diff.hasChanges
                  ? <ul className="flex flex-col gap-1"><DiffRows diff={e.diff} /></ul>
                  : <span className="text-xs text-muted">{e.diff ? "No material changes" : "Baseline captured"}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
