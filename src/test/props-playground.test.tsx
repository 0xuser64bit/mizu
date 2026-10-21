import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ts from "typescript";
import { PropsPlayground } from "@/components/workshop/PropsPlayground";
import {
  defaultConfig,
  playgroundCode,
  PLAYGROUND_PIECES,
} from "@/components/workshop/playground";

describe("Props Playground", () => {
  it("generates valid TSX for all pieces and safely quotes special text", () => {
    for (const { value } of PLAYGROUND_PIECES) {
      const config = {
        ...defaultConfig(value),
        text: 'A "quoted" <title> {with} \\ escapes\nand a newline',
        detail: "It's <fine> {too}.",
      };
      const code = playgroundCode(value, config);
      const result = ts.transpileModule(code, {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ES2020,
        },
        reportDiagnostics: true,
      });
      expect(
        result.diagnostics?.map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        ),
        value,
      ).toEqual([]);
      expect(code).toContain(JSON.stringify(config.text));
      if (["button", "text-field", "slider"].includes(value))
        expect(code).toContain('import { useState } from "react"');
    }
  });
  it("matches button props, interactions and copied code, then resets", async () => {
    const user = userEvent.setup();
    render(<PropsPlayground />);
    const preview = within(
      screen.getByRole("region", { name: "Component preview" }),
    );
    await user.selectOptions(screen.getByLabelText("Variant"), "ghost");
    expect(preview.getByRole("button")).toHaveClass("mizu-btn--ghost");
    await user.click(preview.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Clicked 1 times.");
    await user.click(screen.getByRole("checkbox", { name: "Loading" }));
    expect(preview.getByRole("button")).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(await navigator.clipboard.readText()).toContain(
      'variant="ghost" size="md" loading',
    );
    await user.click(
      screen.getByRole("button", { name: "Reset props and preview" }),
    );
    expect(preview.getByRole("button")).toBeEnabled();
    expect(preview.getByRole("button")).toHaveClass("mizu-btn--solid");
  });
  it("updates native inputs and generates slider state from the live value", async () => {
    const user = userEvent.setup();
    render(<PropsPlayground initialPiece="slider" />);
    const preview = within(
      screen.getByRole("region", { name: "Component preview" }),
    );
    fireEvent.change(preview.getByRole("slider"), { target: { value: "73" } });
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(await navigator.clipboard.readText()).toContain("useState(73)");
    await user.click(screen.getByRole("radio", { name: "TextField" }));
    const fieldPreview = within(
      screen.getByRole("region", { name: "Component preview" }),
    );
    await user.type(fieldPreview.getByRole("textbox"), "Launch");
    expect(screen.getByRole("status")).toHaveTextContent("Value: Launch");
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(await navigator.clipboard.readText()).toContain(
      'useState("Launch")',
    );
    await user.click(screen.getByRole("checkbox", { name: "Show error" }));
    expect(fieldPreview.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await user.click(screen.getByRole("radio", { name: "Badge" }));
    expect(
      within(
        screen.getByRole("region", { name: "Component preview" }),
      ).getByText("Ready for review"),
    ).toBeInTheDocument();
  });
});
