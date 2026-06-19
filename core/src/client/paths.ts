// Single source of truth for the API surface. Confirmed against live API 2026-06-19.
export const BASE_URL = "https://api.context.dev/v1";
export const PATHS = {
  webSearch: "/web/search",
  scrapeMarkdown: "/web/scrape/markdown",
  extractStructured: "/web/extract",
} as const;
