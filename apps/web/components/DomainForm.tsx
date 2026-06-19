'use client';

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import ModeToggle, { type Mode } from "./ModeToggle.js";

interface DomainFormProps {
  /** Called when the user submits. Injectable for testing — defaults to the useTrack hook in normal use. */
  onRun: (domain: string, byoKey?: string) => void;
  /** When true, the button shows a loading spinner and is disabled. */
  loading?: boolean;
}

export default function DomainForm({ onRun, loading = false }: DomainFormProps) {
  const [domain, setDomain] = useState("");
  const [mode, setMode] = useState<Mode>("demo");
  const [byoKey, setByoKey] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim() || loading) return;
    onRun(domain.trim(), mode === "byo" && byoKey.trim() ? byoKey.trim() : undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">Mode:</span>
        <ModeToggle value={mode} onChange={setMode} />
      </div>

      {/* Domain input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g. stripe.com"
          autoComplete="off"
          spellCheck={false}
          disabled={loading}
          aria-label="Competitor domain"
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
          disabled={loading || !domain.trim()}
          aria-label={loading ? "Loading" : "Run"}
          className={[
            "flex min-h-[44px] min-w-[88px] items-center justify-center gap-2",
            "rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white",
            "hover:bg-primary-strong transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            !loading && domain.trim() ? "cursor-pointer" : "",
          ].join(" ")}
        >
          {loading ? (
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
      {mode === "byo" && (
        <div className="flex flex-col gap-2">
          <input
            type="password"
            value={byoKey}
            onChange={(e) => setByoKey(e.target.value)}
            placeholder="Paste your context.dev API key"
            disabled={loading}
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
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-warn">⚠</span>
            Your key is sent to our server to proxy the call and is not stored.
            Keys live in memory only and are never logged or returned in responses.
            {" "}
            <a
              href={`https://context.dev?utm_source=contextdev-monitor&utm_medium=app&utm_campaign=oss`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary-strong transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Get a key
            </a>
          </p>
        </div>
      )}
    </form>
  );
}
