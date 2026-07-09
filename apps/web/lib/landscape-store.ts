import { InMemoryLandscapeStore, type LandscapeStore } from "@contextdev/core";
import { KvLandscapeStore } from "./kv-landscape-store.js";

/** KV (Vercel KV / Upstash REST) when configured - on-demand landscapes then survive cold starts
 *  and share links stay live. In-memory otherwise (session-lifetime cache). */
export function selectLandscapeStore(env: NodeJS.ProcessEnv): LandscapeStore {
  const url = env.KV_REST_API_URL, token = env.KV_REST_API_TOKEN;
  return url && token ? new KvLandscapeStore({ url, token }) : new InMemoryLandscapeStore();
}
export const landscapeStore: LandscapeStore = selectLandscapeStore(process.env);
