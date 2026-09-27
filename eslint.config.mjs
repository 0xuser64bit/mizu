import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["packages/mizu/src/**", "src/components/docs/demos/generated/**"],
    // These examples and package modules also run outside Next.
    rules: { "@next/next/no-img-element": "off", "@next/next/no-html-link-for-pages": "off", "@next/next/no-location-assign-relative-destination": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local additions:
    "node_modules/**",
    "examples/**",
    "packages/*/dist/**",
  ]),
]);

export default eslintConfig;
