import type { ContextClient } from "../client/context-client.js";
import type { Result } from "../client/types.js";
import type { EvidenceDiff } from "../diff/evidence-diff.js";
import type { NormalizedSnapshot } from "./pricing/normalize.js";

export interface Tracker<T> {
  id: string;
  locate(domain: string, client: ContextClient): Promise<Result<string>>;
  jsonSchema: unknown;
  parse(raw: unknown): T;
  normalize(raw: T): NormalizedSnapshot<T>;
  diff(prev: NormalizedSnapshot<T>, next: NormalizedSnapshot<T>): EvidenceDiff;
}
