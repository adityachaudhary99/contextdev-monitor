// core/src/eval/report-card/taxonomy.ts
import type { FailureCategory } from "./types.js";

export type ContractFinding = { id: FailureCategory; title: string; found: string; fix: string };

// Real API-contract issues surfaced while integrating context.dev (now fixed). Shown in the
// report to demonstrate the findings, not to hide them.
export const CONTRACT_FINDINGS: ContractFinding[] = [
  { id: "contract/path-prefix", title: "Endpoints need a /web/ path prefix", found: "Every call 403'd; the documented paths omit the /web/ segment.", fix: "Prefix paths with /web/ (e.g. /web/scrape/markdown)." },
  { id: "contract/scrape-method", title: "Scrape is GET, not POST", found: "POST to the scrape endpoint failed; it is GET /web/scrape/markdown?url=.", fix: "Call scrape via GET with a url query param." },
  { id: "contract/data-unwrap", title: "Extract result is wrapped under .data", found: "Extract returns { status, url, data, metadata }; the object lives under .data.", fix: "Unwrap response.data after extract." },
  { id: "contract/null-enum-500", title: "null inside a JSON-schema enum 500s the validator", found: "A schema with null in an enum crashed the extractor (HTTP 500).", fix: "Use null-safe schemas ({type:[\"string\",\"null\"]}); never null in an enum." },
  { id: "contract/search-billing", title: "Search bills per result and ignores limit", found: "Web search rejects a limit param and always bills 10 credits (1 per result).", fix: "Budget-gate search at the full 10-credit cost." },
];

export function classifyFailure(reason: string): FailureCategory {
  const r = reason.toLowerCase();
  if (r.includes("budget")) return "budget";
  if (/http_4\d\d/.test(r) || /\b40[134]\b/.test(r)) return "extraction/http-4xx";
  if (r.includes("parse") || r.includes("schema")) return "extraction/schema-reject";
  if (r.includes("empty")) return "extraction/empty-field";
  if (r.includes("timeout") || r.includes("max_attempts")) return "extraction/timeout";
  if (r.includes("network")) return "network";
  for (const f of CONTRACT_FINDINGS) if (r.includes(f.id)) return f.id;
  return "other";
}
