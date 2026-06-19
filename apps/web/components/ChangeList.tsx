import { ExternalLink, TrendingUp } from "lucide-react";
import type { Report } from "@contextdev/core";

type Citation = Report["citations"][number];
type Change = Report["changes"][number];

interface ChangeListProps {
  changes: Change[];
  citations: Citation[];
}

function citationUrl(citations: Citation[], n: number): string {
  return citations.find((c) => c.n === n)?.url ?? "#";
}

export default function ChangeList({ changes, citations }: ChangeListProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Detected changes">
      {changes.map((change, idx) => (
        <li
          key={idx}
          className="flex flex-col gap-1.5 rounded-lg border border-[#1F2A37] bg-[#121821] p-4"
        >
          {/* Change detail */}
          <p className="font-mono text-base text-[#E6EDF3]">{change.detail}</p>

          {/* Confidence badge + citation link row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Confidence badge — always icon + text (never color alone) */}
            <span
              className="inline-flex items-center gap-1 rounded-full border border-[#1F2A37] bg-[#0A0E14] px-2.5 py-0.5 font-mono tabular-nums text-sm text-[#E6EDF3]"
              aria-label={`confidence ${change.confidence}`}
            >
              <TrendingUp size={12} aria-hidden="true" className="text-[#3B82F6]" />
              <span className="text-[#8B97A6] mr-0.5">confidence</span>
              <span className="text-[#E6EDF3]">{change.confidence.toFixed(1)}</span>
            </span>

            {/* Citation link */}
            <a
              href={citationUrl(citations, change.citation)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-sm text-[#3B82F6] underline hover:text-blue-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              [{change.citation}]
              <ExternalLink size={10} aria-hidden="true" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
