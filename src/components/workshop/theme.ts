export type ThemeRecipe = {
  scheme: "dark" | "light";
  surface: string;
  paper: string;
  accent: string;
  fill: string;
  font: "archivo" | "system" | "mono";
  radius: number;
};

export const THEME_PRESETS = {
  Ink: {
    scheme: "dark",
    surface: "#0f0e0c",
    paper: "#f4f0e8",
    accent: "#ff4d1c",
    fill: "#d23e0e",
    font: "archivo",
    radius: 2,
  },
  Paper: {
    scheme: "light",
    surface: "#f4f0e8",
    paper: "#16130f",
    accent: "#a72c0a",
    fill: "#a72c0a",
    font: "archivo",
    radius: 2,
  },
  Blueprint: {
    scheme: "dark",
    surface: "#0d1420",
    paper: "#e9eff9",
    accent: "#8bb7ff",
    fill: "#315fa8",
    font: "archivo",
    radius: 2,
  },
  Moss: {
    scheme: "light",
    surface: "#edf0e8",
    paper: "#17241d",
    accent: "#266447",
    fill: "#266447",
    font: "archivo",
    radius: 2,
  },
} satisfies Record<string, ThemeRecipe>;

const fonts = {
  archivo:
    'var(--font-archivo, "Archivo Variable"), ui-sans-serif, system-ui, sans-serif',
  system: "ui-sans-serif, system-ui, sans-serif",
  mono: 'var(--font-jetbrains-mono, "JetBrains Mono"), ui-monospace, monospace',
};

const channels = (hex: string) =>
  [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
function mix(a: string, b: string, amount: number) {
  const other = channels(b);
  return (
    "#" +
    channels(a)
      .map((n, i) =>
        Math.round(n + (other[i]! - n) * amount)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export function contrast(a: string, b: string) {
  const luminance = (hex: string) =>
    channels(hex).reduce((sum, n, i) => {
      const v = n / 255;
      return (
        sum +
        (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) *
          [0.2126, 0.7152, 0.0722][i]!
      );
    }, 0);
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high! + 0.05) / (low! + 0.05);
}

export function themeTokens(recipe: ThemeRecipe): Record<string, string> {
  return {
    "--mizu-color-scheme": recipe.scheme,
    "--mizu-ink": recipe.surface,
    "--mizu-ink-2": mix(recipe.surface, recipe.paper, 0.035),
    "--mizu-ink-3": mix(recipe.surface, recipe.paper, 0.07),
    "--mizu-paper": recipe.paper,
    "--mizu-muted": mix(recipe.surface, recipe.paper, 0.73),
    "--mizu-faint": mix(recipe.surface, recipe.paper, 0.7),
    "--mizu-line": mix(recipe.surface, recipe.paper, 0.16),
    "--mizu-line-bright": mix(recipe.surface, recipe.paper, 0.25),
    "--mizu-accent": recipe.accent,
    "--mizu-accent-fill": recipe.fill,
    "--mizu-success": recipe.scheme === "dark" ? "#70bc96" : "#206442",
    "--mizu-warning": recipe.scheme === "dark" ? "#dbb66a" : "#775100",
    "--mizu-danger": recipe.scheme === "dark" ? "#ef9b8e" : "#a12716",
    "--mizu-font-display": fonts[recipe.font],
    "--mizu-radius": `${recipe.radius}px`,
  };
}

export function themeChecks(recipe: ThemeRecipe) {
  const tokens = themeTokens(recipe);
  const minimum = (foreground: string) =>
    Math.min(
      ...["ink", "ink-2", "ink-3"].map((surface) =>
        contrast(foreground, tokens[`--mizu-${surface}`]!),
      ),
    );
  return [
    { label: "Body text", ratio: minimum(recipe.paper) },
    {
      label: "Secondary text",
      ratio: Math.min(
        minimum(tokens["--mizu-muted"]!),
        minimum(tokens["--mizu-faint"]!),
      ),
    },
    { label: "Signal text", ratio: minimum(recipe.accent) },
    { label: "Action label", ratio: contrast("#fffaf4", recipe.fill) },
    {
      label: "Status text",
      ratio: Math.min(
        ...["success", "warning", "danger"].map((tone) =>
          minimum(tokens[`--mizu-${tone}`]!),
        ),
      ),
    },
  ];
}

export function themeCSS(recipe: ThemeRecipe) {
  return `/* Mizu theme — import after mizu-ui/styles.css.\n   Applies to all theme ancestors. Keep light/dark variants in separate selectors. */\n:root,\n[data-theme] {\n${Object.entries(
    themeTokens(recipe),
  )
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n")}\n}\n`;
}
