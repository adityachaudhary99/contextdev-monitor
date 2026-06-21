import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerCard from "./PlayerCard.js";

const player = {
  name: "Firecrawl", domain: "firecrawl.dev", oneLiner: "Web scraping API", tagline: null,
  tags: ["api", "crawl"], features: ["markdown output", "js rendering"], positioning: "dev",
  links: { site: "https://firecrawl.dev", docs: "https://docs.firecrawl.dev", pricing: null },
  sourceUrl: "https://firecrawl.dev", confidence: 0.67,
  pricing: { free: true, startingPrice: "$49/mo", model: "per seat" }, targetSegment: "Enterprise", differentiators: ["fastest"], socialProof: "Trusted by 10,000+ teams", founded: "2019", openSource: true,
};

describe("PlayerCard", () => {
  it("renders logo, name, one-liner, tags, confidence, and a domain-named source link", () => {
    render(<PlayerCard player={player as never} n={1} />);
    expect(screen.getByAltText("Firecrawl logo")).toBeInTheDocument();
    expect(screen.getByText("Firecrawl")).toBeInTheDocument();
    expect(screen.getByText("Web scraping API")).toBeInTheDocument();
    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.getByText("0.67")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /firecrawl\.dev/i })).toHaveAttribute("href", "https://firecrawl.dev");
    expect(screen.getByText(/\$49\/mo/)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise/)).toBeInTheDocument();
    expect(screen.getByText(/2019/)).toBeInTheDocument();
    expect(screen.getByText(/Trusted by 10,000\+ teams/)).toBeInTheDocument();
    expect(screen.getByText(/open source/i)).toBeInTheDocument();
  });
});
