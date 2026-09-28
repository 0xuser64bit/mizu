import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogStream, type LogLine } from "@/mizu";
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
