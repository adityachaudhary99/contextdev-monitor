import type { MetadataRoute } from "next";
import { curatedSlugs } from "../lib/landscape-catalog.js";

const BASE = "https://contextdev-monitor.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/landscape`, changeFrequency: "weekly", priority: 0.9 },
    ...curatedSlugs().map((slug) => ({ url: `${BASE}/landscape/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
