import { Zap, Clock, Activity, AlertTriangle, CheckCircle, LayoutGrid } from "lucide-react";
import type { Report } from "@contextdev/core";

interface MetricsPanelProps {
  creditsUsed: number;
  latencyMs: number;
  changes: Report["changes"];
  failures: Report["failures"];
  pricing?: Report["pricing"];
}

function avgConfidence(changes: Report["changes"]): number | null {
  if (changes.length === 0) return null;
  return changes.reduce((sum, c) => sum + c.confidence, 0) / changes.length;
}

export default function MetricsPanel({ creditsUsed, latencyMs, changes, failures, pricing }: MetricsPanelProps) {
  const confidence = avgConfidence(changes);
  const hasFailures = failures.length > 0;

  return (
    <section
      aria-label="Metrics"
      className="rounded-lg border border-border bg-surface p-6 flex flex-col gap-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
        Metrics
      </h2>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Credits used */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Zap size={12} aria-hidden="true" />
            Credits used
          </span>
          <span className="font-mono tabular-nums text-lg font-semibold text-fg">
            {creditsUsed}
          </span>
        </div>

        {/* Latency */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Clock size={12} aria-hidden="true" />
            Latency
          </span>
          <span className="font-mono tabular-nums text-lg font-semibold text-fg">
            {latencyMs}
            <span className="text-sm font-normal text-muted ml-0.5">ms</span>
          </span>
        </div>

        {/* Plans count — only when pricing is present */}
        {pricing && (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <LayoutGrid size={12} aria-hidden="true" />
              Plans
            </span>
            <span className="font-mono tabular-nums text-lg font-semibold text-fg">
              {pricing.plans.length}
            </span>
          </div>
        )}

        {/* Avg confidence — only when changes.length > 0 */}
        {changes.length > 0 && confidence !== null && (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Activity size={12} aria-hidden="true" />
              Avg confidence
            </span>
            <span className="font-mono tabular-nums text-lg font-semibold text-fg">
              {Math.round(confidence * 100)}
              <span className="text-sm font-normal text-muted ml-0.5">%</span>
            </span>
          </div>
        )}

        {/* Failures */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            {hasFailures ? (
              <AlertTriangle size={12} aria-hidden="true" className="text-danger" />
            ) : (
              <CheckCircle size={12} aria-hidden="true" className="text-success" />
            )}
            Failures
          </span>
          <span
            className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-lg font-semibold ${hasFailures ? "text-danger" : "text-success"}`}
          >
            {failures.length}
          </span>
        </div>
      </div>

      {/* Failures detail section */}
      {hasFailures && (
        <div
          className="rounded-md border border-danger/30 bg-danger/5 p-4"
          role="alert"
          aria-label="Failure details"
        >
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-danger">
            <AlertTriangle size={14} aria-hidden="true" />
            Source failures
          </p>
          <ul className="flex flex-col gap-1.5">
            {failures.map((f, idx) => (
              <li key={idx} className="flex flex-col gap-0.5 text-sm">
                <span className="font-mono text-fg">{f.url}</span>
                <span className="text-muted">{f.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
