import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ExportWebdogButton from "./ExportWebdogButton.js";
import type { Landscape } from "@contextdev/core";

const ls = { category: "web scraping APIs", players: [], failures: [], comparison: { dimensions: [] }, brief: "", citations: [], creditsUsed: 0, latencyMs: 0 } as Landscape;

it("builds a JSON blob download named after the category", () => {
  const createObjectURL = vi.fn(() => "blob:x");
  const revokeObjectURL = vi.fn();
  Object.assign(URL, { createObjectURL, revokeObjectURL });
  render(<ExportWebdogButton landscape={ls} />);
  fireEvent.click(screen.getByRole("button", { name: /webdog/i }));
  expect(createObjectURL).toHaveBeenCalledOnce();
  const blob = createObjectURL.mock.calls[0][0] as Blob;
  expect(blob.type).toBe("application/json");
});
