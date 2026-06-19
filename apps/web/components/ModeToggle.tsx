'use client';

import { KeyRound, Zap } from "lucide-react";

export type Mode = "demo" | "byo";

interface ModeToggleProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="API key mode"
      className="inline-flex rounded-md border border-border bg-surface p-0.5"
    >
      <button
        type="button"
        aria-pressed={value === "demo"}
        onClick={() => onChange("demo")}
        className={[
          "flex min-h-[44px] items-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          value === "demo"
            ? "bg-primary text-white"
            : "text-muted hover:text-fg cursor-pointer",
        ].join(" ")}
      >
        <Zap size={14} />
        Demo
      </button>
      <button
        type="button"
        aria-pressed={value === "byo"}
        onClick={() => onChange("byo")}
        className={[
          "flex min-h-[44px] items-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          value === "byo"
            ? "bg-primary text-white"
            : "text-muted hover:text-fg cursor-pointer",
        ].join(" ")}
      >
        <KeyRound size={14} />
        Bring your own key
      </button>
    </div>
  );
}
