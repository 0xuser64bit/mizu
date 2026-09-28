import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Fader, Knob, LogStream, XYPad, type LogLine } from "@/mizu";
import { mockLayout } from "./helpers";

const T = Date.UTC(2026, 0, 12, 9, 30);
const make = (n: number, from = 0): LogLine[] =>
  Array.from({ length: n }, (_, i) => {
    const id = from + i;
    return {
      id,
      time: T + id * 1000,
      level: id % 10 === 9 ? "error" : id % 5 === 4 ? "warn" : "info",
      source: id % 2 ? "api" : "worker",
      message: `event ${id}${id % 7 === 0 ? " berth sync" : ""}`,
      fields: { n: id },
    };
  });

describe("LogStream", () => {
  let restore: () => void;
  beforeEach(() => {
    // Every element measures 240px tall: ten 24px rows in view.
    restore = mockLayout(800, 240);
  });
  afterEach(() => restore());

  it("renders only the lines in view", async () => {
    render(<LogStream label="api" lines={make(500)} utc />);
    const list = screen.getByRole("listbox", { name: "api: 500 lines" });
    const rows = await within(list).findAllByRole("option");
    expect(rows.length).toBeLessThan(40);
    expect(rows[0]).toHaveAttribute("aria-setsize", "500");
    expect(rows[0]).toHaveTextContent("09:30:00.000");
  });

  it("filters by level, searches and steps through matches", async () => {
    const user = userEvent.setup();
    render(<LogStream label="api" lines={make(60)} utc />);
    await user.click(screen.getByRole("button", { name: /info/ }));
    await user.click(screen.getByRole("button", { name: /warn/ }));
    expect(screen.getByRole("button", { name: /error/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("listbox", { name: "api: 6 lines" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /info/ }));
    await user.type(
      screen.getByRole("searchbox", { name: "Search lines" }),
      "berth",
    );
    expect(screen.getByText("1 / 8")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.getByText(/line 1 of/)).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.getByText("2 / 8")).toBeInTheDocument();
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(screen.getByText("1 / 8")).toBeInTheDocument();
  });

  it("selects with the keyboard and shows the whole line", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <LogStream label="api" lines={make(30)} utc onSelectedChange={change} />,
    );
    const list = screen.getByRole("listbox");
    await within(list).findAllByRole("option");
    list.focus();
    await user.keyboard("{Home}");
    expect(change).toHaveBeenLastCalledWith(0);
    await user.keyboard("{ArrowDown}");
    expect(change).toHaveBeenLastCalledWith(1);
    expect(list).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { selected: true }).id,
    );
    expect(screen.getByText("line 2 of 30")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(change).toHaveBeenLastCalledWith(null);
  });

  it("stops following when you scroll away and counts what arrives", async () => {
    function Feed() {
      const [lines, setLines] = useState(make(50));
      return (
        <>
          <button
            type="button"
            onClick={() =>
              setLines((l) => [...l, ...make(3, l.length)].slice(-50))
            }
          >
            More
          </button>
          <LogStream label="api" lines={lines} />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Feed />);
    const list = screen.getByRole("listbox");
    await within(list).findAllByRole("option");
    expect(screen.getByRole("button", { name: "Follow" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // Scrolling away from the bottom pauses; trimmed arrivals still count.
    Object.defineProperty(list, "scrollHeight", {
      value: 1200,
      configurable: true,
    });
    act(() => {
      list.scrollTop = 100;
      fireEvent.scroll(list);
    });
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(
      screen.getByRole("button", { name: /3 new lines/ }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /3 new lines/ }));
    expect(screen.getByRole("button", { name: "Follow" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows loading and empty states", () => {
    const { rerender } = render(<LogStream label="api" lines={[]} loading />);
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
    rerender(<LogStream label="api" lines={[]} empty="Quiet so far." />);
    expect(screen.getByText("Quiet so far.")).toBeInTheDocument();
  });
});

describe("Knob and Fader", () => {
  it("steps, jumps a tenth with Shift, reaches the ends and returns home", async () => {
    const user = userEvent.setup(),
      commit = vi.fn();
    render(
      <Knob
        label="Mix"
        defaultValue={40}
        format={(v) => `${v}%`}
        onValueCommit={commit}
      />,
    );
    const knob = screen.getByRole("slider", { name: "Mix" });
    expect(knob).toHaveAttribute("aria-valuetext", "40%");
    knob.focus();
    await user.keyboard("{ArrowUp}");
    expect(knob).toHaveAttribute("aria-valuetext", "41%");
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(knob).toHaveAttribute("aria-valuetext", "51%");
    await user.keyboard("{End}");
    expect(knob).toHaveAttribute("aria-valuetext", "100%");
    await user.keyboard("{Backspace}");
    expect(knob).toHaveAttribute("aria-valuetext", "40%");
    expect(commit.mock.calls.map((c) => c[0])).toEqual([41, 51, 100, 40]);
  });

  it("steps a log taper by travel, not by value", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Knob
        label="Cutoff"
        min={20}
        max={20000}
        taper="log"
        defaultValue={200}
        onValueChange={change}
      />,
    );
    screen.getByRole("slider", { name: "Cutoff" }).focus();
    await user.keyboard("{PageUp}");
    // A tenth of three decades is 10^0.3: about double.
    expect(change).toHaveBeenLastCalledWith(399);
  });

  it("submits with a form and meters a level", () => {
    const { container } = render(
      <form>
        <Fader
          label="Master"
          name="master"
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.8}
          level={0.5}
          marks={[1, 0]}
        />
      </form>,
    );
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("master")).toBe("0.8");
    expect(container.querySelector(".mizu-fader-meter")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Master" })).toHaveValue("0.8");
  });
});

describe("XYPad", () => {
  it("moves both axes from either slider and resets", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    const { container } = render(
      <form>
        <XYPad
          label="Balance"
          name="balance"
          x={{ label: "Temp", min: -100, max: 100 }}
          y={{ label: "Tint", min: -100, max: 100 }}
          defaultValue={{ x: 0, y: 0 }}
          onValueChange={change}
        />
      </form>,
    );
    const x = screen.getByRole("slider", { name: "Balance: Temp" });
    screen.getByRole("slider", { name: "Balance: Tint" });
    x.focus();
    await user.keyboard("{ArrowRight}{ArrowUp}{ArrowUp}");
    expect(change).toHaveBeenLastCalledWith({ x: 1, y: 2 });
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(change).toHaveBeenLastCalledWith({ x: -19, y: 2 });
    const data = new FormData(container.querySelector("form")!);
    expect([data.get("balance-x"), data.get("balance-y")]).toEqual([
      "-19",
      "2",
    ]);
    await user.keyboard("{Delete}");
    expect(change).toHaveBeenLastCalledWith({ x: 0, y: 0 });
  });
});
