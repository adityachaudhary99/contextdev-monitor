import { describe, it, expect } from "vitest";
import { normalizeTags, deriveTags, resolveTags } from "./tags.js";

describe("normalizeTags", () => {
  it("trims, lowercases, collapses spaces, dedupes, drops empties, caps to 8", () => {
    expect(normalizeTags([" API ", "api", "", "Proxies", "proxies", "Web  Scraping"]))
      .toEqual(["api", "proxies", "web scraping"]);
    expect(normalizeTags(Array.from({ length: 12 }, (_, i) => `t${i}`))).toHaveLength(8);
  });
});
describe("deriveTags", () => {
  it("keeps short features (<=3 words), drops long ones, normalizes", () => {
    expect(deriveTags(["Proxies", "CAPTCHA solving", "Fully managed headless browser farm"]))
      .toEqual(["proxies", "captcha solving"]);
  });
});
describe("resolveTags", () => {
  it("prefers normalized extracted tags", () => {
    expect(resolveTags(["API", "api"], ["a long feature string here"])).toEqual(["api"]);
  });
  it("falls back to derived tags when none were extracted", () => {
    expect(resolveTags([], ["Proxies"])).toEqual(["proxies"]);
  });
});
