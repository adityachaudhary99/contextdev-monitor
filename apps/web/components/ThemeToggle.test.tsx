import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider.js";
import ThemeToggle from "./ThemeToggle.js";

describe("ThemeToggle", () => {
  it("renders an accessible theme toggle button", () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(screen.getByRole("button", { name: /theme/i })).toBeInTheDocument();
  });
});
