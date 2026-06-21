import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("next/navigation", () => ({ usePathname: () => "/landscape" }));
import Header from "./Header.js";

describe("Header", () => {
  it("renders the wordmark and nav links, marking the active page", () => {
    render(<Header />);
    expect(screen.getByText(/Intelligence Monitor/i)).toBeInTheDocument();
    const map = screen.getByRole("link", { name: /map a market/i });
    const land = screen.getByRole("link", { name: /^landscapes$/i });
    expect(map).toHaveAttribute("href", "/");
    expect(land).toHaveAttribute("href", "/landscape");
    expect(land).toHaveAttribute("aria-current", "page");   // pathname "/landscape" → Landscapes active
    expect(map).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", "https://github.com/adityachaudhary99/contextdev-monitor");
  });
});
