import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandscapeView from "./LandscapeView.js";
const landscape = {
  category: "scraping apis",
  players: [
    { name: "Firecrawl", domain: "firecrawl.dev", oneLiner: "Web scraping API", tagline: null, tags: ["api", "crawl"], features: ["markdown", "crawl"], positioning: "dev", links: { site: null, docs: null, pricing: null }, sourceUrl: "https://firecrawl.dev", confidence: 1 },
  ],
  failures: [{ url: "https://x.com", domain: "x.com", reason: "http_403" }],
  comparison: { dimensions: ["api", "crawl"] }, brief: "Mapped 1 player in \"scraping apis\".",
  citations: [{ n: 1, title: "Firecrawl — firecrawl.dev", url: "https://firecrawl.dev" }],
  creditsUsed: 100, latencyMs: 5000,
};
describe("LandscapeView", () => {
  it("renders the heading, brief, KPI metrics, a player card, and the matrix dimensions", () => {
    render(<LandscapeView landscape={landscape} />);
    expect(screen.getByRole("heading", { level: 1, name: /scraping apis/i })).toBeInTheDocument();
    expect(screen.getByText(/Mapped 1 player/i)).toBeInTheDocument();
    expect(screen.getAllByText("Firecrawl").length).toBeGreaterThan(0);
    expect(screen.getByText("Web scraping API")).toBeInTheDocument();
    expect(screen.getAllByText(/api/i).length).toBeGreaterThan(0); // matrix dimension header
    expect(screen.getByRole("link", { name: /firecrawl\.dev/i })).toHaveAttribute("href", "https://firecrawl.dev");
  });
});
