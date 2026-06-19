import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PricingTable from "./PricingTable.js";

const pricing = {
  plans: [
    { name: "Free", amountMinor: 0, currency: "USD", period: "mo" as const, features: ["500 credits"], limits: {} },
    { name: "Pro", amountMinor: 9900, currency: "USD", period: "mo" as const, features: ["100k credits"], limits: {} },
  ]
};

describe("PricingTable", () => {
  it("renders plans with formatted prices", () => {
    render(<PricingTable pricing={pricing} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText(/\$99/)).toBeInTheDocument(); // 9900 minor -> $99
  });

  it("flags a changed plan as updated", () => {
    render(<PricingTable pricing={pricing} changedPlans={new Set(["Pro"])} />);
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });
});
