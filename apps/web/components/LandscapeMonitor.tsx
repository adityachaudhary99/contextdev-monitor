import type { LandscapeDiff } from "@contextdev/core";
import { Activity, ArrowUpRight, ArrowDownRight, DollarSign, Tags } from "lucide-react";

const day = (iso: string) => iso.slice(0, 10);

function ChangeRow({ icon, tone, children }: { icon: React.ReactNode; tone: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className={`mt-0.5 shrink-0 ${tone}`} aria-hidden="true">{icon}</span>
      <span className="text-muted">{children}</span>
    </li>
  );
}

export default function LandscapeMonitor({
  category, capturedAt, playerCount, checks, diff,
}: { category: string; capturedAt: string; playerCount: number; checks: number; diff: LandscapeDiff | null }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
          <Activity size={13} aria-hidden="true" /> Market monitor
        </div>
        <span className="font-mono text-xs text-muted">
          {checks} check{checks === 1 ? "" : "s"} · {playerCount} players tracked
        </span>
      </div>

      {!diff && (
        <p className="text-sm text-muted">
          <span className="font-medium text-fg">Baseline captured {day(capturedAt)}.</span>{" "}
          Tracking the {category} market — re-check to surface new entrants, exits, and pricing moves.
        </p>
      )}

      {diff && !diff.hasChanges && (
        <p className="text-sm text-muted">
          <span className="font-medium text-fg">No material changes</span> since {day(diff.fromCapturedAt)}. Last checked {day(capturedAt)}.
        </p>
      )}

      {diff && diff.hasChanges && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted">Changes since {day(diff.fromCapturedAt)}:</p>
          <ul className="flex flex-col gap-1.5">
            {diff.entered.map((p) => (
              <ChangeRow key={`in-${p.domain}`} icon={<ArrowUpRight size={14} />} tone="text-success">
                <span className="font-medium text-fg">{p.name}</span> entered the market
              </ChangeRow>
            ))}
            {diff.exited.map((p) => (
              <ChangeRow key={`out-${p.domain}`} icon={<ArrowDownRight size={14} />} tone="text-danger">
                <span className="font-medium text-fg">{p.name}</span> dropped out
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
          </ul>
        </div>
      )}
    </article>
  );
}
