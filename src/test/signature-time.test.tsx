import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Chronicle,
  TrendChart,
  Waveform,
  type ChronicleEvent,
  type TrendSeries,
} from "@/mizu";
import {
  formatClock,
  formatDuration,
  numberTicks,
  timeTicks,
} from "../../packages/mizu/src/signature/time";
import { mockLayout } from "./helpers";

const at = (h: number, m: number) => Date.UTC(2026, 8, 27, h, m);

describe("time scales", () => {
  it("aligns hour-scale majors to round UTC boundaries and labels midnight with the day", () => {
    const { ticks, context } = timeTicks(at(13, 50), at(15, 10), 900, {
      utc: true,
    });
    const majors = ticks.filter((t) => t.major);
    expect(majors.length).toBeGreaterThan(3);
    for (const t of majors) expect(t.t % (5 * 6e4)).toBe(0);
    expect(majors[0]!.label).toMatch(/^\d\d:\d\d$/);
    expect(context).toBe("27 Sept 2026");
    const night = timeTicks(
      Date.UTC(2026, 8, 27, 22),
      Date.UTC(2026, 8, 28, 2),
      600,
      { utc: true },
    );
    expect(night.ticks.find((t) => t.t === Date.UTC(2026, 8, 28))?.label).toBe(
      "Mon 28",
    );
  });
  it("keeps multi-week ticks on the same Mondays however far the view pans", () => {
    const day = 864e5;
    const first = timeTicks(Date.UTC(2026, 7, 1), Date.UTC(2026, 8, 15), 300, {
      utc: true,
    });
    const panned = timeTicks(Date.UTC(2026, 7, 4), Date.UTC(2026, 8, 18), 300, {
      utc: true,
    });
    const mondays = (ticks: typeof first.ticks) =>
      ticks.filter((t) => t.major).map((t) => t.t);
    for (const t of mondays(first.ticks))
      expect(new Date(t).getUTCDay()).toBe(1);
    const shared = mondays(panned.ticks).filter(
      (t) => t < Date.UTC(2026, 8, 15),
    );
    for (const t of shared) expect(mondays(first.ticks)).toContain(t);
    expect(mondays(first.ticks)[1]! - mondays(first.ticks)[0]!).toBe(14 * day);
  });
  it("formats durations, media clocks and round numeric ticks", () => {
    expect(formatDuration(450)).toBe("450ms");
    expect(formatDuration(4200)).toBe("4.2s");
    expect(formatDuration(29 * 6e4)).toBe("29m 00s");
    expect(formatDuration(2 * 36e5 + 5 * 6e4)).toBe("2h 05m");
    expect(formatClock(75)).toBe("1:15");
    expect(formatClock(3725)).toBe("1:02:05");
    expect(numberTicks(0, 97, 5)).toEqual([0, 20, 40, 60, 80, 100]);
    const flat = numberTicks(3, 3);
    expect(flat[0]).toBeLessThan(3);
    expect(flat[flat.length - 1]).toBeGreaterThan(3);
  });
});

const EVENTS: ChronicleEvent[] = [
  {
    id: "deploy",
    lane: "deploys",
    start: at(14, 2),
    label: "Deploy v2.41",
    detail: "Canary promoted.",
  },
  {
    id: "rollback",
    lane: "deploys",
    start: at(14, 24),
    label: "Rollback",
    tone: "success",
  },
  {
    id: "latency",
    lane: "api",
    start: at(14, 6),
    end: at(14, 31),
    label: "p95 above 2s",
    tone: "danger",
  },
];
const LANES = [
  { id: "deploys", label: "Deploys" },
  { id: "api", label: "API" },
];

describe("Chronicle", () => {
  let restore: () => void;
  beforeEach(() => {
    restore = mockLayout(800, 300);
  });
  afterEach(() => restore());

  it("groups events by lane and names each with its time and duration", async () => {
    render(<Chronicle label="Incident" utc lanes={LANES} events={EVENTS} />);
    const deploys = await screen.findByRole("group", { name: "Deploys" });
    expect(within(deploys).getAllByRole("option")).toHaveLength(2);
    expect(
      screen.getByRole("option", {
        name: "p95 above 2s, 14:06 to 14:31, 25m 00s",
      }),
    ).toBeInTheDocument();
  });

  it("selects with pointer and keyboard, opens details and clears with Escape", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Chronicle
        label="Incident"
        utc
        lanes={LANES}
        events={EVENTS}
        onSelectedChange={change}
      />,
    );
    await user.click(
      await screen.findByRole("option", { name: /Deploy v2.41/ }),
    );
    expect(change).toHaveBeenLastCalledWith("deploy");
    expect(
      screen.getByRole("region", { name: "Deploy v2.41 details" }),
    ).toHaveTextContent("Canary promoted.");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("option", { name: /Rollback/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /p95 above 2s/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith("latency");
    await user.keyboard("{Escape}");
    expect(change).toHaveBeenLastCalledWith(null);
    expect(
      screen.queryByRole("region", { name: /details/ }),
    ).not.toBeInTheDocument();
  });

  it("zooms, pans and fits from buttons and keys", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Chronicle label="Incident" events={EVENTS} onRangeChange={change} />,
    );
    await screen.findAllByRole("option");
    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    const [s0, e0] = change.mock.lastCall![0];
    const [f0, f1] = [
      at(14, 2) - 29 * 6e4 * 0.05,
      at(14, 31) + 29 * 6e4 * 0.12,
    ];
    expect(e0 - s0).toBeCloseTo((f1 - f0) * 0.6, -2);
    fireEvent.keyDown(screen.getByLabelText("Incident viewport"), {
      key: "ArrowRight",
    });
    expect(change.mock.lastCall![0][0]).toBeGreaterThan(s0);
    fireEvent.keyDown(screen.getByLabelText("Incident viewport"), { key: "0" });
    expect(change.mock.lastCall![0][0]).toBeCloseTo(f0, -2);
  });

  it("moves the playhead slider by keyboard and reports the time", async () => {
    const change = vi.fn();
    render(
      <Chronicle
        label="Incident"
        utc
        events={EVENTS}
        defaultCursor={at(14, 10)}
        onCursorChange={change}
      />,
    );
    const slider = await screen.findByRole("slider", { name: "Playhead" });
    expect(slider).toHaveAttribute("aria-valuetext", "14:10");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(change.mock.lastCall![0]).toBeGreaterThan(at(14, 10));
  });

  it("explains empty and loading periods", async () => {
    const { rerender } = render(
      <Chronicle label="Quiet" events={[]} empty="Nothing happened." />,
    );
    expect(await screen.findByText("Nothing happened.")).toBeInTheDocument();
    rerender(<Chronicle label="Quiet" events={[]} loading />);
    expect(
      screen.getByRole("status", { name: "Loading events" }),
    ).toBeInTheDocument();
    await act(async () => {});
  });
});

const minute = (m: number) => at(14, m);
const SERIES: TrendSeries[] = [
  {
    id: "p95",
    label: "p95",
    data: [0, 1, 2, 3, 4].map((m) => ({
      x: minute(m),
      y: [300, 320, 900, 1200, 400][m]!,
    })),
  },
  {
    id: "p50",
    label: "p50",
    data: [0, 1, 2, 3, 4].map((m) => ({
      x: minute(m),
      y: m === 2 ? null : 100 + m * 10,
    })),
  },
];

describe("TrendChart", () => {
  let restore: () => void;
  beforeEach(() => {
    restore = mockLayout(800, 300);
  });
  afterEach(() => restore());

  it("reads the latest values in the legend and keeps one series visible", async () => {
    const user = userEvent.setup();
    render(
      <TrendChart
        label="Latency"
        utc
        series={SERIES}
        format={(v) => `${v}ms`}
      />,
    );
    const p95 = await screen.findByRole("button", { name: /p95/ });
    const p50 = screen.getByRole("button", { name: /p50/ });
    expect(p95).toHaveTextContent("400ms");
    expect(p50).toHaveTextContent("140ms");
    await user.click(p50);
    expect(p50).toHaveAttribute("aria-pressed", "false");
    expect(p95).toBeDisabled();
  });

  it("steps through readings from the keyboard and announces every series", async () => {
    const cursor = vi.fn();
    render(
      <TrendChart
        label="Latency"
        utc
        series={SERIES}
        format={(v) => `${v}ms`}
        onCursorChange={cursor}
      />,
    );
    const plot = await screen.findByRole("group", { name: /Latency\./ });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    expect(cursor).toHaveBeenLastCalledWith(minute(2));
    await act(
      () => new Promise((r) => requestAnimationFrame(() => r(undefined))),
    );
    expect(
      screen.getByText("14:02 — p95 900ms, p50 no reading"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /p50/ })).toHaveTextContent("—");
  });

  it("measures a period with Shift and zooms to it with Enter", async () => {
    const domain = vi.fn();
    render(
      <TrendChart
        label="Latency"
        utc
        series={SERIES}
        format={(v) => `${v}ms`}
        onDomainChange={domain}
      />,
    );
    const plot = await screen.findByRole("group", { name: /Latency\./ });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    fireEvent.keyDown(plot, { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(plot, { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(plot, { key: "ArrowRight", shiftKey: true });
    expect(screen.getByText("Measured")).toBeInTheDocument();
    const p95 = screen.getByRole("button", { name: /p95/ });
    expect(p95).toHaveTextContent("+900ms · +300.0%");
    expect(p95).toHaveTextContent("Peak 1200ms");
    fireEvent.keyDown(plot, { key: "Enter" });
    expect(domain).toHaveBeenLastCalledWith([minute(0), minute(3)]);
  });

  it("offers the visible readings as a table", async () => {
    const user = userEvent.setup();
    render(
      <TrendChart
        label="Latency"
        utc
        series={SERIES}
        format={(v) => `${v}ms`}
      />,
    );
    await user.click(
      await screen.findByRole("button", { name: "View as table" }),
    );
    const table = screen.getByRole("region", { name: "Latency readings" });
    expect(within(table).getAllByRole("row")).toHaveLength(6);
    expect(
      within(table).getByRole("rowheader", { name: "14:02" }).parentElement,
    ).toHaveTextContent("—");
  });

  it("explains loading and empty charts", async () => {
    const { rerender } = render(
      <TrendChart label="Depth" series={[]} loading />,
    );
    expect(
      screen.getByRole("status", { name: "Loading readings" }),
    ).toBeInTheDocument();
    rerender(
      <TrendChart
        label="Depth"
        series={[{ id: "d", label: "Depth", data: [] }]}
        empty="Quiet."
      />,
    );
    expect(await screen.findByText("Quiet.")).toBeInTheDocument();
  });
});

describe("Waveform", () => {
  let restore: () => void;
  beforeEach(() => {
    restore = mockLayout(400, 72);
  });
  afterEach(() => restore());
  const markers = [
    { id: "a", time: 0, label: "Opening" },
    { id: "b", time: 90, label: "Interview" },
    { id: "c", time: 300, label: "Credits" },
  ];

  it("draws supplied peaks and seeks by slider keys", async () => {
    const time = vi.fn();
    const { container } = render(
      <Waveform
        src="/episode.mp3"
        label="Episode"
        duration={600}
        peaks={[0.2, 0.9, 0.4, 1]}
        onTimeUpdate={time}
      />,
    );
    const slider = screen.getByRole("slider", { name: "Seek Episode" });
    expect(slider).toHaveAttribute("aria-valuetext", "0:00 of 10:00");
    await act(async () => {});
    expect(
      container.querySelector(".mizu-waveform-bars")?.getAttribute("d"),
    ).toMatch(/^M0 /);
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuetext", "0:05 of 10:00");
    fireEvent.keyDown(slider, { key: "ArrowRight", shiftKey: true });
    expect(time).toHaveBeenLastCalledWith(35);
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider).toHaveAttribute("aria-valuenow", "600");
  });

  it("lists chapters with durations, jumps between them and marks the current one", async () => {
    const user = userEvent.setup();
    render(
      <Waveform
        src="/episode.mp3"
        label="Episode"
        duration={600}
        peaks={[0.5]}
        markers={markers}
      />,
    );
    const list = screen.getByRole("list", { name: "Episode chapters" });
    expect(
      within(list).getByRole("button", { name: /Interview/ }),
    ).toHaveTextContent("3:30");
    await user.click(within(list).getByRole("button", { name: /Interview/ }));
    expect(
      within(list).getByRole("button", { name: /Interview/ }),
    ).toHaveAttribute("aria-current", "true");
    fireEvent.keyDown(screen.getByRole("slider"), { key: "]" });
    expect(
      within(list).getByRole("button", { name: /Credits/ }),
    ).toHaveAttribute("aria-current", "true");
    fireEvent.keyDown(screen.getByRole("slider"), { key: "[" });
    expect(
      within(list).getByRole("button", { name: /Interview/ }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("cycles playback speed and explains a source that fails", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("offline"));
    const user = userEvent.setup();
    const { container } = render(
      <Waveform
        src="/missing.mp3"
        label="Missing"
        duration={60}
        rates={[1, 1.5]}
      />,
    );
    await act(async () => {});
    expect(screen.getByRole("slider")).toHaveAttribute("data-state", "flat");
    await user.click(screen.getByRole("button", { name: /Playback speed 1×/ }));
    expect(
      screen.getByRole("button", { name: /Playback speed 1.5×/ }),
    ).toBeInTheDocument();
    fireEvent.error(container.querySelector("audio")!);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This audio could not be loaded.",
    );
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
    fetch.mockRestore();
  });
});
