import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      bg:"var(--bg)", surface:"var(--surface)", "surface-2":"var(--surface-2)", border:"var(--border)", fg:"var(--fg)", muted:"var(--muted)",
      primary:"var(--primary)", "primary-strong":"var(--primary-strong)", "primary-fg":"var(--primary-fg)",
      accent:"var(--accent)", "accent-fg":"var(--accent-fg)",
      success:"var(--success)", warn:"var(--warn)", danger:"var(--danger)", change:"var(--change)", ghost:"var(--ghost)",
    },
    boxShadow: { card: "var(--shadow)" },
    fontFamily: {
      sans:["var(--font-archivo)","system-ui","sans-serif"],
      serif:["var(--font-source-serif)","Georgia","serif"],
      mono:["var(--font-plex-mono)","monospace"],
    },
  } },
  plugins: [],
} satisfies Config;
