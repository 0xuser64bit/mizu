import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeWorkshop } from "@/components/workshop/ThemeWorkshop";
import {
  contrast,
  THEME_PRESETS,
  themeChecks,
  themeCSS,
  themeTokens,
} from "@/components/workshop/theme";

describe("Theme Workshop", () => {
  it("uses the WCAG sRGB contrast calculation and checks every preset", () => {
    expect(contrast("#000000", "#ffffff")).toBe(21);
    expect(contrast("#123456", "#123456")).toBe(1);
    for (const [name, recipe] of Object.entries(THEME_PRESETS)) {
      for (const check of themeChecks(recipe))
        expect(check.ratio, `${name}: ${check.label}`).toBeGreaterThanOrEqual(
          4.5,
        );
      expect(themeCSS(recipe)).toContain(`--mizu-accent: ${recipe.accent};`);
      expect(themeCSS(recipe)).toContain(":root,\n[data-theme]");
      expect(themeTokens(recipe)["--mizu-ink-2"]).toMatch(/^#[a-f\d]{6}$/);
    }
    expect(
      themeChecks({ ...THEME_PRESETS.Ink, paper: "#0f0e0c" })[0]!.ratio,
    ).toBe(1);
  });

  it("keeps the preview, generated CSS and reset in sync", async () => {
    const user = userEvent.setup();
    render(<ThemeWorkshop />);
    const preview = screen.getByRole("region", {
      name: "Custom theme preview",
    });
    await user.selectOptions(screen.getByLabelText("Starting palette"), "Moss");
    expect(preview).toHaveAttribute("data-theme", "light");
    expect(preview.style.getPropertyValue("--mizu-accent")).toBe(
      THEME_PRESETS.Moss.accent,
    );
    await user.selectOptions(screen.getByLabelText("Typeface"), "mono");
    expect(preview.style.getPropertyValue("--mizu-font-display")).toContain(
      "JetBrains Mono",
    );
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(await navigator.clipboard.readText()).toBe(
      themeCSS({ ...THEME_PRESETS.Moss, font: "mono" }),
    );
    await user.click(screen.getByRole("button", { name: "Reset to Mizu ink" }));
    expect(preview).toHaveAttribute("data-theme", "dark");
    expect(preview.style.getPropertyValue("--mizu-accent")).toBe(
      THEME_PRESETS.Ink.accent,
    );
  });

  it("contains real preview interactions", async () => {
    const user = userEvent.setup();
    render(<ThemeWorkshop />);
    const preview = within(
      screen.getByRole("region", { name: "Custom theme preview" }),
    );
    expect(preview.getByRole("progressbar")).toHaveAttribute("value", "2");
    await user.click(
      preview.getByRole("checkbox", { name: "Release when it is ready" }),
    );
    expect(preview.getByRole("progressbar")).toHaveAttribute("value", "3");
    await user.click(preview.getByRole("tab", { name: "Preferences" }));
    await user.click(preview.getByRole("button", { name: "Save preferences" }));
    expect(preview.getByRole("status")).toHaveTextContent("Preferences saved");
  });
});
