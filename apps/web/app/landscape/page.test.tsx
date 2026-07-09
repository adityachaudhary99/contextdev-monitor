import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandscapeIndex from "./page.js";
describe("landscape index", () => {
  it("lists curated landscapes with links", () => {
    render(<LandscapeIndex />);
    expect(screen.getByRole("heading", { name: /Published dossiers/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /web scraping APIs/i })).toHaveAttribute("href", "/landscape/web-scraping-apis");
  });
});
