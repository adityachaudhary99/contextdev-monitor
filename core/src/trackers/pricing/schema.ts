import { z } from "zod";

export const MoneySchema = z.object({
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  period: z.enum(["mo", "yr", "once"]).nullable(),
});
export const PlanSchema = z.object({
  name: z.string(),
  price: MoneySchema,
  features: z.array(z.string()),
  limits: z.record(z.union([z.string(), z.number()])),
  cta: z.string().nullable(),
});
export const PricingSchema = z.object({ plans: z.array(PlanSchema) });

export type Money = z.infer<typeof MoneySchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type Pricing = z.infer<typeof PricingSchema>;

// JSON Schema form for the context.dev extractStructured call.
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
              period: { enum: ["mo", "yr", "once", null] },
            },
            required: ["amount", "currency", "period"],
          },
          features: { type: "array", items: { type: "string" } },
          limits: { type: "object" },
          cta: { type: ["string", "null"] },
        },
        required: ["name", "price", "features", "limits", "cta"],
      },
    },
  },
  required: ["plans"],
} as const;
