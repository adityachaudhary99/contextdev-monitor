import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import Page from "./page.js";

// Fixture report with one change
const fixtureReport = {
  domain: "stripe.com",
  trackerId: "pricing",
  status: "changed" as const,
  headline: "1 change detected for stripe.com",
  changes: [{ detail: "$99 → $129/mo", confidence: 0.95, citation: 1 }],
  citations: [{ n: 1, title: "Stripe Pricing", url: "https://stripe.com/pricing" }],
  creditsUsed: 8,
  latencyMs: 1200,
  failures: [],
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Page integration", () => {
  it("renders the product wordmark", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ report: fixtureReport }),
    } as Response);

    render(<Page />);
    expect(screen.getByText(/Intelligence Monitor/i)).toBeTruthy();
  });

  it("shows report headline and change detail after successful submit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ report: fixtureReport }),
    } as Response);

    render(<Page />);

    // Switch to pricing mode (default is map mode)
    const pricingModeButton = screen.getByRole("button", { name: /track pricing/i });
    fireEvent.click(pricingModeButton);

    const domainInput = screen.getByPlaceholderText(/e\.g\. stripe\.com/i);
    fireEvent.change(domainInput, { target: { value: "stripe.com" } });

    const runButton = screen.getByRole("button", { name: /run/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText("1 change detected for stripe.com")).toBeInTheDocument();
    });

    expect(screen.getByText("$99 → $129/mo")).toBeInTheDocument();
  });

  it("shows cap error message and BYO key / context.dev CTA on 429 demo_cap_reached", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "demo_cap_reached" }),
    } as unknown as Response);

    render(<Page />);

    // Switch to pricing mode (default is map mode)
    const pricingModeButton = screen.getByRole("button", { name: /track pricing/i });
    fireEvent.click(pricingModeButton);

    const domainInput = screen.getByPlaceholderText(/e\.g\. stripe\.com/i);
    fireEvent.change(domainInput, { target: { value: "acme.com" } });

    const runButton = screen.getByRole("button", { name: /run/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    // Friendly message for demo_cap_reached
    expect(screen.getByText(/demo daily limit reached/i)).toBeInTheDocument();

    // BYO key CTA appears
    expect(screen.getByTestId("cap-byo-cta")).toBeInTheDocument();

    // context.dev link appears
    const ctaLinks = screen.getAllByRole("link", { name: /context\.dev/i });
    const ctxLink = ctaLinks.find((l) =>
      (l as HTMLAnchorElement).href.includes("utm_campaign=oss"),
    );
    expect(ctxLink).toBeTruthy();
  });
});
