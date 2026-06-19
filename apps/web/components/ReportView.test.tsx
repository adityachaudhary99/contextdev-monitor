import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReportView from "./ReportView.js";
const pricing = { plans: [{ name: "Pro", amountMinor: 9900, currency: "USD", period: "mo" as const, features: ["api"], limits: {} }] };
const baseline = { domain:"x.com", trackerId:"pricing", status:"baseline" as const, headline:"Baseline captured for x.com — 1 plan tracked", pricing, changes:[], citations:[{n:1,title:"x.com pricing",url:"https://x.com/pricing"}], creditsUsed:11, latencyMs:1200, failures:[] };
const changed = { ...baseline, status:"changed" as const, headline:"1 change detected for x.com",
  changes:[{ detail:"Pro: 2000 → 9900 USD/mo", confidence:1, citation:1 }] };

describe("ReportView", () => {
  it("baseline: shows the pricing table, no changes block", () => {
    render(<ReportView report={baseline} />);
    expect(screen.getAllByText(/baseline captured/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText(/\$99/)).toBeInTheDocument();
    expect(screen.queryByText(/changes since last check/i)).not.toBeInTheDocument();
  });
  it("changed: shows the changes block + flags the plan + cites the source", () => {
    render(<ReportView report={changed} />);
    expect(screen.getByText(/changes since last check/i)).toBeInTheDocument();
    expect(screen.getByText(/2000 → 9900/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /\[1\]/ })).toHaveAttribute("href", "https://x.com/pricing");
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });
});
