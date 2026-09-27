import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { SYSTEMS, COMPONENTS } from "../components/docs/registry";
import * as library from "@/mizu";
describe("public catalog contract", () => {
  it("keeps at least 100 unique systems with source, API, usage and behavior documentation", () => {
    expect(SYSTEMS.length).toBeGreaterThanOrEqual(100);
    expect(new Set(SYSTEMS.map((c) => c.name)).size).toBe(SYSTEMS.length);
    expect(new Set(COMPONENTS.map((c) => c.slug)).size).toBe(COMPONENTS.length);
    for (const entry of SYSTEMS) {
      expect(
        existsSync(resolve("packages/mizu/src", entry.source)),
        entry.name,
      ).toBe(true);
      expect(entry.props.length, entry.name).toBeGreaterThan(0);
      expect(entry.usage, entry.name).toContain('from "mizu-ui"');
      expect(entry.a11y.length, entry.name).toBeGreaterThan(30);
      expect(entry.motion.length, entry.name).toBeGreaterThan(0);
      const exported =
        entry.name === "Toast"
          ? "ToastProvider"
          : entry.name === "PageWipe"
            ? "PageWipeProvider"
            : entry.name;
      expect(library, entry.name).toHaveProperty(exported);
    }
  });
});
