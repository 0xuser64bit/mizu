import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tour, type TourStep } from "@/mizu";
import { mockLayout } from "./helpers";

const STEPS: TourStep[] = [
  { target: "#one", title: "First thing", body: "Where it starts." },
  { target: "#two", title: "Second thing", body: "Where it continues." },
  { target: "#nowhere", title: "Hidden thing", body: "Not on this page." },
];

function Harness({ onFinish }: { onFinish?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button id="one" type="button" onClick={() => setOpen(true)}>
        Start
      </button>
      <p id="two">Target two</p>
      <Tour
        steps={STEPS}
        open={open}
        onOpenChange={setOpen}
        onFinish={onFinish}
        label="Welcome"
      />
    </>
  );
}

describe("Tour", () => {
  let restore: () => void;
  beforeEach(() => {
    restore = mockLayout(200, 40);
  });
  afterEach(() => restore());
  const closed = () =>
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();

  it("steps through as a modal dialog, announcing each step", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(
      screen.getByRole("dialog", { name: "First thing" }),
    ).toHaveAccessibleDescription("Where it starts.");
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("dialog", { name: "Second thing" }),
    ).toBeInTheDocument();
    await act(
      () => new Promise((r) => requestAnimationFrame(() => r(undefined))),
    );
    expect(screen.getByText("Step 2 of 3: Second thing")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByRole("dialog", { name: "First thing" }),
    ).toBeInTheDocument();
  });

  it("explains a missing element and finishes on the last step", async () => {
    const user = userEvent.setup(),
      finish = vi.fn();
    render(<Harness onFinish={finish} />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByText(/isn’t showing right now/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Finish" }));
    expect(finish).toHaveBeenCalledTimes(1);
    closed();
    expect(screen.getByRole("button", { name: "Start" })).toHaveFocus();
  });

  it("leaves on Skip or Escape without finishing", async () => {
    const user = userEvent.setup(),
      finish = vi.fn();
    render(<Harness onFinish={finish} />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.click(screen.getByRole("button", { name: "Skip tour" }));
    closed();
    await user.click(screen.getByRole("button", { name: "Start" }));
    // happy-dom does not turn Escape into the native dialog's cancel event.
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );
    closed();
    expect(finish).not.toHaveBeenCalled();
  });
});
