'use client';

import { AlertCircle, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { useTrack } from "../lib/useTrack.js";
import DomainForm from "../components/DomainForm.js";
import ReportView from "../components/ReportView.js";
import Footer from "../components/Footer.js";

const UTM_URL =
  "https://context.dev?utm_source=contextdev-monitor&utm_medium=app&utm_campaign=oss";

const CAP_MESSAGE = "Demo daily limit reached. Bring your own key to continue.";

export default function Page() {
  const { status, report, error, stage, track } = useTrack();

  const isCapError = error === CAP_MESSAGE;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-bg">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <h1 className="font-mono text-2xl font-semibold text-fg">
            Context.dev{" "}
            <span className="text-primary">Intelligence Monitor</span>
          </h1>
          <p className="mt-1 font-sans text-sm text-muted">
            Track a competitor&apos;s pricing — evidence-linked diffs, on demand.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {/* Form section */}
        <section className="rounded-lg border border-border bg-surface p-6">
          <DomainForm
            onRun={(domain, byoKey) => track(domain, byoKey)}
            loading={status === "loading"}
          />
        </section>

        {/* Loading state */}
        {status === "loading" && (
          <div className="mt-8 flex items-center gap-3 font-sans text-sm text-muted">
            <Loader2
              size={16}
              className="animate-spin text-primary"
              aria-hidden="true"
            />
            <span aria-live="polite" aria-atomic="true">
              {stage ?? "Processing…"}
            </span>
          </div>
        )}

        {/* Error state */}
        {status === "error" && error && (
          <div
            role="alert"
            className="mt-8 rounded-lg border border-danger bg-surface p-5 flex flex-col gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-danger"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="font-sans text-sm font-semibold text-danger">
                  Error
                </p>
                <p className="mt-1 font-sans text-sm text-fg">{error}</p>
              </div>
            </div>

            {/* Retry button */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  // Re-run by clearing state — user can resubmit the form
                  window.location.reload();
                }}
                className={[
                  "flex items-center gap-2 rounded-md border border-border bg-bg px-4 py-2",
                  "font-sans text-sm text-fg hover:bg-surface transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                ].join(" ")}
              >
                <RefreshCw size={14} aria-hidden="true" />
                Retry
              </button>
            </div>

            {/* Demo cap CTA */}
            {isCapError && (
              <div
                data-testid="cap-byo-cta"
                className="rounded-md border border-border bg-bg px-5 py-4 flex flex-col gap-3"
              >
                <p className="font-sans text-sm text-fg font-semibold">
                  Bring your own context.dev key
                </p>
                <p className="font-sans text-sm text-muted">
                  Switch to BYO mode in the form above and paste your API key to
                  bypass the demo limit. Keys are sent to our server only for
                  the request and are never stored.
                </p>
                <a
                  href={UTM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={[
                    "inline-flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2",
                    "font-sans text-sm font-semibold text-white",
                    "hover:bg-primary-strong transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  ].join(" ")}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  Get a context.dev key
                </a>
              </div>
            )}
          </div>
        )}

        {/* Done state */}
        {status === "done" && report && (
          <div className="mt-8">
            <ReportView report={report} />
          </div>
        )}

        {/* Idle hint */}
        {status === "idle" && (
          <p className="mt-6 font-sans text-sm text-muted">
            Enter a competitor domain above and press Run to fetch the latest
            pricing intelligence.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
