import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the landscape-action module before importing the route
vi.mock("../../../lib/landscape-action.js", () => ({
  runLandscapeReport: vi.fn(),
}));

import * as action from "../../../lib/landscape-action.js";
import * as storeModule from "../../../lib/landscape-store.js";
import { POST } from "./route.js";

const fakeLandscape = {
  category: "scraping apis",
  players: [],
  failures: [],
  comparison: { dimensions: [] },
  brief: "A brief summary",
  citations: [],
  creditsUsed: 87,
  latencyMs: 1200,
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
  return new Request("http://localhost/api/landscape", {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}

beforeEach(() => {
  vi.mocked(action.runLandscapeReport).mockReset();
});

describe("POST /api/landscape", () => {
  it("returns 200 with landscape on success", async () => {
    vi.mocked(action.runLandscapeReport).mockResolvedValueOnce({
      ok: true,
      landscape: fakeLandscape,
    });

    const res = await POST(makeRequest({ category: "scraping apis" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ landscape: fakeLandscape, slug: "scraping-apis" });
    // byoKey must NOT appear in response
    expect(JSON.stringify(body)).not.toContain("byoKey");
  });

  it("persists the landscape under its slug and returns the slug", async () => {
    const landscape = { ...fakeLandscape, category: "Web Scraping APIs" };
    vi.mocked(action.runLandscapeReport).mockResolvedValueOnce({
      ok: true,
      landscape,
    });
    const saveSpy = vi.spyOn(storeModule.landscapeStore, "save").mockResolvedValueOnce(undefined);

    const res = await POST(makeRequest({ category: "Web Scraping APIs" }));
    const body = await res.json();
    expect(body.slug).toBe("web-scraping-apis");
    expect(saveSpy).toHaveBeenCalledWith("web-scraping-apis", expect.objectContaining({ category: "Web Scraping APIs" }));
  });

  it("returns 400 on bad_category", async () => {
    vi.mocked(action.runLandscapeReport).mockResolvedValueOnce({
      ok: false,
      error: "bad_category",
    });

    const res = await POST(makeRequest({ category: "  " }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "bad_category" });
  });

  it("returns 400 on missing_key", async () => {
    vi.mocked(action.runLandscapeReport).mockResolvedValueOnce({
      ok: false,
      error: "missing_key",
    });

    const res = await POST(makeRequest({ category: "scraping apis" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "missing_key" });
  });

  it("returns 429 on demo_cap_reached", async () => {
    vi.mocked(action.runLandscapeReport).mockResolvedValueOnce({
      ok: false,
      error: "demo_cap_reached",
    });

    const res = await POST(makeRequest({ category: "scraping apis" }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body).toEqual({ error: "demo_cap_reached" });
  });

  it("sets sid cookie when no cookie is present", async () => {
    vi.mocked(action.runLandscapeReport).mockResolvedValueOnce({
      ok: true,
      landscape: fakeLandscape,
    });

    const res = await POST(makeRequest({ category: "scraping apis" }));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toMatch(/sid=/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Path=\//i);
  });

  it("does NOT set sid cookie when one is already present", async () => {
    vi.mocked(action.runLandscapeReport).mockResolvedValueOnce({
      ok: true,
      landscape: fakeLandscape,
    });

    const res = await POST(makeRequest({ category: "scraping apis" }, { sid: "existing-session-id" }));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeNull();
  });

  it("passes byoKey to runLandscapeReport but never exposes it in response body", async () => {
    vi.mocked(action.runLandscapeReport).mockResolvedValueOnce({
      ok: true,
      landscape: fakeLandscape,
    });

    const res = await POST(
      makeRequest({ category: "scraping apis", byoKey: "sk-secret-key-123" }),
    );
    expect(res.status).toBe(200);

    // byoKey was forwarded to runLandscapeReport
    expect(vi.mocked(action.runLandscapeReport)).toHaveBeenCalledWith(
      expect.objectContaining({ byoKey: "sk-secret-key-123" }),
    );

    // byoKey never appears in response body
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain("sk-secret-key-123");
    expect(JSON.stringify(body)).not.toContain("byoKey");
  });
});
