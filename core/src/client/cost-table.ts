export type Endpoint = "webSearch" | "scrapeMarkdown" | "extractStructured" | "extractProducts";

// Costs confirmed live 2026-06-19 against key_metadata.credits_consumed headers.
// webSearch: 1 credit PER RESULT returned (default 10 results = 10 credits). The client
// always sends {query} with no limit param (API rejects unknown keys), so budget gate
// charges 10 credits to reserve the full cost of a default 10-result search.
export const CREDIT_COST: Record<Endpoint, number> = {
  webSearch: 10,
  scrapeMarkdown: 1,
  extractStructured: 10,
  extractProducts: 1,
};
