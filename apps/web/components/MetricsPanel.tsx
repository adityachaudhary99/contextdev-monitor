import { Zap, Clock, Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { Report } from "@contextdev/core";

interface MetricsPanelProps {
  creditsUsed: number;
  latencyMs: number;
  changes: Report["changes"];
  failures: Report["failures"];
}

function avgConfidence(changes: Report["changes"]): number | null {
  if (changes.length === 0) return null;
  return changes.reduce((sum, c) => sum + c.confidence, 0) / changes.length;
}

export default function MetricsPanel({ creditsUsed, latencyMs, changes, failures }: MetricsPanelProps) {
  const confidence = avgConfidence(changes);
  const hasFailures = failures.length > 0;

  // Determine confidence status
  let confidenceColor = "text-[#16A34A]";  // success
  let ConfidenceIcon = CheckCircle;
  let confidenceLabel = "High";
  if (confidence !== null) {
    if (confidence < 0.5) {
      confidenceColor = "text-[#DC2626]";
      ConfidenceIcon = XCircle;
      confidenceLabel = "Low";
    } else if (confidence < 0.8) {
      confidenceColor = "text-[#D97706]";
      ConfidenceIcon = AlertTriangle;
      confidenceLabel = "Medium";
    }
  }

  return (
    <section
      aria-label="Metrics"
      className="rounded-lg border border-[#1F2A37] bg-[#121821] p-6 flex flex-col gap-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B97A6]">
        Metrics
      </h2>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Credits used */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#8B97A6]">
            <Zap size={12} aria-hidden="true" />
            Credits used
          </span>
          <span className="font-mono tabular-nums text-lg font-semibold text-[#E6EDF3]">
            {creditsUsed}
          </span>
        </div>

        {/* Latency */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#8B97A6]">
            <Clock size={12} aria-hidden="true" />
            Latency
          </span>
          <span className="font-mono tabular-nums text-lg font-semibold text-[#E6EDF3]">
            {latencyMs}
            <span className="text-sm font-normal text-[#8B97A6] ml-0.5">ms</span>
          </span>
        </div>

        {/* Confidence */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#8B97A6]">
            <Activity size={12} aria-hidden="true" />
            Avg confidence
          </span>
          {confidence !== null ? (
            <span className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-lg font-semibold ${confidenceColor}`}>
              <ConfidenceIcon size={16} aria-hidden="true" />
              <span>{confidence.toFixed(2)}</span>
              <span className="text-sm font-normal ml-0.5">{confidenceLabel}</span>
            </span>
          ) : (
            <span className="font-mono tabular-nums text-lg font-semibold text-[#8B97A6]">—</span>
          )}
        </div>

        {/* Failures */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#8B97A6]">
            {hasFailures ? (
              <AlertTriangle size={12} aria-hidden="true" className="text-[#D97706]" />
            ) : (
              <CheckCircle size={12} aria-hidden="true" className="text-[#16A34A]" />
            )}
            Failures
          </span>
          <span
            className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-lg font-semibold ${hasFailures ? "text-[#D97706]" : "text-[#16A34A]"}`}
          >
            {failures.length}
            <span className="text-sm font-normal ml-0.5">
              {hasFailures ? "Warn" : "OK"}
            </span>
          </span>
        </div>
      </div>

      {/* Failures detail section */}
      {hasFailures && (
        <div
          className="rounded-md border border-[#D97706]/30 bg-[#D97706]/5 p-4"
          role="alert"
          aria-label="Failure details"
        >
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#D97706]">
            <AlertTriangle size={14} aria-hidden="true" />
            Source failures
          </p>
          <ul className="flex flex-col gap-1.5">
            {failures.map((f, idx) => (
              <li key={idx} className="flex flex-col gap-0.5 text-sm">
                <span className="font-mono text-[#E6EDF3]">{f.url}</span>
                <span className="text-[#8B97A6]">{f.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
