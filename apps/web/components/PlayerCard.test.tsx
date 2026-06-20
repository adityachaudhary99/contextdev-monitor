import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerCard from "./PlayerCard.js";

const player = {
  name: "Firecrawl", domain: "firecrawl.dev", oneLiner: "Web scraping API", tagline: null,
  tags: ["api", "crawl"], features: ["markdown output", "js rendering"], positioning: "dev",
  links: { site: "https://firecrawl.dev", docs: "https://docs.firecrawl.dev", pricing: null },
  sourceUrl: "https://firecrawl.dev", confidence: 0.67,
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
  });
});
