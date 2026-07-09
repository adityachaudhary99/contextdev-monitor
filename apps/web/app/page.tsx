'use client';

import { useState } from "react";
import { AlertCircle, Loader2, RefreshCw, ExternalLink, Map, DollarSign, Play, TriangleAlert } from "lucide-react";
import { useTrack } from "../lib/useTrack.js";
import { useLandscape } from "../lib/useLandscape.js";
import { CONTEXT_DEV_UTM } from "../lib/constants.js";
import DomainForm from "../components/DomainForm.js";
import ReportView from "../components/ReportView.js";
import LandscapeView from "../components/LandscapeView.js";
import ModeToggle from "../components/ModeToggle.js";
import ShareButton from "../components/ShareButton.js";
import type { Mode as ApiMode } from "../components/ModeToggle.js";

type PrimaryMode = "map" | "pricing";

function CapCTA() {
  return (
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
        href={CONTEXT_DEV_UTM}
        target="_blank"
        rel="noreferrer"
        className={[
          "inline-flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2",
          "font-sans text-sm font-semibold text-fg",
          "hover:bg-primary-strong transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        ].join(" ")}
      >
        <ExternalLink size={14} aria-hidden="true" />
        Get a context.dev key
      </a>
    </div>
  );
}

interface ErrorPanelProps {
  error: string;
  isCapError: boolean;
  onReset: () => void;
}

function ErrorPanel({ error, isCapError, onReset }: ErrorPanelProps) {
  return (
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onReset}
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

      {isCapError && <CapCTA />}
    </div>
  );
}

function MapModePanel() {
  const { status, landscape, slug, error, errorCode, run, reset } = useLandscape();
  const [category, setCategory] = useState("");
  const [apiMode, setApiMode] = useState<ApiMode>("demo");
  const [byoKey, setByoKey] = useState("");

  const isCapError = errorCode === "demo_cap_reached";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category.trim() || status === "loading") return;
    run(category.trim(), apiMode === "byo" && byoKey.trim() ? byoKey.trim() : undefined);
  }

  return (
    <>
      <section className="rounded-lg border border-border bg-surface p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* API mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">Mode:</span>
            <ModeToggle value={apiMode} onChange={setApiMode} />
          </div>

          {/* Category input row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. web scraping APIs"
              autoComplete="off"
              spellCheck={false}
              disabled={status === "loading"}
              aria-label="Market category"
              className={[
                "flex-1 min-h-[44px] rounded-md border border-border bg-surface px-4 py-2",
                "font-mono text-fg placeholder:text-muted text-base",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-200",
              ].join(" ")}
            />

            <button
              type="submit"
              disabled={status === "loading" || !category.trim()}
              aria-label={status === "loading" ? "Loading" : "Run"}
              className={[
                "flex min-h-[44px] min-w-[88px] items-center justify-center gap-2",
                "rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-fg",
                "hover:bg-primary-strong transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                status !== "loading" && category.trim() ? "cursor-pointer" : "",
              ].join(" ")}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Loading
                </>
              ) : (
                <>
                  <Play size={16} aria-hidden="true" />
                  Run
                </>
              )}
            </button>
          </div>

          {/* BYO key field */}
          {apiMode === "byo" && (
            <div className="flex flex-col gap-2">
              <input
                type="password"
                value={byoKey}
                onChange={(e) => setByoKey(e.target.value)}
                placeholder="Paste your context.dev API key"
                disabled={status === "loading"}
                aria-label="context.dev API key"
                autoComplete="off"
                className={[
                  "w-full min-h-[44px] rounded-md border border-border bg-surface px-4 py-2",
                  "font-mono text-fg placeholder:text-muted text-base",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors duration-200",
                ].join(" ")}
              />
              <p className="flex items-start gap-1.5 text-sm text-muted">
                <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-warn" />
                Your key is sent to our server to proxy the call and is not stored.
              </p>
            </div>
          )}
        </form>
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
            Mapping market…
          </span>
        </div>
      )}

      {/* Error state */}
      {status === "error" && error && (
        <ErrorPanel error={error} isCapError={isCapError} onReset={reset} />
      )}

      {/* Done state */}
      {status === "done" && landscape && (
        <div className="mt-8">
          {slug && (
            <div className="mb-4 flex justify-end">
              <ShareButton slug={slug} />
            </div>
          )}
          <LandscapeView landscape={landscape} />
        </div>
      )}

      {/* Idle hint */}
      {status === "idle" && (
        <p className="mt-6 font-sans text-sm text-muted">
          Enter a market category above and press Run to map the competitive landscape.
        </p>
      )}
    </>
  );
}

function PricingModePanel() {
  const { status, report, error, errorCode, stage, track, reset } = useTrack();
  const isCapError = errorCode === "demo_cap_reached";

  return (
    <>
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
        <ErrorPanel error={error} isCapError={isCapError} onReset={reset} />
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
    </>
  );
}

export default function Page() {
  const [primaryMode, setPrimaryMode] = useState<PrimaryMode>("map");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Map a market — and watch it move. Build a cited competitive landscape now, then compare future checks for new entrants, exits, pricing, and capability moves.
      </p>
      {/* Primary mode switch */}
      <div
        role="group"
        aria-label="App mode"
        className="mb-6 inline-flex rounded-md border border-border bg-surface p-0.5"
      >
        <button
          type="button"
          aria-pressed={primaryMode === "map"}
          onClick={() => setPrimaryMode("map")}
          className={[
            "flex min-h-[44px] items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            primaryMode === "map" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg cursor-pointer",
          ].join(" ")}
        >
          <Map size={15} aria-hidden="true" />
          Map a market
        </button>
        <button
          type="button"
          aria-pressed={primaryMode === "pricing"}
          onClick={() => setPrimaryMode("pricing")}
          className={[
            "flex min-h-[44px] items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            primaryMode === "pricing" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg cursor-pointer",
          ].join(" ")}
        >
          <DollarSign size={15} aria-hidden="true" />
          Track pricing
        </button>
      </div>

      {/* Mode panels */}
      {primaryMode === "map" ? <MapModePanel /> : <PricingModePanel />}
    </main>
  );
}
