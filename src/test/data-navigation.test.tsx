import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DataTable,
  DataInspector,
  TreeView,
  Pagination,
  CommandPalette,
  BarChart,
  Heatmap,
  ActionMenu,
} from "@/mizu";

describe("data and navigation contracts", () => {
  it("sorts numeric values and keeps null readings last in both directions", async () => {
    const user = userEvent.setup();
    const rows = [
      { id: "a", v: 10 },
      { id: "b", v: 2 },
      { id: "c", v: null },
    ];
    render(
      <DataTable
        label="Values"
        rows={rows}
        getRowId={(r) => r.id}
        columns={[
          {
            id: "v",
            header: "Value",
            render: (r) => r.v ?? "Unknown",
            sortValue: (r) => r.v,
          },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Value/ }));
    expect(screen.getAllByRole("cell").map((c) => c.textContent)).toEqual([
      "2",
      "10",
      "Unknown",
    ]);
    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await user.click(screen.getByRole("button", { name: /Value/ }));
    expect(screen.getAllByRole("cell").map((c) => c.textContent)).toEqual([
      "10",
      "2",
      "Unknown",
    ]);
  });
  it("inspects circular payloads without promising a JSON copy", () => {
    const data: Record<string, unknown> = { name: "Mizu" };
    data.self = data;
    render(<DataInspector value={data} />);
    expect(screen.getByText(/Circular/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Copy/ })).toBeNull();
  });
  it("selects a leaf through a native disclosure", async () => {
    const user = userEvent.setup(),
      select = vi.fn();
    render(
      <TreeView
        onSelect={select}
        nodes={[
          {
            id: "root",
            label: "Source",
            children: [{ id: "leaf", label: "Button.tsx" }],
          },
        ]}
      />,
    );
    await user.click(screen.getByText("Source"));
    await user.click(screen.getByRole("button", { name: "Button.tsx" }));
    expect(select).toHaveBeenCalledWith("leaf");
  });
  it("prevents pages beyond either boundary", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    const { rerender } = render(
      <Pagination page={1} totalPages={4} onPageChange={change} />,
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(change).toHaveBeenCalledWith(2);
    rerender(<Pagination page={99} totalPages={4} onPageChange={change} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
  it("filters and executes an enabled command using the keyboard", async () => {
    const user = userEvent.setup(),
      execute = vi.fn(),
      close = vi.fn();
    render(
      <CommandPalette
        open
        onOpenChange={close}
        commands={[
          { id: "no", label: "Delete", disabled: true, onSelect: execute },
          { id: "save", label: "Save changes", onSelect: execute },
        ]}
      />,
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "save");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.keyboard("{Enter}");
    expect(execute).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledWith(false);
  });
  it("exposes an empty command result", async () => {
    const user = userEvent.setup();
    render(<CommandPalette open onOpenChange={() => {}} commands={[]} />);
    await user.type(screen.getByRole("combobox"), "x");
    expect(screen.getByRole("status")).toHaveTextContent("No matching");
  });
  it("omits non-finite chart data", () => {
    render(
      <>
        <BarChart
          label="Bar"
          data={[
            { label: "Valid", value: 2 },
            { label: "Bad", value: NaN },
          ]}
        />
        <Heatmap data={[{ date: "today", value: Infinity }]} />
      </>,
    );
    expect(screen.queryByText("Bad")).toBeNull();
    expect(screen.getByText("Valid")).toBeTruthy();
  });
  it("moves between menu actions and restores the trigger on Escape", () => {
    const select = vi.fn();
    render(
      <ActionMenu
        items={[
          { id: "a", label: "Save", onSelect: select },
          { id: "b", label: "Locked", disabled: true, onSelect: select },
          { id: "c", label: "Archive", onSelect: select },
        ]}
      />,
    );
    const summary = screen.getByText("Actions");
    fireEvent.keyDown(summary, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Save" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(summary).toHaveFocus();
    expect(summary.parentElement).not.toHaveAttribute("open");
  });
});

it("renders SVG titles as one text node so server markup hydrates without split-node mismatches", async () => {
  const { renderToString } = await import("react-dom/server"),
    { Sparkline } = await import("@/mizu");
  const html = renderToString(<Sparkline label="Readings" values={[2, 3]} />);
  expect(html.match(/<title[^>]*>(.*?)<\/title>/)?.[1]).toBe("Readings: 2, 3");
});
