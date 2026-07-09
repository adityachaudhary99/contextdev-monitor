import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MotionEntry } from "@contextdev/core";
import LandscapeMonitor from "./LandscapeMonitor.js";

const baseline: MotionEntry = { capturedAt: "2026-06-22T00:00:00.000Z", playerCount: 8, diff: null };

describe("LandscapeMonitor", () => {
  it("renders baseline copy with one check", () => {
    render(<LandscapeMonitor category="web scraping APIs" entries={[baseline]} />);
    expect(screen.getByText(/baseline captured 2026-06-22/i)).toBeInTheDocument();
  });

  it("renders the latest diff and tucks older checks into history", () => {
    const second: MotionEntry = { capturedAt: "2026-07-10T00:00:00.000Z", playerCount: 9,
      diff: { fromCapturedAt: baseline.capturedAt, toCapturedAt: "2026-07-10T00:00:00.000Z",
        entered: [{ name: "Webdog", domain: "webdog.ai" }], exited: [], pricingChanges: [], capabilityChanges: [], hasChanges: true } };
    render(<LandscapeMonitor category="web scraping APIs" entries={[baseline, second]} />);
    expect(screen.getByText("Webdog")).toBeInTheDocument();
    expect(screen.getByText(/2 checks/i)).toBeInTheDocument();
    expect(screen.getByText(/history/i)).toBeInTheDocument();
  });
});
