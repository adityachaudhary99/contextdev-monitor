import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0E14", surface: "#121821", border: "#1F2A37",
        fg: "#E6EDF3", muted: "#8B97A6",
        primary: "#3B82F6", "primary-strong": "#1E40AF", accent: "#D97706",
        success: "#16A34A", warn: "#D97706", danger: "#DC2626",
      },
      fontFamily: { sans: ["Fira Sans", "system-ui", "sans-serif"], mono: ["Fira Code", "monospace"] },
    },
  },
  plugins: [],
} satisfies Config;
