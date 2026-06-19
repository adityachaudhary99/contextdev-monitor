import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the track-action module before importing the route
vi.mock("../../../lib/track-action.js", () => ({
  runPricingReport: vi.fn(),
}));

import * as action from "../../../lib/track-action.js";
import { POST } from "./route.js";

const fakeReport = {
  domain: "stripe.com",
  trackerId: "pricing",
  headline: "No change detected for stripe.com",
  changes: [],
  citations: [],
  creditsUsed: 11,
  latencyMs: 800,
  failures: [],
};

function makeRequest(
  body: unknown,
  cookies?: Record<string, string>,
): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookies) {
    headers["Cookie"] = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
  return new Request("http://localhost/api/track", {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}

beforeEach(() => {
  vi.mocked(action.runPricingReport).mockReset();
});

describe("POST /api/track", () => {
  it("returns 200 with report on success", async () => {
    vi.mocked(action.runPricingReport).mockResolvedValueOnce({
      ok: true,
      report: fakeReport as never,
    });

    const res = await POST(makeRequest({ domain: "stripe.com" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ report: fakeReport });
    // byoKey must NOT appear in response
    expect(JSON.stringify(body)).not.toContain("byoKey");
  });

  it("returns 400 on missing_key", async () => {
    vi.mocked(action.runPricingReport).mockResolvedValueOnce({
      ok: false,
      error: "missing_key",
    });

    const res = await POST(makeRequest({ domain: "stripe.com" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "missing_key" });
  });

  it("returns 400 on bad_domain", async () => {
    vi.mocked(action.runPricingReport).mockResolvedValueOnce({
      ok: false,
      error: "bad_domain",
    });

    const res = await POST(makeRequest({ domain: "not-a-valid-domain!!" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "bad_domain" });
  });

  it("returns 429 on demo_cap_reached", async () => {
    vi.mocked(action.runPricingReport).mockResolvedValueOnce({
      ok: false,
      error: "demo_cap_reached",
    });

    const res = await POST(makeRequest({ domain: "stripe.com" }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body).toEqual({ error: "demo_cap_reached" });
  });

  it("sets sid cookie when no cookie is present", async () => {
    vi.mocked(action.runPricingReport).mockResolvedValueOnce({
      ok: true,
      report: fakeReport as never,
    });

    const res = await POST(makeRequest({ domain: "stripe.com" }));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toMatch(/sid=/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Path=\//i);
  });

  it("does NOT set sid cookie when one is already present", async () => {
    vi.mocked(action.runPricingReport).mockResolvedValueOnce({
      ok: true,
      report: fakeReport as never,
    });

    const res = await POST(makeRequest({ domain: "stripe.com" }, { sid: "existing-session-id" }));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeNull();
  });

  it("passes byoKey to runPricingReport but never exposes it in response", async () => {
    vi.mocked(action.runPricingReport).mockResolvedValueOnce({
      ok: true,
      report: fakeReport as never,
    });

    const res = await POST(
      makeRequest({ domain: "stripe.com", byoKey: "sk-secret-key-123" }),
    );
    expect(res.status).toBe(200);

    // byoKey was forwarded to runPricingReport
    expect(vi.mocked(action.runPricingReport)).toHaveBeenCalledWith(
      expect.objectContaining({ byoKey: "sk-secret-key-123" }),
    );

    // byoKey never appears in response body
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain("sk-secret-key-123");
    expect(JSON.stringify(body)).not.toContain("byoKey");
  });

  it("returns 400 on malformed JSON", async () => {
    const req = new Request("http://localhost/api/track", {
      method: "POST",
      body: "not-json{{{",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when domain is missing", async () => {
    vi.mocked(action.runPricingReport).mockResolvedValueOnce({
      ok: false,
      error: "bad_domain",
    });

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});
