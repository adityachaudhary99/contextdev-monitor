import type { Report } from "@contextdev/core";
import { Badge } from "./ui/badge.js";

type Citation = Report["citations"][number];
type Change = Report["changes"][number];

interface ChangeListProps {
  changes: Change[];
  citations: Citation[];
}

function citationUrl(citations: Citation[], n: number): string {
  return citations[n - 1]?.url ?? "#";
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
          className="flex flex-col gap-2 rounded-lg border border-border bg-bg p-4"
        >
          {/* Change detail in rose */}
          <p className="font-mono text-base text-change">{change.detail}</p>

          {/* Confidence badge + citation link row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Confidence badge */}
            <Badge variant="neutral" aria-label={`confidence ${change.confidence}`}>
              {Math.round(change.confidence * 100)}% confidence
            </Badge>

            {/* Citation link — 1-based index into citations array */}
            <a
              href={citationUrl(citations, change.citation)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-sm text-primary underline hover:text-primary-strong transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              [{change.citation}]
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
