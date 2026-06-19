import { z } from "zod";

export const MoneySchema = z.object({
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  // period is a free string from the API (e.g. "month", "month (billed yearly)", "once").
  // normalizePricing maps it to the canonical "mo"|"yr"|"once"|null form.
  period: z.string().nullable(),
});
export const PlanSchema = z.object({
  name: z.string(),
  price: MoneySchema,
  features: z.array(z.string()),
  // limits is omitted from the JSON Schema sent to the API (open-ended object causes 500).
  // Default to empty; downstream normalize.ts passes it through as-is.
  limits: z.record(z.union([z.string(), z.number()])).default({}),
  cta: z.string().nullable(),
});
export const PricingSchema = z.object({ plans: z.array(PlanSchema) });

export type Money = z.infer<typeof MoneySchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type Pricing = z.infer<typeof PricingSchema>;

// JSON Schema form for the context.dev /web/extract call.
// Confirmed working contract (2026-06-19):
//   - type:["x","null"] arrays are accepted for nullable scalars.
//   - enum:[..., null] (null literal in enum) causes a 500 — removed.
//   - period returned as a free string (e.g. "month", "month (billed yearly)") — use string type.
//   - limits:{type:"object"} (open-ended object) causes a 500 — omitted from JSON Schema;
//     the normalize layer derives limits from features text instead.
export const pricingJsonSchema = {
  type: "object",
  properties: {
    plans: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: {
            type: "object",
            properties: {
              amount: { type: ["number", "null"] },
              currency: { type: ["string", "null"] },
              period: { type: ["string", "null"] },
            },
            required: ["amount", "currency", "period"],
          },
          features: { type: "array", items: { type: "string" } },
          cta: { type: ["string", "null"] },
        },
        required: ["name", "price", "features", "cta"],
      },
    },
  },
  required: ["plans"],
} as const;
