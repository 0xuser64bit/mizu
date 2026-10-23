import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DialogBody, DialogClose, DialogTitle, Drawer } from "@/mizu";

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
