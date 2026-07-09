import type { Metadata } from "next";
import { Archivo, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap", style: ["normal", "italic"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", display: "swap", weight: ["400", "500", "600"] });
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
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
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
