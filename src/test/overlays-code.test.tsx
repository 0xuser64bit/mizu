import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DialogBody, DialogClose, DialogTitle, Drawer, Popover } from "@/mizu";

describe("Drawer", () => {
  it("is a labelled modal dialog on its side that closes like one", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Drawer open side="left" onOpenChange={change} label="Filters">
        <DialogClose />
        <DialogTitle>Filters</DialogTitle>
        <DialogBody>Only open issues</DialogBody>
      </Drawer>,
    );
    const drawer = screen.getByRole("dialog", { name: "Filters" });
    expect(drawer).toHaveClass(
      "mizu-dialog",
      "mizu-drawer",
      "mizu-drawer--left",
    );
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(change).toHaveBeenLastCalledWith(false);
    fireEvent(drawer, new Event("cancel", { cancelable: true }));
    expect(change).toHaveBeenCalledTimes(2);
  });
});

describe("Popover", () => {
  it("ties its trigger to a native popover and reports the state", () => {
    render(
      <Popover label="Columns">
        <p>Choose columns</p>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Columns" });
    const panel = document.getElementById(
      trigger.getAttribute("aria-controls")!,
    )!;
    expect(panel).toHaveAttribute("popover", "auto");
    expect(panel).toHaveAttribute("role", "dialog");
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    expect((trigger as HTMLButtonElement).popoverTargetElement).toBe(panel);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    act(() => {
      const open = new Event("toggle") as Event & { newState: string };
      Object.defineProperty(open, "newState", { value: "open" });
      panel.dispatchEvent(open);
    });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
