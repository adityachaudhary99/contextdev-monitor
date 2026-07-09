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
        entered: [{ name: "Webdog", domain: "webdog.ai" }], exited: [], pricingChanges: [], capabilityChanges: [], lostFromMap: [], hasChanges: true } };
    render(<LandscapeMonitor category="web scraping APIs" entries={[baseline, second]} />);
    expect(screen.getByText("Webdog")).toBeInTheDocument();
    expect(screen.getByText(/2 checks/i)).toBeInTheDocument();
    expect(screen.getByText(/history/i)).toBeInTheDocument();
  });

  it("renders market exits as left the map and extraction losses as muted rows", () => {
    const second: MotionEntry = { capturedAt: "2026-07-10T00:00:00.000Z", playerCount: 7,
      diff: { fromCapturedAt: baseline.capturedAt, toCapturedAt: "2026-07-10T00:00:00.000Z",
        entered: [], exited: [{ name: "GoneCo", domain: "gone.co" }], pricingChanges: [], capabilityChanges: [],
        lostFromMap: [{ name: "VarianceAPI", domain: "variance.dev", reason: "off_category" }], hasChanges: true } };
    render(<LandscapeMonitor category="web scraping APIs" entries={[baseline, second]} />);
    expect(screen.getByText(/GoneCo/)).toBeInTheDocument();
    expect(screen.getByText(/left the map/i)).toBeInTheDocument();
    expect(screen.queryByText(/dropped out/i)).not.toBeInTheDocument();
    expect(screen.getByText("VarianceAPI").closest("li")).toHaveTextContent(/VarianceAPI lost from map \(off_category\).*extraction, not a confirmed exit/);
  });

  it("keeps no-material-changes copy and still shows extraction losses", () => {
    const second: MotionEntry = { capturedAt: "2026-07-10T00:00:00.000Z", playerCount: 8,
      diff: { fromCapturedAt: baseline.capturedAt, toCapturedAt: "2026-07-10T00:00:00.000Z",
        entered: [], exited: [], pricingChanges: [], capabilityChanges: [],
        lostFromMap: [{ name: "GateVariance", domain: "gate.dev", reason: "off_category" }], hasChanges: false } };
    render(<LandscapeMonitor category="web scraping APIs" entries={[baseline, second]} />);
    expect(screen.getByText(/No material changes/i)).toBeInTheDocument();
    expect(screen.getByText("GateVariance").closest("li")).toHaveTextContent(/GateVariance lost from map \(off_category\).*extraction, not a confirmed exit/);
  });
});
