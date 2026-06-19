// core/src/cache/content-hash.test.ts
import { describe, it, expect } from "vitest";
import { hashContent } from "./content-hash.js";

describe("hashContent", () => {
  it("returns the sha256 hex of the input", () => {
    expect(hashContent("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });
  it("is stable and differs for different input", () => {
    expect(hashContent("a")).toBe(hashContent("a"));
    expect(hashContent("a")).not.toBe(hashContent("b"));
  });
});
