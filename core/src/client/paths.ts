// Single source of truth for the API surface. Confirm exact paths/bodies against the OpenAPI spec.
export const BASE_URL = "https://api.context.dev/v1";
export const PATHS = {
  webSearch: "/search",
  scrapeMarkdown: "/scrape/markdown",
  extractStructured: "/extract/structured",
} as const;
