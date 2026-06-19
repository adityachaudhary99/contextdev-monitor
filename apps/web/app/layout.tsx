import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://contextdev-monitor.vercel.app"),
  title: "Context.dev Intelligence Monitor",
  description:
    "Track a competitor's pricing page and get evidence-linked diffs on demand. Powered by context.dev.",
  keywords: [
    "competitor pricing",
    "pricing intelligence",
    "pricing tracker",
    "context.dev",
    "structured extraction",
    "pricing monitor",
  ],
  openGraph: {
    type: "website",
    title: "Context.dev Intelligence Monitor",
    description:
      "Enter a competitor domain — get a typed pricing snapshot, a diff against the prior one, and an evidence-cited report. No scrapers to maintain.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
