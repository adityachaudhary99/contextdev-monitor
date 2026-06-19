'use client';

import { useState, useRef, useCallback } from "react";
import type { Report } from "@contextdev/core";

// Staged progress labels shown while the real fetch runs
const STAGES = [
  "Locating pricing page…",
  "Scraping…",
  "Extracting…",
  "Diffing…",
] as const;

const STAGE_INTERVAL_MS = 2_500;

// Map server error codes to friendly strings
function friendlyError(code: string): string {
  switch (code) {
    case "demo_cap_reached":
      return "Demo daily limit reached. Bring your own key to continue.";
    case "missing_key":
      return "No API key configured. Add a key or contact the site operator.";
    case "bad_domain":
      return "Invalid domain. Please enter a valid hostname (e.g. stripe.com).";
    default:
      return code || "An unexpected error occurred.";
  }
}

export type TrackStatus = "idle" | "loading" | "done" | "error";

export interface TrackState {
  status: TrackStatus;
  report?: Report;
  error?: string;
  errorCode?: string;
  stage?: string;
}

export interface UseTrackReturn extends TrackState {
  track: (domain: string, byoKey?: string) => Promise<void>;
  reset: () => void;
}

export function useTrack(): UseTrackReturn {
  const [state, setState] = useState<TrackState>({ status: "idle" });
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageIndexRef = useRef(0);

  const stopStageTimer = useCallback(() => {
    if (stageTimerRef.current !== null) {
      clearInterval(stageTimerRef.current);
      stageTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopStageTimer();
    setState({ status: "idle" });
  }, [stopStageTimer]);

  const track = useCallback(
    async (domain: string, byoKey?: string) => {
      // Reset
      stageIndexRef.current = 0;
      stopStageTimer();

      setState({ status: "loading", stage: STAGES[0] });

      // Cosmetic stage cycling
      stageTimerRef.current = setInterval(() => {
        stageIndexRef.current = Math.min(
          stageIndexRef.current + 1,
          STAGES.length - 1,
        );
        setState((prev) => ({
          ...prev,
          stage: STAGES[stageIndexRef.current],
        }));
      }, STAGE_INTERVAL_MS);

      try {
        const res = await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, byoKey: byoKey || undefined }),
        });

        stopStageTimer();

        if (res.ok) {
          const data = (await res.json()) as { report: Report };
          setState({ status: "done", report: data.report });
        } else {
          const data = (await res.json()) as { error?: string };
          const code = data.error ?? "";
          setState({
            status: "error",
            error: friendlyError(code),
            errorCode: code || undefined,
          });
        }
      } catch (err) {
        stopStageTimer();
        setState({
          status: "error",
          error: err instanceof Error ? err.message : "Network error.",
          errorCode: "network_error",
        });
      }
    },
    [stopStageTimer],
  );

  return { ...state, track, reset };
}
