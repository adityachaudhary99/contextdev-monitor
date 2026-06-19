import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Report } from "@contextdev/core";
import ReportView from "./ReportView.js";

afterEach(() => cleanup());

const fixtureReport: Report = {
  domain: "acme.com",
  trackerId: "pricing",
  headline: "1 change detected for acme.com",
  changes: [
    { detail: "2000 → 2500", confidence: 1.0, citation: 1 },
  ],
  citations: [{ n: 1, title: "Pricing", url: "https://example.com/pricing" }],
  creditsUsed: 5,
  latencyMs: 800,
  failures: [],
};

const noChangeReport: Report = {
  domain: "acme.com",
  trackerId: "pricing",
  headline: "No change detected for acme.com",
  changes: [],
  citations: [{ n: 1, title: "Pricing", url: "https://example.com/pricing" }],
  creditsUsed: 5,
  latencyMs: 800,
  failures: [],
};

describe("ReportView", () => {
  it("renders headline, change detail, citation link, and credits", () => {
    render(<ReportView report={fixtureReport} />);

    // Headline renders
    expect(screen.getByText("1 change detected for acme.com")).toBeInTheDocument();

    // Change detail renders
    expect(screen.getByText("2000 → 2500")).toBeInTheDocument();

    // Citation link has correct href
    const citationLink = screen.getByRole("link", { name: /\[1\]/i });
    expect(citationLink).toHaveAttribute("href", "https://example.com/pricing");

    // Credits number renders
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows no-change message when changes is empty and no change details appear", () => {
    render(<ReportView report={noChangeReport} />);

    // No-change copy renders
    expect(screen.getByText("No pricing changes detected")).toBeInTheDocument();

    // No change detail items
    expect(screen.queryByRole("listitem")).toBeNull();
  });
});
