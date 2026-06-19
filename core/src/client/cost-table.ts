export type Endpoint = "webSearch" | "scrapeMarkdown" | "extractStructured" | "extractProducts";

// PLACEHOLDER costs — confirm exact per-endpoint credit costs against docs.context.dev during Task 5.
export const CREDIT_COST: Record<Endpoint, number> = {
  webSearch: 1,
  scrapeMarkdown: 1,
  extractStructured: 1,
  extractProducts: 1,
};
