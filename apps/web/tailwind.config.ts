import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      bg:"var(--bg)", surface:"var(--surface)", border:"var(--border)", fg:"var(--fg)", muted:"var(--muted)",
      primary:"var(--primary)", "primary-strong":"var(--primary-strong)",
      success:"var(--success)", warn:"var(--warn)", danger:"var(--danger)", change:"var(--change)",
    },
    boxShadow: { card: "var(--shadow)" },
    fontFamily: { sans:["Fira Sans","system-ui","sans-serif"], mono:["Fira Code","monospace"] },
  } },
  plugins: [],
} satisfies Config;
