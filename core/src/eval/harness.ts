import { PricingSchema } from "../trackers/pricing/schema.js";
import { normalizePricing } from "../trackers/pricing/normalize.js";
import { diffPricing } from "../diff/evidence-diff.js";

export type EvalCase = { name: string; t1: unknown; t2: unknown; expectChangedKinds: string[] };
export type EvalResult = { name: string; parsed: boolean; detectedKinds: string[]; pass: boolean };

export function runEvalCase(c: EvalCase): EvalResult {
  let parsed = true;
  let detectedKinds: string[] = [];
  try {
    const a = normalizePricing(PricingSchema.parse(c.t1));
    const b = normalizePricing(PricingSchema.parse(c.t2));
    detectedKinds = [...new Set(diffPricing(a, b).changes.map((x) => x.kind))].sort();
  } catch {
    parsed = false;
  }
  const expected = [...new Set(c.expectChangedKinds)].sort();
  const pass = parsed && detectedKinds.length === expected.length && detectedKinds.every((k, i) => k === expected[i]);
  return { name: c.name, parsed, detectedKinds, pass };
}
