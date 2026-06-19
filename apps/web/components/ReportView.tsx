import type { Report } from "@contextdev/core";
import ChangeList from "./ChangeList.js";
import MetricsPanel from "./MetricsPanel.js";

interface ReportViewProps {
  report: Report;
}

export default function ReportView({ report }: ReportViewProps) {
  const { headline, changes, citations, creditsUsed, latencyMs, failures } = report;

  return (
    <article className="flex flex-col gap-6 rounded-lg border border-border bg-bg p-6">
      {/* Headline */}
      <h1 className="font-sans text-2xl font-semibold leading-tight text-fg">
        {headline}
      </h1>

      {/* Changes section */}
      <section aria-label="Changes">
        {changes.length === 0 ? (
          <p className="rounded-md border border-border bg-bg px-4 py-3 font-sans text-base text-muted">
            No pricing changes detected
          </p>
        ) : (
          <ChangeList changes={changes} citations={citations} />
        )}
      </section>

      {/* Metrics panel */}
      <MetricsPanel
        creditsUsed={creditsUsed}
        latencyMs={latencyMs}
        changes={changes}
        failures={failures}
      />

      {/* Citations list */}
      {citations.length > 0 && (
        <section aria-label="Citations">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
            Sources
          </h2>
          <div className="flex flex-col gap-1.5">
            {citations.map((c) => (
              <div key={c.n} className="flex items-baseline gap-2 font-mono text-sm">
                <span className="text-muted">[{c.n}]</span>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline hover:text-primary-strong transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {c.title}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
