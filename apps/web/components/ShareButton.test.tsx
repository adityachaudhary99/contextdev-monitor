import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShareButton from "./ShareButton.js";

describe("ShareButton", () => {
  it("copies the absolute landscape URL and flips to Copied", async () => {
    const writeText = vi.fn(async () => {});
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareButton slug="web-scraping-apis" />);
    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/\/landscape\/web-scraping-apis$/)));
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });
});
