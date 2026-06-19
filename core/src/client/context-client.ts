import { computeBackoffMs } from "./backoff.js";
import { BASE_URL, PATHS } from "./paths.js";
import type { Endpoint } from "./cost-table.js";
import type { CreditLedger } from "../credits/ledger.js";
import type { BudgetStore } from "../credits/budget-store.js";
import type { Result, SourceFailure } from "./types.js";
import { CREDIT_COST } from "./cost-table.js";

export interface ContextClientDeps {
  apiKey: string;
  fetchFn?: typeof fetch;
  ledger: CreditLedger;
  budget: BudgetStore;
  day: string;
  sleep?: (ms: number) => Promise<void>;
  maxAttempts?: number;
  rng?: () => number;
}

export class ContextClient {
  private readonly fetchFn: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly maxAttempts: number;
  private readonly rng: () => number;
  constructor(private readonly d: ContextClientDeps) {
    this.fetchFn = d.fetchFn ?? fetch;
    this.sleep = d.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.maxAttempts = d.maxAttempts ?? 4;
    this.rng = d.rng ?? Math.random;
  }

  async webSearch(query: string): Promise<Result<{ results: { title: string; url: string }[] }>> {
    // API returns { results: [{url, title, ...}], query, key_metadata }
    // The API rejects unknown keys (e.g. "limit") — always sends default 10 results.
    return this.callPost<{ results: { title: string; url: string }[] }>(
      "webSearch", PATHS.webSearch, { query }, query,
    );
  }
  async scrapeMarkdown(url: string): Promise<Result<{ url: string; markdown: string }>> {
    // API is GET /web/scrape/markdown?url=<encoded> — returns { success, markdown, url, ... }
    return this.callGet<{ url: string; markdown: string }>(
      "scrapeMarkdown", PATHS.scrapeMarkdown, { url }, url,
    );
  }
  async extractStructured(url: string, jsonSchema: unknown): Promise<Result<unknown>> {
    // API returns { status, url, urls_analyzed, data, metadata } — extracted object is under .data
    const raw = await this.callPost<{ data: unknown }>(
      "extractStructured", PATHS.extractStructured, { url, schema: jsonSchema }, url,
    );
    if (!raw.ok) return raw;
    return { ok: true, value: raw.value.data };
  }

  private async callGet<T>(
    endpoint: Endpoint, path: string, params: Record<string, string>, sourceUrl: string,
  ): Promise<Result<T>> {
    const cost = CREDIT_COST[endpoint];
    if (!(await this.d.budget.tryConsume(cost, this.d.day))) {
      return fail(sourceUrl, "budget_exceeded");
    }
    this.d.ledger.record(endpoint);
    const qs = new URLSearchParams(params).toString();
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const res = await this.fetchFn(`${BASE_URL}${path}?${qs}`, {
          method: "GET",
          headers: { authorization: `Bearer ${this.d.apiKey}` },
        });
        if (res.status === 429 && attempt < this.maxAttempts) {
          const retryAfterMs = retryAfterToMs(res.headers.get("retry-after"));
          await this.sleep(computeBackoffMs(attempt, { retryAfterMs, rng: this.rng }));
          continue;
        }
        if (!res.ok) return fail(sourceUrl, `http_${res.status}`);
        return { ok: true, value: (await res.json()) as T };
      } catch (e) {
        if (attempt < this.maxAttempts) {
          await this.sleep(computeBackoffMs(attempt, { rng: this.rng }));
          continue;
        }
        return fail(sourceUrl, `network_error: ${(e as Error).message}`);
      }
    }
    return fail(sourceUrl, "max_attempts_exhausted");
  }

  private async callPost<T>(
    endpoint: Endpoint, path: string, body: unknown, sourceUrl: string,
  ): Promise<Result<T>> {
    const cost = CREDIT_COST[endpoint];
    if (!(await this.d.budget.tryConsume(cost, this.d.day))) {
      return fail(sourceUrl, "budget_exceeded");
    }
    this.d.ledger.record(endpoint);
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const res = await this.fetchFn(`${BASE_URL}${path}`, {
          method: "POST",
          headers: { authorization: `Bearer ${this.d.apiKey}`, "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.status === 429 && attempt < this.maxAttempts) {
          const retryAfterMs = retryAfterToMs(res.headers.get("retry-after"));
          await this.sleep(computeBackoffMs(attempt, { retryAfterMs, rng: this.rng }));
          continue;
        }
        if (!res.ok) return fail(sourceUrl, `http_${res.status}`);
        return { ok: true, value: (await res.json()) as T };
      } catch (e) {
        if (attempt < this.maxAttempts) {
          await this.sleep(computeBackoffMs(attempt, { rng: this.rng }));
          continue;
        }
        return fail(sourceUrl, `network_error: ${(e as Error).message}`);
      }
    }
    return fail(sourceUrl, "max_attempts_exhausted");
  }
}

function fail(url: string, reason: string): { ok: false; failure: SourceFailure } {
  return { ok: false, failure: { url, reason } };
}
// HTTP-date Retry-After values are not supported and fall back to 0ms (jittered backoff) by design.
function retryAfterToMs(header: string | null): number {
  if (!header) return 0;
  const secs = Number(header);
  return Number.isFinite(secs) ? secs * 1000 : 0;
}
