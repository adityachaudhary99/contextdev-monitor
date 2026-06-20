import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandscapeMap from "./LandscapeMap.js";
const landscape = {
  category: "scraping apis",
  players: [
    { name: "Firecrawl", domain: "firecrawl.dev", oneLiner: "", tagline: null, tags: ["api", "crawl"], features: [], positioning: "", links: { site: null, docs: null, pricing: null }, sourceUrl: "https://firecrawl.dev", confidence: 0.9 },
    { name: "Apify", domain: "apify.com", oneLiner: "", tagline: null, tags: ["api"], features: [], positioning: "", links: { site: null, docs: null, pricing: null }, sourceUrl: "https://apify.com", confidence: 0.5 },
  ],
  failures: [], comparison: { dimensions: ["api", "crawl"] }, brief: "", citations: [], creditsUsed: 0, latencyMs: 0,
};
describe("LandscapeMap", () => {
  it("renders a logo marker per player, axis labels, and an a11y data table", () => {
    render(<LandscapeMap landscape={landscape as never} />);
    expect(screen.getAllByAltText(/logo/i)).toHaveLength(2);
    expect(screen.getByText("capability breadth →")).toBeInTheDocument();
    expect(screen.getByText("confidence ↑")).toBeInTheDocument();
    expect(screen.getByText("Players by capability breadth and confidence")).toBeInTheDocument();
  });
});
