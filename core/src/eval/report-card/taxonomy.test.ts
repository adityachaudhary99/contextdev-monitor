import { describe, it, expect } from "vitest";
import { classifyFailure, CONTRACT_FINDINGS } from "./taxonomy.js";

describe("classifyFailure", () => {
  it("maps known reason strings to categories", () => {
    expect(classifyFailure("http_403")).toBe("extraction/http-4xx");
    expect(classifyFailure("profile_parse_failed")).toBe("extraction/schema-reject");
    expect(classifyFailure("budget_exceeded")).toBe("budget");
    expect(classifyFailure("network_error: socket hang up")).toBe("network");
    expect(classifyFailure("max_attempts_exhausted")).toBe("extraction/timeout");
    expect(classifyFailure("something weird")).toBe("other");
  });
});
describe("CONTRACT_FINDINGS", () => {
  it("documents the five historical contract bugs with a fix each", () => {
    expect(CONTRACT_FINDINGS).toHaveLength(5);
    for (const f of CONTRACT_FINDINGS) {
      expect(f.id.startsWith("contract/")).toBe(true);
      expect(f.title.length).toBeGreaterThan(0);
      expect(f.fix.length).toBeGreaterThan(0);
    }
  });
});
