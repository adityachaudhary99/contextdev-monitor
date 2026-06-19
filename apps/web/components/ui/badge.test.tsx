import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge.js";
describe("Badge", () => {
  it("renders a change-variant badge with its text", () => {
    render(<Badge variant="change">2 changes</Badge>);
    const el = screen.getByText("2 changes");
    expect(el).toBeInTheDocument();
    expect(el.className).toMatch(/text-change/);
  });
});
