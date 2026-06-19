import type { Report } from "./report.js";

/** Throws if any change references a citation number absent from `report.citations`. */
export function validateCitations(report: Report): void {
  const valid = new Set(report.citations.map((c) => c.n));
  for (const change of report.changes) {
    if (!valid.has(change.citation)) {
      throw new Error(`Unsupported citation ${change.citation} for change "${change.detail}"`);
    }
  }
}
