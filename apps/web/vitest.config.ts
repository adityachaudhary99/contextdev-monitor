import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // server-only throws when imported outside Next.js RSC; stub it in tests
      "server-only": new URL("./lib/__mocks__/server-only.ts", import.meta.url).pathname,
    },
  },
  test: { environment: "jsdom", include: ["app/**/*.test.tsx", "app/**/*.test.ts", "lib/**/*.test.ts"], setupFiles: [] },
});
