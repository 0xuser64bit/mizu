import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@/mizu": path.resolve(import.meta.dirname, "packages/mizu/src"),
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: [path.resolve(import.meta.dirname, "src/test/setup.ts")],
    include: ["src/test/**/*.test.{ts,tsx}"],
  },
});
