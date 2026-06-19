import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page.js";

describe("home page", () => {
  it("renders the product wordmark", () => {
    render(<Page />);
    expect(screen.getByText(/Intelligence Monitor/i)).toBeTruthy();
  });
});
