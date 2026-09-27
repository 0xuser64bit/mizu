import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Board,
  Outliner,
  QueryBuilder,
  describeQuery,
  matchesQuery,
  moveCard,
  type BoardCard,
  type OutlineItem,
  type QueryField,
  type QueryGroup,
} from "@/mizu";
import {
  build as buildOutline,
  flatten as flattenOutline,
  indent as indentRows,
  moveSibling as moveSiblingRows,
  outdent as outdentRows,
  visibleRows as visibleOutline,
} from "../../packages/mizu/src/signature/outline";

const COLUMNS = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "Doing", limit: 1 },
  { id: "done", title: "Done" },
];
const CARDS: BoardCard[] = [
  { id: "a", column: "todo", title: "Draft" },
  { id: "b", column: "todo", title: "Record" },
  { id: "c", column: "doing", title: "Review" },
];

describe("Board", () => {
  it("moves a card to a position in another column", () => {
    expect(
      moveCard(CARDS, "a", "doing", 0).map((c) => `${c.id}:${c.column}`),
    ).toEqual(["b:todo", "a:doing", "c:doing"]);
    expect(
      moveCard(CARDS, "a", "done", 0).map((c) => `${c.id}:${c.column}`),
    ).toEqual(["b:todo", "c:doing", "a:done"]);
    expect(moveCard(CARDS, "b", "todo", 0).map((c) => c.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("picks up, carries and drops a card from the keyboard, announcing each position", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Board
        label="Launch"
        columns={COLUMNS}
        cards={CARDS}
        onCardsChange={change}
      />,
    );
    screen.getByRole("button", { name: "Draft" }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Draft" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Draft" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard(" ");
    expect(change).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "b" }),
      expect.objectContaining({ id: "c" }),
      expect.objectContaining({ id: "a", column: "doing" }),
    ]);
  });

  it("puts a card back on Escape and shows an exceeded limit in words", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Board
        label="Launch"
        columns={COLUMNS}
        cards={CARDS}
        onCardsChange={change}
      />,
    );
    screen.getByRole("button", { name: "Record" }).focus();
    await user.keyboard(" {ArrowRight}");
    expect(screen.getByRole("note")).toHaveTextContent("Over the limit of 1");
    await user.keyboard("{Escape}");
    expect(change).not.toHaveBeenCalled();
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Doing, 1 card of a limit of 1" }),
    ).toBeInTheDocument();
  });

  it("opens cards with Enter and folds columns", async () => {
    const user = userEvent.setup(),
      open = vi.fn();
    render(
      <Board
        label="Launch"
        columns={COLUMNS}
        cards={CARDS}
        onCardsChange={() => {}}
        onCardOpen={open}
      />,
    );
    screen.getByRole("button", { name: "Review" }).focus();
    await user.keyboard("{Enter}");
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ id: "c" }));
    const fold = screen.getByRole("button", { name: "Collapse To do" });
    await user.click(fold);
    expect(
      screen.getByRole("button", { name: "Expand To do" }),
    ).toHaveAttribute("aria-expanded", "false");
    const todo = screen.getByRole("region", { name: /To do/ });
    expect(
      within(todo).queryByRole("button", { name: "Draft" }),
    ).not.toBeInTheDocument();
  });
});

const ROWS = (spec: string) =>
  spec.split(" ").map((token) => {
    const depth = token.length - token.replace(/^\.+/, "").length;
    return { id: token.slice(depth), text: token.slice(depth), depth };
  });
const SPEC = (rows: readonly { id: string; depth: number }[]) =>
  rows.map((r) => ".".repeat(r.depth) + r.id).join(" ");

describe("outline operations", () => {
  it("round-trips trees through rows and prunes empty children", () => {
    const tree: OutlineItem[] = [
      { id: "a", text: "A", children: [{ id: "b", text: "B" }] },
      { id: "c", text: "C" },
    ];
    expect(buildOutline(flattenOutline(tree))).toEqual(tree);
  });
  it("indents under the previous sibling and outdents after the parent's subtree", () => {
    expect(SPEC(indentRows(ROWS("a b .c d"), 1))).toBe("a .b ..c d");
    expect(indentRows(ROWS("a .b"), 1)).toEqual(ROWS("a .b"));
    expect(SPEC(outdentRows(ROWS("a .b ..c .d e"), 1))).toBe("a .d b .c e");
  });
  it("moves a branch past its neighbouring sibling", () => {
    expect(SPEC(moveSiblingRows(ROWS("a .b c .d e"), 2, -1))).toBe(
      "c .d a .b e",
    );
    expect(SPEC(moveSiblingRows(ROWS("a .b c"), 0, 1))).toBe("c a .b");
    expect(moveSiblingRows(ROWS("a .b"), 1, -1)).toEqual(ROWS("a .b"));
  });
  it("hides folded descendants and everything outside a zoomed item", () => {
    const rows = ROWS("a .b ..c d").map((r) =>
      r.id === "b" ? { ...r, collapsed: true } : r,
    );
    expect(visibleOutline(rows, null).map((s) => s.row.id)).toEqual([
      "a",
      "b",
      "d",
    ]);
    expect(visibleOutline(rows, "a").map((s) => [s.row.id, s.level])).toEqual([
      ["b", 0],
    ]);
  });
});

describe("Outliner", () => {
  const TREE: OutlineItem[] = [
    { id: "a", text: "Plan", children: [{ id: "b", text: "Owner" }] },
    { id: "c", text: "Announce" },
  ];

  it("splits a line with Enter and restructures with Tab", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    let n = 0;
    render(
      <Outliner
        label="Launch"
        defaultItems={TREE}
        onItemsChange={change}
        createId={() => `new${++n}`}
      />,
    );
    const announce = screen.getByRole("textbox", {
      name: "Level 1, 2 of 2",
    }) as HTMLTextAreaElement;
    await user.click(announce);
    announce.setSelectionRange(3, 3);
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith([
      TREE[0],
      { id: "c", text: "Ann" },
      { id: "new1", text: "ounce" },
    ]);
    expect(screen.getByDisplayValue("ounce")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(change).toHaveBeenLastCalledWith([
      TREE[0],
      {
        id: "c",
        text: "Ann",
        collapsed: false,
        children: [{ id: "new1", text: "ounce" }],
      },
    ]);
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(change.mock.lastCall![0]).toHaveLength(3);
  });

  it("marks done, folds and focuses into an item", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Outliner label="Launch" defaultItems={TREE} onItemsChange={change} />,
    );
    await user.click(screen.getByDisplayValue("Owner"));
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(change.mock.lastCall![0][0].children[0]).toEqual({
      id: "b",
      text: "Owner",
      done: true,
    });
    await user.click(screen.getByDisplayValue("Plan"));
    await user.keyboard("{Control>}{ArrowUp}{/Control}");
    expect(screen.queryByDisplayValue("Owner")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Focus on Plan" }));
    expect(
      screen.getByRole("navigation", { name: "Launch location" }),
    ).toHaveTextContent("Plan");
    expect(screen.getByRole("textbox", { name: "Focused item" })).toHaveValue(
      "Plan",
    );
  });

  it("merges into the line above with Backspace at the start", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <Outliner
        label="Launch"
        defaultItems={[
          { id: "a", text: "Draft" },
          { id: "b", text: " notes" },
        ]}
        onItemsChange={change}
      />,
    );
    const second = screen.getByDisplayValue("notes", {
      exact: false,
    }) as HTMLTextAreaElement;
    await user.click(second);
    second.setSelectionRange(0, 0);
    await user.keyboard("{Backspace}");
    expect(change).toHaveBeenLastCalledWith([{ id: "a", text: "Draft notes" }]);
  });
});

const QFIELDS: QueryField[] = [
  {
    id: "plan",
    label: "Plan",
    type: "select",
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
    ],
  },
  { id: "seats", label: "Seats", type: "number", unit: "seats" },
  { id: "joined", label: "Joined", type: "date" },
  { id: "name", label: "Name", type: "text" },
];

describe("query evaluation", () => {
  const now = Date.UTC(2026, 8, 28);
  const query: QueryGroup = {
    id: "root",
    combinator: "and",
    rules: [
      { id: "a", field: "plan", operator: "is", value: "pro" },
      {
        id: "g",
        combinator: "or",
        rules: [
          { id: "b", field: "seats", operator: "between", value: [10, 20] },
          { id: "c", field: "joined", operator: "last", value: 30 },
        ],
      },
      { id: "draft", field: "name", operator: "contains" },
    ],
  };
  it("evaluates nested any/all groups and ignores incomplete rules", () => {
    expect(
      matchesQuery(
        query,
        { plan: "pro", seats: 12, joined: "2026-01-01" },
        QFIELDS,
        now,
      ),
    ).toBe(true);
    expect(
      matchesQuery(
        query,
        { plan: "pro", seats: 40, joined: "2026-09-20" },
        QFIELDS,
        now,
      ),
    ).toBe(true);
    expect(
      matchesQuery(
        query,
        { plan: "pro", seats: 40, joined: "2026-01-01" },
        QFIELDS,
        now,
      ),
    ).toBe(false);
    expect(matchesQuery(query, { plan: "free", seats: 12 }, QFIELDS, now)).toBe(
      false,
    );
  });
  it("reads the query as a sentence", () => {
    expect(describeQuery(query, QFIELDS)).toBe(
      "Plan is Pro, and (Seats is between 10 seats and 20 seats, or Joined is in the last 30 days)",
    );
    expect(
      describeQuery({ id: "r", combinator: "and", rules: [] }, QFIELDS),
    ).toBe("Everything");
  });
});

describe("QueryBuilder", () => {
  it("adds, edits and removes conditions with specific labels and a live reading", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <QueryBuilder
        label="Audience"
        fields={QFIELDS}
        onValueChange={change}
        createId={() => "n1"}
      />,
    );
    expect(
      screen.getByText("No conditions — everything matches."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "+ Condition" }));
    expect(
      screen.getByRole("combobox", { name: "Field for condition 1" }),
    ).toHaveFocus();
    expect(
      screen.getByRole("group", { name: "Condition 1" }),
    ).toHaveAccessibleDescription("Needs a value — ignored until complete");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Value for condition 1" }),
      "pro",
    );
    expect(change).toHaveBeenLastCalledWith({
      id: "root",
      combinator: "and",
      rules: [{ id: "n1", field: "plan", operator: "is", value: "pro" }],
    });
    expect(screen.getByText("Plan is Pro")).toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Field for condition 1" }),
      "seats",
    );
    expect(change.mock.lastCall![0].rules[0]).toEqual({
      id: "n1",
      field: "seats",
      operator: "eq",
    });
    await user.click(
      screen.getByRole("button", { name: "Remove condition 1" }),
    );
    expect(change.mock.lastCall![0].rules).toEqual([]);
  });

  it("switches a group between all and any and toggles chip values", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <QueryBuilder
        label="Audience"
        fields={QFIELDS}
        defaultValue={{
          id: "root",
          combinator: "and",
          rules: [{ id: "a", field: "plan", operator: "any", value: [] }],
        }}
        onValueChange={change}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "Any" }));
    expect(change.mock.lastCall![0].combinator).toBe("or");
    await user.click(screen.getByRole("button", { name: "Free" }));
    expect(screen.getByRole("button", { name: "Free" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(change.mock.lastCall![0].rules[0].value).toEqual(["free"]);
  });
});
