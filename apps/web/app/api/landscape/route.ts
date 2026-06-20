export const runtime = "nodejs";

import { randomUUID } from "node:crypto";
import * as action from "../../../lib/landscape-action.js";

export async function POST(request: Request): Promise<Response> {
  // Parse body
  let body: { category?: unknown; byoKey?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_category" }, { status: 400 });
  }

  const category = typeof body.category === "string" ? body.category : null;
  const byoKey =
    typeof body.byoKey === "string" && body.byoKey.length > 0
      ? body.byoKey
      : undefined;

  if (category === null) {
    return Response.json({ error: "bad_category" }, { status: 400 });
  }

  // Derive sessionId from sid cookie or generate a fresh one
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sidMatch = cookieHeader.match(/(?:^|;\s*)sid=([^;]+)/);
  const existingSid = sidMatch ? sidMatch[1] : null;
  const sessionId = existingSid ?? randomUUID();
  const isNewSession = existingSid === null;

  // Derive day (server date)
  const day = new Date().toISOString().slice(0, 10);

  // Call landscape action (via namespace import so vitest can spy)
  const result = await action.runLandscapeReport({ category, byoKey, sessionId, day });

  // Map result to HTTP response
  let status: number;
  let responseBody: Record<string, unknown>;

  if (result.ok) {
    status = 200;
    responseBody = { landscape: result.landscape };
  } else {
    responseBody = { error: result.error };
    switch (result.error) {
      case "demo_cap_reached":
        status = 429;
        break;
      case "missing_key":
      case "bad_category":
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
