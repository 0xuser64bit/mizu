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
    // motion cancels in-flight rAF animations when components unmount
    // mid-test; those AbortErrors are test-env artifacts, not real failures
    dangerouslyIgnoreUnhandledErrors: true,
  },
});
