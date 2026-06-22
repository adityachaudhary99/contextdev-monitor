import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PlayerProfile } from "@contextdev/core";
import MarketAnalytics from "./MarketAnalytics.js";

const mk = (over: Partial<PlayerProfile>): PlayerProfile => ({
  name: "X", domain: "x.com", oneLiner: "", tagline: null, tags: [], features: [],
  positioning: "", links: { site: null, docs: null, pricing: null }, sourceUrl: "https://x.com",
  confidence: 1, ...over,
});
const players = [
  mk({ name: "A", domain: "a.com", tags: ["api", "cloud"], openSource: false, pricing: { free: true, startingPrice: "$49/mo", model: null } }),
  mk({ name: "B", domain: "b.com", tags: ["api"], openSource: true, pricing: { free: false, startingPrice: "$29/mo", model: null } }),
];

describe("MarketAnalytics", () => {
  it("renders capability coverage, pricing, and composition", () => {
    render(<MarketAnalytics players={players} />);
    expect(screen.getByText(/Market analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/api/)).toBeInTheDocument();
    expect(screen.getByText(/2\/2/)).toBeInTheDocument();            // api coverage 2 of 2
    expect(screen.getByText(/\$29/)).toBeInTheDocument();             // min price
    expect(screen.getByText(/Free tier/i)).toBeInTheDocument();
    expect(screen.getByText(/open source/i)).toBeInTheDocument();
  });
  it("renders nothing when there are no players", () => {
    const { container } = render(<MarketAnalytics players={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
