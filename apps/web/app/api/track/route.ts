export const runtime = "nodejs";

import { randomUUID } from "node:crypto";
import * as action from "../../../lib/track-action.js";

export async function POST(request: Request): Promise<Response> {
  // Parse body
  let body: { domain?: unknown; byoKey?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_domain" }, { status: 400 });
  }

  const domain = typeof body.domain === "string" ? body.domain.trim() : null;
  const byoKey =
    typeof body.byoKey === "string" && body.byoKey.length > 0
      ? body.byoKey
      : undefined;

  if (!domain) {
    return Response.json({ error: "bad_domain" }, { status: 400 });
  }

  // Derive sessionId from sid cookie or generate a fresh one
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sidMatch = cookieHeader.match(/(?:^|;\s*)sid=([^;]+)/);
  const existingSid = sidMatch ? sidMatch[1] : null;
  const sessionId = existingSid ?? randomUUID();
  const isNewSession = existingSid === null;

  // Derive day (server date)
  const day = new Date().toISOString().slice(0, 10);

  // Call tracking action (via namespace import so vitest can spy)
  const result = await action.runPricingReport({ domain, byoKey, sessionId, day });

  // Map result to HTTP response
  let status: number;
  let responseBody: Record<string, unknown>;

  if (result.ok) {
    status = 200;
    responseBody = { report: result.report };
  } else {
    responseBody = { error: result.error };
    switch (result.error) {
      case "demo_cap_reached":
        status = 429;
        break;
      case "missing_key":
      case "bad_domain":
      default:
        status = 400;
        break;
    }
  }

  const headers = new Headers({ "Content-Type": "application/json" });

  // Set sid cookie only when we generated a fresh one
  if (isNewSession) {
    headers.set(
      "Set-Cookie",
      `sid=${sessionId}; HttpOnly; SameSite=Lax; Path=/`,
    );
  }

  return new Response(JSON.stringify(responseBody), { status, headers });
}
