import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateRangeField } from "@/mizu";

const week = { start: "2026-10-15", end: "2026-10-21" };
const month = { start: "2026-10-01", end: "2026-10-21" };

describe("DateRangeField", () => {
  it("groups labelled dates, links shared feedback and submits date-only strings", () => {
    const { container } = render(
      <form>
        <DateRangeField
          label="Reporting window"
          defaultValue={week}
          startName="from"
          endName="to"
          hint="Dates include both ends."
          error="Choose a shorter window."
        />
      </form>,
    );
    expect(
      screen.getByRole("group", { name: "Reporting window" }),
    ).toBeTruthy();
    for (const label of ["Start date", "End date"]) {
      expect(screen.getByLabelText(label)).toHaveAccessibleDescription(
        "Dates include both ends. Choose a shorter window.",
      );
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    }
    expect(
      Object.fromEntries(new FormData(container.querySelector("form")!)),
    ).toEqual({
      from: week.start,
      to: week.end,
    });
  });

  it("preserves an incomplete range while a person edits and bounds each endpoint", () => {
    const change = vi.fn();
    render(
      <DateRangeField
        label="Window"
        min="2026-01-01"
        max="2026-12-31"
        onValueChange={change}
      />,
    );
    const start = screen.getByLabelText("Start date");
    const end = screen.getByLabelText("End date");
    fireEvent.change(start, { target: { value: week.start } });
    expect(change).toHaveBeenLastCalledWith({ start: week.start, end: "" });
    expect(start).toHaveValue(week.start);
    expect(end).toHaveAttribute("min", week.start);
    expect(start).toHaveAttribute("min", "2026-01-01");
    fireEvent.change(end, { target: { value: week.end } });
    expect(change).toHaveBeenLastCalledWith(week);
    expect(start).toHaveAttribute("max", week.end);
    expect(end).toHaveAttribute("max", "2026-12-31");
  });

  it("reports a crossed range, prevents submission and clears the error after correction", () => {
    const { container } = render(
      <form>
        <DateRangeField label="Window" defaultValue={week} />
      </form>,
    );
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-10-23" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The end date must be on or after the start date.",
    );
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
    expect(screen.getByLabelText("Start date")).toHaveValue("2026-10-23");
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-10-24" },
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
  });

  it("applies valid presets, disables invalid presets and clears or resets without submitting", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <DateRangeField
          label="Window"
          defaultValue={week}
          onValueChange={change}
          min="2026-10-01"
          max="2026-10-31"
          presets={[
            { label: "Sample month", value: month },
            {
              label: "Outside bounds",
              value: { start: "2026-09-01", end: "2026-09-30" },
            },
            { label: "Reversed", value: { start: week.end, end: week.start } },
            { label: "Incomplete", value: { start: week.start, end: "" } },
          ]}
        />
      </form>,
    );
    for (const name of ["Outside bounds", "Reversed", "Incomplete"]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
      await user.click(screen.getByRole("button", { name }));
    }
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Sample month" }));
    expect(change).toHaveBeenLastCalledWith(month);
    expect(
      screen.getByRole("button", { name: "Sample month" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Clear dates" }));
    expect(change).toHaveBeenLastCalledWith({ start: "", end: "" });
    expect(screen.getByLabelText("Start date")).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Reset dates" }));
    expect(change).toHaveBeenLastCalledWith(week);
    expect(screen.getByLabelText("Start date")).toHaveValue(week.start);
    expect(screen.getByRole("button", { name: "Reset dates" })).toBeDisabled();
    expect(submit).not.toHaveBeenCalled();
  });

  it("leaves controlled values with the caller and accepts later updates", () => {
    const change = vi.fn();
    const { rerender } = render(
      <DateRangeField label="Window" value={week} onValueChange={change} />,
    );
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: month.start },
    });
    expect(change).toHaveBeenCalledWith(month);
    expect(screen.getByLabelText("Start date")).toHaveValue(week.start);
    rerender(
      <DateRangeField label="Window" value={month} onValueChange={change} />,
    );
    expect(screen.getByLabelText("Start date")).toHaveValue(month.start);
  });

  it("uses real calendar dates and handles leap days without a local timezone", () => {
    const { rerender, container } = render(
      <form>
        <DateRangeField
          label="Window"
          value={{ start: "2026-02-30", end: "2026-03-01" }}
        />
      </form>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid start date.",
    );
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
    rerender(
      <form>
        <DateRangeField
          label="Window"
          value={{ start: "2024-02-29", end: "2024-03-01" }}
        />
      </form>,
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
  });

  it("explains required dates after native validation and restores default values on form reset", async () => {
    const change = vi.fn();
    const { container } = render(
      <form>
        <DateRangeField
          label="Window"
          defaultValue={week}
          required
          onValueChange={change}
        />
      </form>,
    );
    const form = container.querySelector("form")!;
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "" },
    });
    fireEvent.invalid(screen.getByLabelText("Start date"));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a start date and an end date.",
    );
    await act(async () => form.reset());
    expect(screen.getByLabelText("Start date")).toHaveValue(week.start);
    expect(screen.getByLabelText("End date")).toHaveValue(week.end);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(change).toHaveBeenLastCalledWith(week);
  });

  it("honors cancelled resets", async () => {
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <DateRangeField label="Window" defaultValue={week} />
      </form>,
    );
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: month.start },
    });
    await act(async () => container.querySelector("form")!.reset());
    expect(screen.getByLabelText("Start date")).toHaveValue(month.start);
  });

  it.each(["disabled", "readOnly"] as const)(
    "prevents changes when %s",
    async (state) => {
      const change = vi.fn();
      const user = userEvent.setup();
      render(
        <DateRangeField
          label="Window"
          defaultValue={week}
          onValueChange={change}
          presets={[{ label: "Sample month", value: month }]}
          {...{ [state]: true }}
        />,
      );
      for (const name of ["Clear dates", "Reset dates", "Sample month"]) {
        expect(screen.getByRole("button", { name })).toBeDisabled();
        await user.click(screen.getByRole("button", { name }));
      }
      fireEvent.change(screen.getByLabelText("Start date"), {
        target: { value: month.start },
      });
      expect(change).not.toHaveBeenCalled();
      expect(screen.getByLabelText("Start date")).toHaveValue(week.start);
    },
  );
});
