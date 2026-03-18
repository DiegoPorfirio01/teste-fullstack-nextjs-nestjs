import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:3001",
    },
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "**/e2e/**", "node_modules"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
