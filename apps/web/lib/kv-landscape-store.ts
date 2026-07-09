import "server-only";
import type { Landscape } from "@contextdev/core";
import type { LandscapeStore } from "@contextdev/core";

/** Upstash-REST-compatible KV store (Vercel KV / Upstash). Never throws: get->null, save->noop, list->[] on any error. */
export class KvLandscapeStore implements LandscapeStore {
  private readonly url: string;
  private readonly token: string;
  private readonly fetchFn: typeof fetch;
  constructor(opts: { url: string; token: string; fetchFn?: typeof fetch }) {
    this.url = opts.url.replace(/\/$/, "");
    this.token = opts.token;
    this.fetchFn = opts.fetchFn ?? fetch;
  }
  private headers() { return { Authorization: `Bearer ${this.token}` }; }
  async get(slug: string): Promise<Landscape | null> {
    try {
      const res = await this.fetchFn(`${this.url}/get/ls:${slug}`, { headers: this.headers() });
      if (!res.ok) return null;
      const body = (await res.json()) as { result?: string | null };
      if (typeof body.result !== "string") return null;
      return JSON.parse(body.result) as Landscape;
    } catch { return null; }
  }
  async save(slug: string, landscape: Landscape): Promise<void> {
    try {
      await this.fetchFn(`${this.url}/set/ls:${slug}`, { method: "POST", headers: this.headers(), body: JSON.stringify(landscape) });
    } catch { /* durable cache is best-effort */ }
  }
  async list(): Promise<string[]> {
    try {
      const res = await this.fetchFn(`${this.url}/keys/ls:*`, { headers: this.headers() });
      if (!res.ok) return [];
      const body = (await res.json()) as { result?: string[] };
      return (body.result ?? []).map((k) => k.replace(/^ls:/, ""));
    } catch { return []; }
  }
}
