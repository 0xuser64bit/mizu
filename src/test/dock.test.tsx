import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dock, type DockLayout, type DockTab } from "@/mizu";

const tabs: DockTab[] = [
  {
    id: "source",
    label: "Source",
    content: (
      <label>
        Draft
        <input defaultValue="Keep this draft" />
      </label>
    ),
  },
  { id: "notes", label: "Notes", content: <p>Review notes</p> },
  { id: "preview", label: "Preview", content: <p>Published preview</p> },
];
const initial: DockLayout = {
  panes: [["source", "notes"], ["preview"]],
  active: ["source", "preview"],
  split: 50,
  collapsed: null,
};
const firstTabs = () =>
  within(screen.getByRole("tablist", { name: "Studio: first pane" }));
const secondTabs = () =>
  within(screen.getByRole("tablist", { name: "Studio: second pane" }));

describe("Dock", () => {
  it("exposes connected tabs and uses arrow, Home and End keys to select", async () => {
    const user = userEvent.setup();
    render(<Dock label="Studio" tabs={tabs} />);
    const source = firstTabs().getByRole("tab", { name: "Source" });
    const notes = firstTabs().getByRole("tab", { name: "Notes" });
    expect(screen.getByRole("tabpanel", { name: "Source" })).toHaveAttribute(
      "id",
      source.getAttribute("aria-controls"),
    );
    source.focus();
    await user.keyboard("{ArrowRight}");
    expect(notes).toHaveFocus();
    expect(notes).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Notes" })).toHaveTextContent(
      "Review notes",
    );
    await user.keyboard("{ArrowRight}");
    expect(source).toHaveFocus();
    await user.keyboard("{End}");
    expect(notes).toHaveFocus();
    await user.keyboard("{Home}");
    expect(source).toHaveFocus();
    expect(notes).toHaveAttribute("tabindex", "-1");
  });

  it("keeps the same editor mounted across selection, moves and collapse", async () => {
    const user = userEvent.setup();
    render(<Dock label="Studio" tabs={tabs} />);
    const input = screen.getByRole("textbox", { name: "Draft" });
    await user.clear(input);
    await user.type(input, "Unpublished changes");
    await user.click(firstTabs().getByRole("tab", { name: "Notes" }));
    expect(screen.queryByRole("textbox", { name: "Draft" })).toBeNull();
    await user.click(firstTabs().getByRole("tab", { name: "Source" }));
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(input);
    await user.click(
      screen.getByRole("button", { name: "Move Source to second pane" }),
    );
    expect(secondTabs().getByRole("tab", { name: "Source" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(input);
    expect(input).toHaveValue("Unpublished changes");
    await user.click(
      screen.getByRole("button", { name: "Collapse second pane" }),
    );
    expect(screen.queryByRole("textbox", { name: "Draft" })).toBeNull();
    expect(screen.queryByRole("separator")).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Restore second pane" }),
    );
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(input);
    expect(input).toHaveValue("Unpublished changes");
  });

  it("reorders with buttons and supplies a keyboard path for moving", async () => {
    const user = userEvent.setup();
    render(<Dock label="Studio" tabs={tabs} />);
    await user.click(firstTabs().getByRole("tab", { name: "Notes" }));
    await user.click(
      screen.getByRole("button", { name: "Move Notes earlier" }),
    );
    expect(
      firstTabs()
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(["Notes", "Source"]);
    const notes = firstTabs().getByRole("tab", { name: "Notes" });
    expect(notes).toHaveFocus();
    fireEvent.keyDown(notes, { key: "ArrowRight", altKey: true });
    expect(
      firstTabs()
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(["Source", "Notes"]);
    fireEvent.keyDown(notes, {
      key: "ArrowRight",
      altKey: true,
      shiftKey: true,
    });
    expect(
      secondTabs()
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(["Preview", "Notes"]);
    const moved = secondTabs().getByRole("tab", { name: "Notes" });
    expect(moved).toHaveFocus();
    expect(screen.getByRole("tabpanel", { name: "Notes" })).toHaveTextContent(
      "Review notes",
    );
    fireEvent.keyDown(moved, {
      key: "ArrowRight",
      altKey: true,
      shiftKey: true,
    });
    expect(secondTabs().getByRole("tab", { name: "Notes" })).toBe(moved);
    fireEvent.keyDown(moved, {
      key: "ArrowLeft",
      altKey: true,
      shiftKey: true,
    });
    expect(
      firstTabs()
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(["Source", "Notes"]);
  });

  it("clamps keyboard and incoming panel sizes to safe bounds", () => {
    const change = vi.fn();
    render(
      <Dock
        label="Studio"
        tabs={tabs}
        defaultValue={{ ...initial, split: 78 }}
        onValueChange={change}
      />,
    );
    const separator = screen.getByRole("separator");
    fireEvent.keyDown(separator, { key: "ArrowRight", shiftKey: true });
    expect(separator).toHaveAttribute("aria-valuenow", "80");
    expect(change.mock.lastCall?.[0].split).toBe(80);
    fireEvent.keyDown(separator, { key: "Home" });
    expect(separator).toHaveAttribute("aria-valuenow", "20");
    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    expect(separator).toHaveAttribute("aria-valuenow", "20");
    fireEvent.keyDown(separator, { key: "End" });
    expect(separator).toHaveAttribute("aria-valuenow", "80");
  });

  it("does not change a controlled layout until its caller accepts it", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Dock
        label="Studio"
        tabs={tabs}
        value={initial}
        onValueChange={change}
      />,
    );
    await user.click(firstTabs().getByRole("tab", { name: "Notes" }));
    expect(change).toHaveBeenLastCalledWith({
      ...initial,
      active: ["notes", "preview"],
    });
    expect(firstTabs().getByRole("tab", { name: "Source" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("resizes only during a captured pointer drag", () => {
    const { container } = render(<Dock label="Studio" tabs={tabs} />);
    const separator = screen.getByRole("separator");
    const grid = container.querySelector(".mizu-dock-grid")!;
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue(
      new DOMRect(100, 0, 424, 300),
    );
    let captured = false;
    Object.assign(separator, {
      setPointerCapture: () => {
        captured = true;
      },
      hasPointerCapture: () => captured,
      releasePointerCapture: () => {
        captured = false;
      },
    });
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 392 });
    expect(separator).toHaveAttribute("aria-valuenow", "50");
    fireEvent.pointerDown(separator, { pointerId: 1, button: 0 });
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 392 });
    expect(separator).toHaveAttribute("aria-valuenow", "70");
    fireEvent.pointerUp(separator, { pointerId: 1 });
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 312 });
    expect(separator).toHaveAttribute("aria-valuenow", "70");
  });

  it("normalizes stale and repeated IDs and recovers selection when data changes", () => {
    const stale: DockLayout = {
      ...initial,
      panes: [["missing", "source", "source"], ["preview"]],
      active: ["missing", "missing"],
      split: Number.NaN,
    };
    const { rerender } = render(
      <Dock label="Studio" tabs={tabs} value={stale} />,
    );
    expect(
      firstTabs()
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(["Source", "Notes"]);
    expect(firstTabs().getByRole("tab", { name: "Source" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
    rerender(
      <Dock
        label="Studio"
        tabs={tabs.filter((tab) => tab.id !== "source")}
        value={stale}
      />,
    );
    expect(firstTabs().getByRole("tab", { name: "Notes" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByRole("tab", { name: "Source" })).toBeNull();
  });

  it("shows an empty destination and restores it when a tab moves there", async () => {
    const user = userEvent.setup();
    render(<Dock label="Studio" tabs={tabs.slice(0, 1)} />);
    expect(screen.getByText("No panels in the second pane.")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Move Source to second pane" }),
    );
    expect(screen.getByText("No panels in the first pane.")).toBeVisible();
    expect(secondTabs().getByRole("tab", { name: "Source" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByText("No panels in the second pane.")).toBeNull();
  });

  it("locks structural changes while keeping tab selection available", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(<Dock label="Studio" tabs={tabs} readOnly onValueChange={change} />);
    expect(
      screen.getByRole("button", { name: "Collapse first pane" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move Source to second pane" }),
    ).toBeDisabled();
    const source = firstTabs().getByRole("tab", { name: "Source" });
    fireEvent.keyDown(source, {
      key: "ArrowRight",
      altKey: true,
      shiftKey: true,
    });
    fireEvent.keyDown(screen.getByRole("separator"), { key: "End" });
    expect(change).not.toHaveBeenCalled();
    await user.click(firstTabs().getByRole("tab", { name: "Notes" }));
    expect(screen.getByRole("tabpanel", { name: "Notes" })).toBeVisible();
    expect(change).toHaveBeenCalledOnce();
  });

  it("works when a controlled caller accepts edits and preserves descendant state", async () => {
    function App() {
      const [value, setValue] = useState(initial);
      return (
        <Dock
          label="Studio"
          tabs={tabs}
          value={value}
          onValueChange={setValue}
        />
      );
    }
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole("textbox", { name: "Draft" });
    await user.type(input, "!");
    await user.click(
      screen.getByRole("button", { name: "Move Source to second pane" }),
    );
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(input);
    expect(input).toHaveValue("Keep this draft!");
  });
});
