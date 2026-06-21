import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page.js";

describe("home page", () => {
  it("renders the primary mode switch", () => {
    render(<Page />);
    expect(screen.getByRole("button", { name: /map a market/i })).toBeInTheDocument();
  });
});
