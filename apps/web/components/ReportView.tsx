import type { Report } from "@contextdev/core";
import { Badge } from "./ui/badge.js";
import { Card, CardHeader, CardContent } from "./ui/card.js";
import ChangeList from "./ChangeList.js";
import MetricsPanel from "./MetricsPanel.js";
import PricingTable from "./PricingTable.js";

interface ReportViewProps {
  report: Report;
}

function statusBadge(report: Report) {
  switch (report.status) {
    case "baseline":
      return <Badge variant="success">✓ Baseline captured</Badge>;
    case "changed":
      return <Badge variant="change">▲ {report.changes.length} change{report.changes.length === 1 ? "" : "s"}</Badge>;
    case "no_change":
      return <Badge variant="neutral">No change</Badge>;
    case "error":
      return <Badge variant="danger">Error</Badge>;
    default:
      return null;
  }
}

export default function ReportView({ report }: ReportViewProps) {
  const { domain, status, headline, changes, citations, creditsUsed, latencyMs, failures, pricing } = report;

  // Derive changedPlans: match plan names that appear at the start of a change detail
  const changedPlans = pricing
    ? new Set(
        pricing.plans
          .map((p) => p.name)
          .filter((name) => changes.some((c) => c.detail.startsWith(name)))
      )
    : undefined;

  return (
    <article className="flex flex-col gap-6">
      {/* Header row: status badge + domain */}
      <div className="flex items-center gap-3 flex-wrap">
        {statusBadge(report)}
        <span className="font-mono text-sm text-muted">{domain}</span>
      </div>

      {/* Headline */}
      <h2 className="text-lg font-semibold text-fg">{headline}</h2>

      {/* Changes block — only when status === "changed" */}
      {status === "changed" && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Changes since last check
            </h2>
          </CardHeader>
          <CardContent>
            <ChangeList changes={changes} citations={citations} />
          </CardContent>
        </Card>
      )}

      {/* Pricing table — whenever pricing is present */}
      {pricing && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Current pricing
            </h2>
          </CardHeader>
          <CardContent>
            <PricingTable pricing={pricing} changedPlans={changedPlans} />
          </CardContent>
        </Card>
      )}

      {/* Metrics panel — always */}
      <MetricsPanel
        creditsUsed={creditsUsed}
        latencyMs={latencyMs}
        changes={changes}
        failures={failures}
        pricing={pricing}
      />

      {/* Error state — show failure reasons */}
      {status === "error" && failures.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-danger">
              Failure details
            </h2>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {failures.map((f, idx) => (
                <li key={idx} className="flex flex-col gap-0.5 text-sm">
                  <span className="font-mono text-fg">{f.url}</span>
                  <span className="text-muted">{f.reason}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">
              Please try again in a moment.
            </p>
          </CardContent>
        </Card>
      )}
    </article>
  );
}
