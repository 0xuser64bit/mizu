import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DialogBody,
  DialogClose,
  DialogTitle,
  Drawer,
  OneTimeCode,
  Popover,
} from "@/mizu";

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

describe("OneTimeCode", () => {
  it("keeps digits, fills the cells and completes once the code is whole", async () => {
    const user = userEvent.setup(),
      complete = vi.fn();
    function Code() {
      const [value, setValue] = useState("");
      return (
        <OneTimeCode
          label="Sign-in code"
          length={4}
          value={value}
          onValueChange={setValue}
          onComplete={complete}
        />
      );
    }
    const { container } = render(<Code />);
    const input = screen.getByLabelText("Sign-in code");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    await user.type(input, "1a2-3");
    expect(input).toHaveValue("123");
    expect(complete).not.toHaveBeenCalled();
    await user.type(input, "45");
    expect(input).toHaveValue("1234");
    expect(complete).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledWith("1234");
    expect(
      [...container.querySelectorAll(".mizu-otp-cells span")].map(
        (s) => s.textContent,
      ),
    ).toEqual(["1", "2", "3", "4"]);
  });

  it("accepts a pasted code with separators and describes errors", async () => {
    const user = userEvent.setup(),
      complete = vi.fn();
    render(
      <OneTimeCode
        label="Code"
        onComplete={complete}
        error="That code has expired."
      />,
    );
    const input = screen.getByLabelText("Code");
    await user.click(input);
    await user.paste("482 913");
    expect(complete).toHaveBeenCalledWith("482913");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("That code has expired.");
  });
});
