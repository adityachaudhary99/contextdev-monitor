import type { NormalizedSnapshot, NormalizedPlan, Pricing } from "@contextdev/core";
import { Table, Th, Td } from "./ui/table.js";
import { Badge } from "./ui/badge.js";

function price(p: NormalizedPlan): string {
  if (p.amountMinor === null) return "Custom";
  const v = p.amountMinor / 100;
  return `$${v % 1 === 0 ? v : v.toFixed(2)}`;
}

function highlights(p: NormalizedPlan): string {
  const lim = Object.entries(p.limits).map(([k, v]) => `${v} ${k}`);
  return [...p.features, ...lim].slice(0, 3).join(" · ") || "—";
}

export default function PricingTable({ pricing, changedPlans }: { pricing: NormalizedSnapshot<Pricing>; changedPlans?: Set<string> }) {
  return (
    <Table>
      <thead><tr><Th>Plan</Th><Th>Price</Th><Th>Highlights</Th></tr></thead>
      <tbody>
        {pricing.plans.map((p) => {
          const changed = changedPlans?.has(p.name);
          return (
            <tr key={p.name} className={changed ? "bg-change/5" : undefined}>
              <Td className="font-semibold">
                <span className="inline-flex items-center gap-2">{p.name}
                  {changed && <Badge variant="change" className="px-2 py-0.5 text-[10px] uppercase">updated</Badge>}</span>
              </Td>
              <Td className={`font-mono tabular-nums ${changed ? "text-change" : "text-primary"}`}>
                {price(p)}{p.amountMinor !== null && <span className="text-muted text-xs"> /{p.period}</span>}
              </Td>
              <Td className="text-muted">{highlights(p)}</Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
