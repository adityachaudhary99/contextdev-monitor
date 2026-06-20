import type { Landscape } from "@contextdev/core";
import { Check, Minus } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "./ui/table.js";

interface ComparisonTableProps {
  landscape: Landscape;
}

export default function ComparisonTable({ landscape }: ComparisonTableProps) {
  const { players, comparison } = landscape;
  const dims = comparison.dimensions;

  return (
    <div className="overflow-x-auto">
      <Table>
        <Thead>
          <Tr>
            <Th>Player</Th>
            {dims.map((dim) => (
              <Th key={dim}>{dim}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {players.map((player) => {
            const featsLower = player.features.map((f) => f.toLowerCase());
            return (
              <Tr key={player.domain}>
                <Td className="font-semibold text-fg">
                  {player.name}
                  <span className="block text-xs font-mono text-muted">{player.domain}</span>
                </Td>
                {dims.map((dim) => (
                  <Td key={dim}>
                    {featsLower.includes(dim.toLowerCase()) ? (
                      <Check size={14} aria-hidden="true" className="text-success" />
                    ) : (
                      <Minus size={14} aria-hidden="true" className="text-muted" />
                    )}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
}
