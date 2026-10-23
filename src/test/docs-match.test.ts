import { describe, expect, it } from "vitest";
import { matches } from "@/components/docs/match";

describe("docs search", () => {
  it("needs every word, in any order, and forgives plurals", () => {
    const text = "BarChart Readable, labelled comparisons Data";
    expect(matches(text, "data bar")).toBe(true);
    expect(matches(text, "charts")).toBe(true);
    expect(matches(text, "  ")).toBe(true);
    expect(matches(text, "bar timeline")).toBe(false);
    expect(matches("Progress", "progress")).toBe(true);
  });
});
