import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ColumnBrowser,
  Folio,
  Gallery,
  Sidenote,
  SplitFlap,
  FLAP_CHARACTERS,
  flapPath,
  justifyRows,
  type BrowserItem,
  type GalleryItem,
} from "@/mizu";
import { mockLayout } from "./helpers";

const PHOTOS: GalleryItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `p${i}`,
  src: `/photo-${i}.jpg`,
  alt: `Photo ${i + 1}`,
  width: 100,
  height: 100,
  caption: `Caption ${i + 1}`,
}));

describe("justifyRows", () => {
  it("fills full rows exactly, near the target height, and caps the last", () => {
    const sizes = [
      { width: 3, height: 2 },
      { width: 2, height: 3 },
      { width: 16, height: 9 },
      { width: 1, height: 1 },
      { width: 4, height: 5 },
      { width: 3, height: 2 },
      { width: 21, height: 9 },
      { width: 1, height: 1 },
    ];
    const rows = justifyRows(sizes, 1000, 200, 10);
    expect(rows[0]!.start).toBe(0);
    expect(rows.at(-1)!.end).toBe(sizes.length);
    expect(rows.at(-1)!.full).toBe(false);
    rows.forEach((row) => {
      const widths = sizes
        .slice(row.start, row.end)
        .map((s) => (s.width / s.height) * row.height);
      const used = widths.reduce((a, b) => a + b, 0) + 10 * (widths.length - 1);
      if (row.full) expect(used).toBeCloseTo(1000, 6);
      else expect(used).toBeLessThan(1000);
      expect(row.height).toBeGreaterThanOrEqual(100);
      expect(row.height).toBeLessThanOrEqual(300);
    });
  });

  it("gives a panorama wider than the row a row of its own", () => {
    const rows = justifyRows(
      [
        { width: 1, height: 1 },
        { width: 12, height: 1 },
        { width: 1, height: 1 },
      ],
      600,
      200,
      0,
    );
    expect(rows.map((r) => [r.start, r.end, r.full])).toEqual([
      [0, 1, false],
      [1, 2, true],
      [2, 3, false],
    ]);
    expect(rows[0]!.height).toBe(300);
    expect(rows[1]!.height).toBeCloseTo(50);
  });
});

describe("Gallery", () => {
  let restore: () => void;
  beforeEach(() => {
    restore = mockLayout(800, 400);
  });
  afterEach(() => restore());

  it("moves between photos with arrow keys, by row as well as along it", async () => {
    const user = userEvent.setup();
    render(<Gallery label="Trip" items={PHOTOS} rowHeight={200} />);
    const list = screen.getByRole("list");
    expect(screen.getAllByRole("button")).toHaveLength(PHOTOS.length);
    // Square photos at 800px wide make rows of four.
    await waitFor(() =>
      expect(list.firstElementChild).toHaveStyle({ height: "195.5px" }),
    );
    screen.getByRole("button", { name: "Photo 2" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Photo 3" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "Photo 7" })).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByRole("button", { name: "Photo 3" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Photo 10" })).toHaveFocus();
  });

  it("opens a photo in a modal viewer, travels, and returns focus on close", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(<Gallery label="Trip" items={PHOTOS} onIndexChange={change} />);
    await user.click(screen.getByRole("button", { name: "Photo 2" }));
    expect(change).toHaveBeenLastCalledWith(1);
    const viewer = screen.getByRole("dialog", {
      name: "Trip, photo 2 of 10",
    });
    expect(screen.getByRole("img", { name: "Photo 2" })).toBeInTheDocument();
    expect(screen.getByText("Caption 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close viewer" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole("status")).toHaveTextContent("3 of 10: Photo 3");
    expect(
      screen.getByRole("button", { name: "Photo 3", current: true }),
    ).toBeInTheDocument();
    // The grid behind is inert while the viewer is modal; happy-dom does not model that.
    await user.click(within(viewer).getByRole("button", { name: "Photo 10" }));
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
    await user.keyboard("{Home}");
    expect(
      screen.getByRole("button", { name: "Previous photo" }),
    ).toBeDisabled();

    // happy-dom does not turn Escape into the native dialog's cancel event.
    fireEvent(viewer, new Event("cancel", { cancelable: true }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(change).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("button", { name: "Photo 1" })).toHaveFocus();
  });

  it("can be driven from outside", () => {
    const { rerender } = render(
      <Gallery label="Trip" items={PHOTOS} index={4} />,
    );
    expect(
      screen.getByRole("dialog", { name: "Trip, photo 5 of 10" }),
    ).toBeInTheDocument();
    rerender(<Gallery label="Trip" items={PHOTOS} index={null} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reports loading, empty and failed photos", async () => {
    const { rerender } = render(<Gallery label="Trip" items={[]} loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading photos");
    rerender(<Gallery label="Trip" items={[]} empty="Nothing here yet." />);
    expect(screen.getByRole("status")).toHaveTextContent("Nothing here yet.");
    rerender(
      <Gallery key="fresh" label="Trip" items={PHOTOS} defaultIndex={0} />,
    );
    fireEvent.error(screen.getByRole("img", { name: "Photo 1" }));
    expect(
      await screen.findByText("This photo could not be loaded."),
    ).toBeInTheDocument();
  });
});

function Article() {
  return (
    <Folio label="Essay">
      <h2 id="t-first">First</h2>
      <p>
        One line<Sidenote>A first aside.</Sidenote> and another.
      </p>
      <h3 id="t-second">Second</h3>
      <p>
        Two lines<Sidenote>A second aside.</Sidenote> at last.
      </p>
    </Folio>
  );
}

describe("Folio", () => {
  let restore: () => void;
  afterEach(() => restore());

  it("unfolds notes in place when there is no margin", async () => {
    restore = mockLayout(600, 400);
    const user = userEvent.setup();
    render(<Article />);
    const [first, second] = screen.getAllByRole("button", { name: "Note" });
    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.click(first!);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("note")[0]).toHaveTextContent("A first aside.");
    expect(first).toHaveAttribute(
      "aria-controls",
      screen.getAllByRole("note")[0]!.id,
    );
    await user.click(first!);
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps notes in the margin when wide, and points to them", async () => {
    restore = mockLayout(1200, 400);
    const user = userEvent.setup();
    render(<Article />);
    const [first] = screen.getAllByRole("button", { name: "Note" });
    await waitFor(() => expect(first).not.toHaveAttribute("aria-expanded"));
    await user.click(first!);
    expect(screen.getAllByRole("note")[0]).toHaveAttribute("data-flash");
  });

  it("builds contents from the headings and moves focus to a section", async () => {
    restore = mockLayout(1200, 400);
    const user = userEvent.setup();
    render(<Article />);
    const contents = await screen.findByRole("navigation", {
      name: "Contents: Essay",
    });
    expect(contents).toHaveTextContent("1 min");
    await user.click(screen.getByRole("link", { name: "Second" }));
    expect(screen.getByRole("heading", { name: "Second" })).toHaveFocus();
  });

  it("can leave the contents out", () => {
    restore = mockLayout(1200, 400);
    render(
      <Folio label="Plain" contents={false}>
        <h2 id="t-only">Only</h2>
      </Folio>,
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Plain" })).toBeInTheDocument();
  });
});

describe("SplitFlap", () => {
  it("falls forward through the drum, wrapping, and skips ahead on long journeys", () => {
    expect(flapPath("A", "D", FLAP_CHARACTERS)).toEqual(["B", "C", "D"]);
    expect(flapPath("?", "B", FLAP_CHARACTERS)).toEqual([" ", "A", "B"]);
    const long = flapPath("A", "Z", FLAP_CHARACTERS);
    expect(long).toHaveLength(12);
    expect(long.at(-1)).toBe("Z");
    expect(flapPath("A", "€", FLAP_CHARACTERS)).toEqual(["€"]);
    expect(flapPath("A", "A", FLAP_CHARACTERS)).toEqual([]);
  });

  it("reads as text, pads to its cells, and settles on new values", () => {
    const settle = vi.fn();
    const { container, rerender } = render(
      <SplitFlap
        value="Gate 4"
        length={8}
        label="Boarding"
        live
        onSettle={settle}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Boarding: Gate 4");
    const cells = container.querySelectorAll(".mizu-flap-cell");
    expect(cells).toHaveLength(8);
    expect(cells[0]).toHaveTextContent("GGGG");
    rerender(
      <SplitFlap
        value="Gate 12"
        length={8}
        label="Boarding"
        live
        onSettle={settle}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Boarding: Gate 12");
    expect(cells[6]).toHaveTextContent("2222");
    expect(settle).toHaveBeenLastCalledWith("Gate 12");
  });

  it("right-aligns and trims to its length", () => {
    const { container } = render(
      <SplitFlap value="12345" length={3} align="right" />,
    );
    const glyphs = [...container.querySelectorAll(".mizu-flap-cell")].map(
      (c) => c.textContent![0],
    );
    expect(glyphs).toEqual(["1", "2", "3"]);
    const { container: padded } = render(
      <SplitFlap value="7" length={3} align="right" />,
    );
    expect(padded.querySelectorAll(".mizu-flap-cell")[2]).toHaveTextContent(
      "7777",
    );
  });
});

const TREE: BrowserItem[] = [
  {
    id: "fruit",
    label: "Fruit",
    children: [
      { id: "apple", label: "Apple", meta: "red" },
      { id: "banana", label: "Banana" },
      { id: "blueberry", label: "Blueberry" },
      { id: "cherry", label: "Cherry", disabled: true },
    ],
  },
  { id: "veg", label: "Vegetables", hasChildren: true },
  { id: "nuts", label: "Nuts", children: [] },
];

describe("ColumnBrowser", () => {
  let restore: () => void;
  afterEach(() => restore());

  it("walks columns with the keyboard and opens leaves", async () => {
    restore = mockLayout(900, 400);
    const user = userEvent.setup(),
      change = vi.fn(),
      open = vi.fn();
    render(
      <ColumnBrowser
        label="Pantry"
        items={TREE}
        onPathChange={change}
        onOpen={open}
        renderPreview={(item, trail) => (
          <p>
            Preview of {item.label} in {trail[0]!.label}
          </p>
        )}
      />,
    );
    const top = screen.getByRole("listbox", { name: "Pantry" });
    await user.click(within(top).getByRole("option", { name: /Fruit/ }));
    expect(change).toHaveBeenLastCalledWith(["fruit"]);
    expect(screen.getByRole("listbox", { name: "Fruit" })).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith(["fruit", "apple"]);
    expect(screen.getByRole("option", { name: /Apple/ })).toHaveFocus();
    expect(screen.getByText("Preview of Apple in Fruit")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Banana" })).toHaveFocus();
    await user.keyboard("bl");
    expect(screen.getByRole("option", { name: "Blueberry" })).toHaveFocus();
    // Disabled items are skipped.
    await user.keyboard("{End}");
    expect(screen.getByRole("option", { name: "Blueberry" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(open).toHaveBeenCalledWith(
      expect.objectContaining({ id: "blueberry" }),
    );

    await user.keyboard("{ArrowLeft}");
    expect(change).toHaveBeenLastCalledWith(["fruit"]);
    expect(within(top).getByRole("option", { name: /Fruit/ })).toHaveFocus();
    expect(
      screen.getByRole("navigation", { name: "Location" }),
    ).toHaveTextContent("PantryFruit");
  });

  it("loads on demand, reports failures and retries", async () => {
    restore = mockLayout(900, 400);
    const user = userEvent.setup();
    let fail: (e: Error) => void = () => {};
    const load = vi
      .fn<(item: BrowserItem) => Promise<readonly BrowserItem[]>>()
      .mockReturnValueOnce(new Promise((_, reject) => (fail = reject)))
      .mockResolvedValueOnce([{ id: "leek", label: "Leek" }]);
    render(<ColumnBrowser label="Pantry" items={TREE} loadChildren={load} />);
    await user.click(screen.getByRole("option", { name: /Vegetables/ }));
    expect(screen.getByRole("listbox", { name: "Vegetables" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    fail(new Error("Shelf unreachable."));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Shelf unreachable.",
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByRole("option", { name: "Leek" }),
    ).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole("option", { name: /Nuts/ }));
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
  });

  it("pushes and pops one pane at a time when narrow", async () => {
    restore = mockLayout(400, 400);
    const user = userEvent.setup();
    const { container } = render(<ColumnBrowser label="Pantry" items={TREE} />);
    const current = () =>
      container
        .querySelector("[data-pane][data-current]")!
        .getAttribute("aria-label");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Back/ })).toBeDisabled(),
    );
    await user.click(screen.getByRole("option", { name: /Fruit/ }));
    expect(current()).toBe("Fruit");
    await user.click(screen.getByRole("button", { name: "Back to Pantry" }));
    expect(current()).toBe("Pantry");
  });
});
