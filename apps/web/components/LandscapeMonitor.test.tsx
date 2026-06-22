import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { LandscapeDiff } from "@contextdev/core";
import LandscapeMonitor from "./LandscapeMonitor.js";

const base = { category: "web scraping apis", capturedAt: "2026-06-22T00:00:00.000Z", playerCount: 6, checks: 1 };

describe("LandscapeMonitor", () => {
  it("shows the baseline state when there is no diff", () => {
    render(<LandscapeMonitor {...base} diff={null} />);
    expect(screen.getByText(/Market monitor/i)).toBeInTheDocument();
    expect(screen.getByText(/Baseline captured/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-06-22/)).toBeInTheDocument();
    expect(screen.getByText(/6 players tracked/i)).toBeInTheDocument();
  });
  it("renders 'no material changes' when a diff has none", () => {
    const diff: LandscapeDiff = { fromCapturedAt: "2026-06-01T00:00:00.000Z", toCapturedAt: base.capturedAt,
      entered: [], exited: [], pricingChanges: [], capabilityChanges: [], hasChanges: false };
    render(<LandscapeMonitor {...base} checks={2} diff={diff} />);
    expect(screen.getByText(/No material changes/i)).toBeInTheDocument();
  });
  it("renders entrants, exits, and pricing/capability changes", () => {
    const diff: LandscapeDiff = {
      fromCapturedAt: "2026-06-01T00:00:00.000Z", toCapturedAt: base.capturedAt,
      entered: [{ name: "Initech", domain: "initech.com" }],
      exited: [{ name: "Globex", domain: "globex.com" }],
      pricingChanges: [{ domain: "acme.com", name: "Acme", field: "price", from: "$49/mo", to: "$59/mo" }],
      capabilityChanges: [{ domain: "acme.com", name: "Acme", added: ["proxies"], removed: ["cloud"] }],
      hasChanges: true,
    };
    render(<LandscapeMonitor {...base} checks={2} diff={diff} />);
    expect(screen.getByText(/Initech/)).toBeInTheDocument();
    expect(screen.getByText(/Globex/)).toBeInTheDocument();
    expect(screen.getByText(/\$49\/mo/)).toBeInTheDocument();
    expect(screen.getByText(/\$59\/mo/)).toBeInTheDocument();
    expect(screen.getByText(/proxies/)).toBeInTheDocument();
  });
});
