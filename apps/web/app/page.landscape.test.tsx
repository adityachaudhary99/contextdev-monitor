import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import Page from "./page.js";

// Minimal fixture with 1 player and a brief
const fixtureLandscape = {
  category: "web scraping APIs",
  players: [
    {
      name: "Firecrawl",
      domain: "firecrawl.dev",
      oneLiner: "Turn websites into LLM-ready data",
      tagline: "The web scraping API for AI",
      tags: ["scraping", "AI"],
      features: ["markdown output", "JS rendering"],
      positioning: "Developer-friendly scraping for AI workloads",
      links: { site: "https://firecrawl.dev", docs: "https://docs.firecrawl.dev", pricing: "https://firecrawl.dev/pricing" },
      sourceUrl: "https://firecrawl.dev",
      confidence: 0.92,
    },
  ],
  failures: [],
  comparison: { dimensions: ["Pricing", "JS rendering", "API quality"] },
  brief: "The web scraping APIs space is competitive with several players targeting AI workflows.",
  citations: [{ n: 1, title: "Firecrawl", url: "https://firecrawl.dev" }],
  creditsUsed: 12,
  latencyMs: 3200,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Page — Map a market mode", () => {
  it("renders in map mode by default and shows category input", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ landscape: fixtureLandscape }),
    } as Response);

    render(<Page />);

    // Default mode should be "Map a market"
    const mapButton = screen.getByRole("button", { name: /map a market/i });
    expect(mapButton).toBeInTheDocument();
    // aria-pressed should be true for map mode (active)
    expect(mapButton.getAttribute("aria-pressed")).toBe("true");

    // Category input should be visible
    expect(screen.getByPlaceholderText(/e\.g\. web scraping/i)).toBeInTheDocument();
  });

  it("shows landscape player name and brief after successful submit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ landscape: fixtureLandscape }),
    } as Response);

    render(<Page />);

    const categoryInput = screen.getByPlaceholderText(/e\.g\. web scraping/i);
    fireEvent.change(categoryInput, { target: { value: "web scraping APIs" } });

    const runButton = screen.getByRole("button", { name: /run/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      // Player name appears at least once in the landscape view
      expect(screen.getAllByText(/Firecrawl/i).length).toBeGreaterThan(0);
    });

    // Brief paragraph appears — assert on the container <p>'s full textContent
    const briefPara = screen.getByText((_content, element) => {
      if (!element) return false;
      const tag = element.tagName.toLowerCase();
      const text = element.textContent ?? "";
      return tag === "p" && /web scraping APIs space is competitive/i.test(text);
    });
    expect(briefPara).toBeInTheDocument();
  });

  it("shows cap message and BYO/context.dev CTA on 429 demo_cap_reached", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "demo_cap_reached" }),
    } as unknown as Response);

    render(<Page />);

    const categoryInput = screen.getByPlaceholderText(/e\.g\. web scraping/i);
    fireEvent.change(categoryInput, { target: { value: "web scraping APIs" } });

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

  it("switches to pricing mode when Track pricing button is clicked", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ landscape: fixtureLandscape }),
    } as Response);

    render(<Page />);

    const pricingButton = screen.getByRole("button", { name: /track pricing/i });
    fireEvent.click(pricingButton);

    // After switching, the domain input should appear
    expect(screen.getByPlaceholderText(/e\.g\. stripe\.com/i)).toBeInTheDocument();

    // aria-pressed for pricing button should now be true
    expect(pricingButton.getAttribute("aria-pressed")).toBe("true");
  });
});
