import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Board, moveCard, type BoardCard } from "@/mizu";

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
