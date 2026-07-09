"use client";
import { useState } from "react";
import { Link2, Check } from "lucide-react";

export default function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/landscape/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable - leave label unchanged */ }
  };
  return (
    <button type="button" onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:text-fg"
      aria-label={copied ? "Copied" : "Share this landscape"}>
      {copied ? <Check size={13} aria-hidden="true" /> : <Link2 size={13} aria-hidden="true" />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
