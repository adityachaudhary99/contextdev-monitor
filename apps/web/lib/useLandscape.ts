'use client';

import { useState, useCallback } from "react";
import type { Landscape } from "@contextdev/core";

// Map server error codes to friendly strings
function friendlyError(code: string): string {
  switch (code) {
    case "demo_cap_reached":
      return "Demo daily limit reached. Bring your own key to continue.";
    case "missing_key":
      return "No API key configured. Add a key or contact the site operator.";
    case "bad_category":
      return "Invalid category. Please enter a valid market category.";
    default:
      return code || "An unexpected error occurred.";
  }
}

export type LandscapeStatus = "idle" | "loading" | "done" | "error";

export interface LandscapeState {
  status: LandscapeStatus;
  landscape?: Landscape;
  slug?: string;
  error?: string;
  errorCode?: string;
}

export interface UseLandscapeReturn extends LandscapeState {
  run: (category: string, byoKey?: string) => Promise<void>;
  reset: () => void;
}

export function useLandscape(): UseLandscapeReturn {
  const [state, setState] = useState<LandscapeState>({ status: "idle" });

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const run = useCallback(async (category: string, byoKey?: string) => {
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/landscape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, byoKey: byoKey || undefined }),
      });

      if (res.ok) {
        const data = (await res.json()) as { landscape: Landscape; slug?: string };
        setState({ status: "done", landscape: data.landscape, slug: data.slug });
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
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Network error.",
        errorCode: "network_error",
      });
    }
  }, []);

  return { ...state, run, reset };
}
