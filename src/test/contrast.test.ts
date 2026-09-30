import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import postcss from "postcss";
const css = readFileSync("packages/mizu/src/core.css", "utf8");
function luminance(hex: string) {
  const channels = [0, 2, 4]
    .map((i) => parseInt(hex.slice(i + 1, i + 3), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels.reduce(
    (sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i]!,
    0,
  );
}
function contrast(a: string, b: string) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high! + 0.05) / (low! + 0.05);
}
it("keeps text and status tokens readable across every default surface in both themes", () => {
  const base: Record<string, string> = {};
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    if (selector.includes(":root") || selector.includes('[data-theme="dark"]'))
      Object.assign(
        base,
        Object.fromEntries(
          [...body.matchAll(/--mizu-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [
            m[1],
            m[2],
          ]),
        ),
      );
  }
  for (const theme of ["dark", "light"]) {
    const tokens = { ...base };
    if (theme === "light")
      for (const [, body] of css.matchAll(
        /\[data-theme="light"\]\s*{([^}]+)}/g,
      ))
        Object.assign(
          tokens,
          Object.fromEntries(
            [...body.matchAll(/--mizu-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(
              (m) => [m[1], m[2]],
            ),
          ),
        );
    for (const foreground of [
      "paper",
      "muted",
      "faint",
      "accent",
      "success",
      "warning",
      "danger",
    ])
      for (const background of ["ink", "ink-2", "ink-3"])
        expect(
          contrast(tokens[foreground]!, tokens[background]!),
          `${theme} ${foreground} on ${background}`,
        ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast("#fffaf4", tokens["accent-fill"]!),
      `${theme} filled action label`,
    ).toBeGreaterThanOrEqual(4.5);
  }
});
it("keeps every token in the theme layer, so your own CSS overrides it in any load order", () => {
  // A registry item's base.css loads after the app's global stylesheet; unlayered,
  // its :root would reset the app's --mizu-accent at equal specificity.
  const tokens: string[] = [];
  postcss.parse(css).walkDecls(/^--mizu-/, (decl) => {
    const rule = decl.parent as postcss.Rule;
    if (
      !rule.selectors.every((s) =>
        /^(:root|body|\[data-theme="\w+"\])$/.test(s),
      )
    )
      return; // a component's own custom property, not a token
    tokens.push(decl.prop);
    const layer = rule.parent as postcss.AtRule;
    expect(`${layer.name} ${layer.params}`, decl.prop).toBe("layer theme");
  });
  expect(tokens).toContain("--mizu-accent");
  expect(tokens).toContain("--mizu-danger");
  expect(tokens).toContain("--mizu-font-display");
});
it("declares in theme blocks only what the light theme changes, so a nested theme keeps other overrides", () => {
  const declared = (theme: string) =>
    [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)]
      .filter(([, selector]) => selector.includes(`[data-theme="${theme}"]`))
      .flatMap(([, , body]) => body.match(/--mizu-[\w-]+(?=:)/g) ?? [])
      .sort();
  expect(declared("dark")).toEqual(declared("light"));
});
