import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider.js";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://contextdev-monitor.vercel.app"),
  title: "Context.dev Intelligence Monitor",
  description:
    "Map a market — and watch it move. Auto-build cited competitive landscapes and evidence-linked market-motion timelines with context.dev.",
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
      "Map a market — and watch it move. Auto-build cited competitive landscapes and evidence-linked market-motion timelines with context.dev.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col bg-bg">
            <Header />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
