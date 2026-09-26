import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@/mizu": path.resolve(__dirname, "packages/mizu/src"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: [path.resolve(__dirname, "src/test/setup.ts")],
    include: ["src/test/**/*.test.{ts,tsx}"],
  },
});
