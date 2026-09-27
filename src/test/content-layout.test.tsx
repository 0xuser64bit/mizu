import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Avatar,
  ImageFigure,
  Checklist,
  SplitPane,
  AppShell,
  CodeBlock,
} from "@/mizu";
describe("content and layout contracts", () => {
  it("falls back to initials when an avatar resource fails", () => {
    const { container } = render(<Avatar name="Aya Mori" src="/missing.png" />);
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByRole("img", { name: "Aya Mori" })).toHaveTextContent(
      "AM",
    );
  });
  it("retains image meaning when a figure cannot load", () => {
    render(
      <ImageFigure
        src="/missing.png"
        alt="Spacing diagram"
        caption="Study 01"
      />,
    );
    fireEvent.error(screen.getByRole("img"));
    expect(
      screen.getByRole("img", { name: "Spacing diagram" }),
    ).toHaveTextContent("unavailable");
    expect(screen.getByText("Study 01")).toBeTruthy();
  });
  it("updates one real checklist task", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Checklist
        items={[{ id: "a", label: "Types", checked: false }]}
        onChange={change}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Types" }));
    expect(change).toHaveBeenCalledWith("a", true);
  });
  it("exposes panel sizes and clamps keyboard resizing", () => {
    const change = vi.fn();
    render(
      <SplitPane
        first="Source"
        second="Preview"
        value={80}
        max={85}
        onValueChange={change}
      />,
    );
    const handle = screen.getByRole("separator");
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    expect(change).toHaveBeenCalledWith(85);
    fireEvent.keyDown(handle, { key: "Home" });
    expect(change).toHaveBeenCalledWith(15);
    expect(handle).toHaveAttribute("aria-valuenow", "80");
  });
  it("points a shell skip link at its focusable main", () => {
    render(<AppShell mainId="work">Workspace</AppShell>);
    expect(
      screen.getByRole("link", { name: "Skip to content" }),
    ).toHaveAttribute("href", "#work");
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });
  it("escapes source rather than injecting markup", () => {
    const { container } = render(
      <CodeBlock code={'<script>alert("x")</script>'} />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("code")).toHaveTextContent(
      '<script>alert("x")</script>',
    );
  });
});
