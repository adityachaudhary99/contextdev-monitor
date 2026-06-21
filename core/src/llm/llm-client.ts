import type { Result } from "../client/types.js";

export interface LlmClient {
  complete(prompt: string): Promise<Result<string>>;
}

/** Thin, dependency-free Anthropic Messages client. Never throws. */
export class AnthropicClient implements LlmClient {
  constructor(private readonly d: { apiKey: string; model?: string; fetchFn?: typeof fetch }) {}
  async complete(prompt: string): Promise<Result<string>> {
    const fetchFn = this.d.fetchFn ?? fetch;
    try {
      const res = await fetchFn("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": this.d.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: this.d.model ?? "claude-sonnet-4-6",
          max_tokens: 512,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) return { ok: false, failure: { url: "anthropic", reason: `http_${res.status}` } };
      const json = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (json.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
      return { ok: true, value: text };
    } catch (e) {
      return { ok: false, failure: { url: "anthropic", reason: `network_error: ${(e as Error).message}` } };
    }
  }
}

/** Build a client from ANTHROPIC_API_KEY, or null when unset (caller falls back to the heuristic). */
export function anthropicFromEnv(fetchFn?: typeof fetch): LlmClient | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return apiKey ? new AnthropicClient({ apiKey, fetchFn }) : null;
}
