import { describe, it, expect, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  renderHook,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Combobox,
  MultiSelect,
  InlineEdit,
  RangeSelector,
  ReorderList,
  useHistory,
  ConfirmAction,
  ImageCompare,
} from "@/mizu";
describe("editing and direct manipulation", () => {
  it("filters choices and selects using Enter without changing on Escape", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Combobox
        label="Choice"
        value="a"
        onValueChange={change}
        options={[
          { value: "a", label: "Archivo" },
          { value: "b", label: "Instrument" },
        ]}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "inst");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenCalledWith("b");
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");
    expect(change).toHaveBeenCalledTimes(1);
  });
  it("keeps the active option in view while arrowing through a long list", async () => {
    const user = userEvent.setup(),
      scrolled: string[] = [];
    const scroll = vi
      .spyOn(Element.prototype, "scrollIntoView")
      .mockImplementation(function (this: Element) {
        scrolled.push(this.textContent ?? "");
      });
    render(
      <Combobox
        label="Typeface"
        value=""
        onValueChange={() => {}}
        options={["Archivo", "Instrument", "JetBrains", "Inter"].map((l) => ({
          value: l,
          label: l,
        }))}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(scrolled).toEqual(["Instrument", "JetBrains"]);
    scroll.mockRestore();
  });
  it("keeps selected items removable at multi-select capacity", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <MultiSelect
        label="Checks"
        value={["a"]}
        max={1}
        onValueChange={change}
        options={[
          { value: "a", label: "Types" },
          { value: "b", label: "Lint" },
        ]}
      />,
    );
    await user.click(screen.getAllByText("Checks")[0]);
    expect(screen.getByRole("checkbox", { name: "Lint" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "Types" }));
    expect(change).toHaveBeenCalledWith([]);
  });
  it("validates drafts and discards an edit without changing committed state", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <InlineEdit
        label="Name"
        value="Original"
        onValueChange={change}
        validate={(v) => (v ? undefined : "Required")}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Edit name/ }));
    await user.clear(screen.getByRole("textbox"));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    await user.type(screen.getByRole("textbox"), "New");
    await user.keyboard("{Escape}");
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Original/ })).toHaveFocus();
  });
  it("bounds a range so its handles do not cross", () => {
    const change = vi.fn();
    render(
      <RangeSelector label="Window" value={[20, 70]} onValueChange={change} />,
    );
    const [start, end] = screen.getAllByRole("slider");
    expect(start).toHaveAttribute("max", "70");
    expect(end).toHaveAttribute("min", "20");
    fireEvent.change(start, { target: { value: "40" } });
    expect(change).toHaveBeenCalledWith([40, 70]);
  });
  it("lays both bounded handles on one scale", () => {
    render(
      <RangeSelector
        label="Window"
        value={[30, 90]}
        min={0}
        max={120}
        onValueChange={() => {}}
      />,
    );
    const [start, end] = screen.getAllByRole("slider");
    const stretch = (input: HTMLElement) =>
      ["--mizu-range-min", "--mizu-range-max"].map((name) =>
        input.parentElement!.style.getPropertyValue(name),
      );
    expect(stretch(start)).toEqual(["0", "0.75"]);
    expect(stretch(end)).toEqual(["0.25", "1"]);
    const scale = screen.getByRole("group", { name: /Window/ }).style;
    expect(scale.getPropertyValue("--mizu-range-start")).toBe("0.25");
    expect(scale.getPropertyValue("--mizu-range-end")).toBe("0.75");
  });
  it("reorders with keyboard controls and rejects an invalid boundary move", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    const a = { id: "a", label: "Types" },
      b = { id: "b", label: "Lint" };
    render(<ReorderList items={[a, b]} onReorder={change} />);
    expect(
      screen.getByRole("button", { name: "Move Types up" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Move Types down" }));
    expect(change).toHaveBeenCalledWith([b, a]);
  });
  it("bounds undo history and clears the redo branch after a new edit", () => {
    const { result } = renderHook(() => useHistory("a", 2));
    act(() => {
      result.current.set("b");
      result.current.set("c");
      result.current.set("d");
    });
    act(() => result.current.undo());
    expect(result.current.value).toBe("c");
    act(() => result.current.undo());
    expect(result.current.value).toBe("b");
    expect(result.current.canUndo).toBe(false);
    act(() => result.current.set("e"));
    expect(result.current.canRedo).toBe(false);
    act(() => result.current.reset("z"));
    expect(result.current.value).toBe("z");
    expect(result.current.canUndo).toBe(false);
  });
  it("keeps failed confirmations open so the action can be retried", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmAction
        label="Archive"
        title="Archive draft?"
        action={async () => {
          throw Error("Offline");
        }}
      >
        Keep this draft recoverable.
      </ConfirmAction>,
    );
    await user.click(screen.getByRole("button", { name: /Archive$/ }));
    await user.click(screen.getByRole("button", { name: /Confirm/ }));
    expect(await screen.findByRole("status")).toHaveTextContent("failed");
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
  it("makes image reveal a native bounded slider and explains failed media", () => {
    const change = vi.fn();
    render(
      <ImageCompare
        label="Compare"
        before={{ src: "a.svg", alt: "First" }}
        after={{ src: "b.svg", alt: "Second" }}
        value={50}
        onValueChange={change}
      />,
    );
    fireEvent.change(screen.getByRole("slider"), { target: { value: "75" } });
    expect(change).toHaveBeenCalledWith(75);
    fireEvent.error(screen.getByRole("img", { name: "Second" }));
    expect(screen.getByText("Comparison image unavailable.")).toBeTruthy();
    expect(screen.getByRole("slider")).toBeDisabled();
  });
});
