import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlayerLogo from "./PlayerLogo.js";

describe("PlayerLogo", () => {
  it("renders an img with the company logo and alt text", () => {
    render(<PlayerLogo name="Firecrawl" domain="firecrawl.dev" />);
    const img = screen.getByAltText("Firecrawl logo") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("firecrawl.dev");
  });
  it("falls back to a monogram after all image sources fail", () => {
    render(<PlayerLogo name="Apify" domain="apify.com" />);
    fireEvent.error(screen.getByAltText("Apify logo")); // clearbit → favicon
    fireEvent.error(screen.getByAltText("Apify logo")); // favicon → monogram
    expect(screen.queryByAltText("Apify logo")).not.toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
