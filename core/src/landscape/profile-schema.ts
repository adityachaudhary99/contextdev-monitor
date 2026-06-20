// core/src/landscape/profile-schema.ts
import { z } from "zod";
const LinkStr = z.string().nullable().default(null);
export const ProfileSchema = z.object({
  name: z.string(),
  oneLiner: z.string().default(""),
  tagline: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  positioning: z.string().default(""),
  links: z.object({ site: LinkStr, docs: LinkStr, pricing: LinkStr }).default({ site: null, docs: null, pricing: null }),
});
export type ProfileExtract = z.infer<typeof ProfileSchema>;

// Null-safe JSON Schema for context.dev /web/extract (NO null inside enums).
export const profileJsonSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    oneLiner: { type: "string" },
    tagline: { type: ["string", "null"] },
    tags: { type: "array", items: { type: "string" } },
    features: { type: "array", items: { type: "string" } },
    positioning: { type: "string" },
    links: { type: "object", properties: {
      site: { type: ["string", "null"] }, docs: { type: ["string", "null"] }, pricing: { type: ["string", "null"] },
    } },
  },
  required: ["name"],
} as const;
