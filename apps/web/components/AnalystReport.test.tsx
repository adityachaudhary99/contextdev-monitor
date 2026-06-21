import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnalystReport as Report } from "@contextdev/core";
import AnalystReport from "./AnalystReport.js";

const report: Report = {
  overview: "A maturing market with two strong players and room for an on-prem entrant.",
  segments: [{ name: "Enterprise platforms", members: ["Acme", "Globex"], note: "for large orgs" }],
  leaders: [{ name: "Acme", why: "the most complete offering" }],
  tableStakes: ["api access", "cloud hosting"],
  differentiators: [{ player: "Globex", edge: "the cheapest entry price" }],
  gaps: ["no self-hosted option"],
  picks: [{ useCase: "enterprise scale", player: "Acme", why: "breadth of features" }],
};

describe("AnalystReport", () => {
  it("renders the overview and every section", () => {
    render(<AnalystReport report={report} />);
    expect(screen.getByText(/maturing market/)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise platforms/)).toBeInTheDocument();
    expect(screen.getByText(/the most complete offering/)).toBeInTheDocument();
    expect(screen.getByText(/api access/)).toBeInTheDocument();
    expect(screen.getByText(/the cheapest entry price/)).toBeInTheDocument();
    expect(screen.getByText(/no self-hosted option/)).toBeInTheDocument();
    expect(screen.getByText(/enterprise scale/)).toBeInTheDocument();
  });
  it("omits sections that have no data", () => {
    render(<AnalystReport report={{ ...report, gaps: [], picks: [] }} />);
    expect(screen.queryByText(/Whitespace/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pick by use case/i)).not.toBeInTheDocument();
  });
});
