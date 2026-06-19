import { createHash } from "node:crypto";

/** Lowercase sha256 hex of the UTF-8 bytes of `input`. */
export function hashContent(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}
