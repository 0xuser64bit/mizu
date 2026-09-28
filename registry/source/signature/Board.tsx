"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { LayoutGroup, motion, useMotionValue } from "motion/react";
import { useReducedMotion } from "../motion/Preferences";
import { EASE_EXPO } from "../motion/easings";
import { Avatar } from "../content/Media";
import {
  useAnnouncer,
  useControllable,
  useIsoLayoutEffect,
  useLatest,
  type SignatureTone,
} from "./internal";

export type BoardColumn = { id: string; title: string; limit?: number };
export type BoardCard = {
  id: string;
  column: string;
  title: string;
  meta?: string;
  tags?: readonly string[];
  assignee?: string;
  tone?: SignatureTone;
};

type Drag = {
  id: string;
  column: string;
  index: number;
  mode: "pointer" | "keyboard";
  width: number;
  height: number;
  offset: { x: number; y: number };
};

/** Returns cards with `id` moved into `column` before the card now at `index`. */
export function moveCard(
  cards: readonly BoardCard[],
  id: string,
  column: string,
  index: number,
) {
  const card = cards.find((c) => c.id === id);
  if (!card) return [...cards];
  const rest = cards.filter((c) => c.id !== id);
  const inColumn = rest.filter((c) => c.column === column);
  const anchor = inColumn[index];
  const at = anchor
    ? rest.indexOf(anchor)
    : inColumn.length
      ? rest.indexOf(inColumn[inColumn.length - 1]!) + 1
      : rest.length;
  return [...rest.slice(0, at), { ...card, column }, ...rest.slice(at)];
}

function DefaultCard({ card }: { card: BoardCard }) {
  return (
    <>
      <p className="mizu-board-title">{card.title}</p>
      {(card.meta || card.tags?.length || card.assignee) && (
        <div className="mizu-board-foot">
          {card.meta && <span className="mizu-board-meta">{card.meta}</span>}
          {card.tags?.map((tag) => (
            <span key={tag} className="mizu-board-tag">
              {tag}
            </span>
          ))}
          {card.assignee && (
            <Avatar
              name={card.assignee}
              size={24}
              className="mizu-board-avatar"
            />
          )}
        </div>
      )}
    </>
  );
}

/**
 * A kanban board with lift-and-carry dragging, cards that part to make room
 * and fly into place, advisory limits, collapsible columns and a complete
 * keyboard path for picking up, moving and dropping.
 */
export function Board({
  label,
  columns,
  cards: cardsProp,
  defaultCards = [],
  onCardsChange,
  readOnly = false,
  renderCard,
  onCardOpen,
  onAddCard,
  className = "",
  style,
}: {
  label: string;
  columns: readonly BoardColumn[];
  /** Order within a column follows array order. */
  cards?: readonly BoardCard[];
  defaultCards?: readonly BoardCard[];
  onCardsChange?: (cards: BoardCard[]) => void;
  /** Cards can still be opened, but not moved. */
  readOnly?: boolean;
  renderCard?: (card: BoardCard) => ReactNode;
  /** Enter or double-click opens a card. */
  onCardOpen?: (card: BoardCard) => void;
  onAddCard?: (column: string) => void;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const [message, announce] = useAnnouncer();
  const [drag, setDrag] = useState<Drag | null>(null);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const columnRefs = useRef(new Map<string, HTMLElement>());
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const pendingFocus = useRef<string | null>(null);
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const [cards, setCards] = useControllable<readonly BoardCard[]>(
    cardsProp,
    defaultCards,
    onCardsChange && ((next) => onCardsChange(next as BoardCard[])),
  );
  const dragRef = useLatest(drag);
  const cardsRef = useLatest(cards);
  const editable = !readOnly;

  const shown = drag
    ? moveCard(cards, drag.id, drag.column, drag.index)
    : cards;
  const inColumn = (column: string, list: readonly BoardCard[] = shown) =>
    list.filter((c) => c.column === column);
  const position = (d: Drag) => {
    const col = columns.find((c) => c.id === d.column)!;
    const count = inColumn(
      d.column,
      moveCard(cards, d.id, d.column, d.index),
    ).length;
    return `${col.title}, position ${d.index + 1} of ${count}`;
  };
  const titleOf = (cardId: string) =>
    cards.find((c) => c.id === cardId)?.title ?? "card";

  const commit = (d: Drag) => {
    const next = moveCard(cards, d.id, d.column, d.index);
    setDrag(null);
    pendingFocus.current = d.id;
    const before = cards.find((c) => c.id === d.id)!;
    const beforeIndex = inColumn(before.column, cards).indexOf(before);
    if (before.column === d.column && beforeIndex === d.index) {
      announce(`${before.title} returned to ${position(d)}.`);
      return;
    }
    setCards(next);
    announce(`Dropped ${before.title} in ${position(d)}.`);
  };
  const cancel = () => {
    const d = dragRef.current;
    if (!d) return;
    setDrag(null);
    pendingFocus.current = d.id;
    announce(`Cancelled. ${titleOf(d.id)} is back where it started.`);
  };

  // Moving between columns remounts a card; keep keyboard focus with it (and scroll it into view).
  useIsoLayoutEffect(() => {
    const target = pendingFocus.current;
    const el = target && cardRefs.current.get(target);
    if (!el) return;
    pendingFocus.current = null;
    if (document.activeElement !== el) el.focus();
  });

  // Pointer dragging lives on the window: the card element is replaced by a placeholder mid-drag.
  const press = useRef<{
    id: string;
    px: number;
    py: number;
    pointer: number;
  } | null>(null);
  const edge = useRef(0);
  const target = (clientX: number, clientY: number, d: Drag): Drag => {
    let column = d.column;
    for (const [colId, el] of columnRefs.current) {
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right) column = colId;
    }
    if (collapsed.has(column))
      return {
        ...d,
        column,
        index: inColumn(
          column,
          cardsRef.current.filter((c) => c.id !== d.id),
        ).length,
      };
    const siblings = inColumn(column, cardsRef.current).filter(
      (c) => c.id !== d.id,
    );
    let index = siblings.length;
    for (let i = 0; i < siblings.length; i++) {
      const el = cardRefs.current.get(siblings[i]!.id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientY < r.top + r.height / 2) {
        index = i;
        break;
      }
    }
    return { ...d, column, index };
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const p = press.current;
      if (!p || e.pointerId !== p.pointer) return;
      const rootRect = root.current?.getBoundingClientRect();
      if (!rootRect) return;
      let d = dragRef.current;
      if (!d) {
        if (Math.hypot(e.clientX - p.px, e.clientY - p.py) < 5) return;
        const el = cardRefs.current.get(p.id);
        const card = cardsRef.current.find((c) => c.id === p.id);
        if (!el || !card) return;
        const r = el.getBoundingClientRect();
        d = {
          id: p.id,
          column: card.column,
          index: inColumn(card.column, cardsRef.current).indexOf(card),
          mode: "pointer",
          width: r.width,
          height: r.height,
          offset: { x: p.px - r.left, y: p.py - r.top },
        };
        announce(`Picked up ${card.title}.`);
      }
      x.set(e.clientX - rootRect.left - d.offset.x);
      y.set(e.clientY - rootRect.top - d.offset.y);
      const next = target(e.clientX, e.clientY, d);
      if (
        next !== dragRef.current &&
        (next.column !== dragRef.current?.column ||
          next.index !== dragRef.current?.index ||
          !dragRef.current)
      )
        setDrag(next);
      // Edge auto-scroll while carrying a card near the scroller's sides.
      const s = scroller.current;
      cancelAnimationFrame(edge.current);
      if (s) {
        const r = s.getBoundingClientRect();
        const speed =
          e.clientX < r.left + 56
            ? -(r.left + 56 - e.clientX)
            : e.clientX > r.right - 56
              ? e.clientX - (r.right - 56)
              : 0;
        if (speed) {
          const tick = () => {
            s.scrollLeft += speed * 0.35;
            edge.current = requestAnimationFrame(tick);
          };
          edge.current = requestAnimationFrame(tick);
        }
      }
    };
    const up = (e: PointerEvent) => {
      const p = press.current;
      if (!p || e.pointerId !== p.pointer) return;
      press.current = null;
      cancelAnimationFrame(edge.current);
      const d = dragRef.current;
      if (d?.mode === "pointer") commit(d);
    };
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && dragRef.current?.mode === "pointer") {
        press.current = null;
        cancelAnimationFrame(edge.current);
        cancel();
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", key);
      cancelAnimationFrame(edge.current);
    };
  });

  const onCardPointerDown = (e: ReactPointerEvent, card: BoardCard) => {
    if (!editable || e.button !== 0 || dragRef.current) return;
    const fromGrip = !!(e.target as HTMLElement).closest(".mizu-board-grip");
    if (e.pointerType !== "mouse" && !fromGrip) return;
    if (
      (e.target as HTMLElement).closest(
        "a, input, textarea, select, [data-board-ignore]",
      )
    )
      return;
    press.current = {
      id: card.id,
      px: e.clientX,
      py: e.clientY,
      pointer: e.pointerId,
    };
  };

  const onCardKey = (e: KeyboardEvent<HTMLElement>, card: BoardCard) => {
    const d = drag?.id === card.id && drag.mode === "keyboard" ? drag : null;
    if (e.key === " " || (e.key === "Enter" && (d || !onCardOpen))) {
      if (!editable) return;
      e.preventDefault();
      if (d) return commit(d);
      const index = inColumn(card.column, cards).indexOf(card);
      const next: Drag = {
        id: card.id,
        column: card.column,
        index,
        mode: "keyboard",
        width: 0,
        height: 0,
        offset: { x: 0, y: 0 },
      };
      setDrag(next);
      announce(
        `Picked up ${card.title}. ${position(next)}. Arrow keys move it, Space drops, Escape cancels.`,
      );
      return;
    }
    if (e.key === "Enter" && onCardOpen) {
      e.preventDefault();
      onCardOpen(card);
      return;
    }
    if (!d) return;
    if (e.key === "Escape") {
      e.preventDefault();
      return cancel();
    }
    const open = columns.filter((c) => !collapsed.has(c.id));
    const at = open.findIndex((c) => c.id === d.column);
    let next: Drag | null = null;
    const count = inColumn(
      d.column,
      cards.filter((c) => c.id !== d.id),
    ).length;
    if (e.key === "ArrowUp") next = { ...d, index: Math.max(0, d.index - 1) };
    if (e.key === "ArrowDown")
      next = { ...d, index: Math.min(count, d.index + 1) };
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const col = open[at + (e.key === "ArrowLeft" ? -1 : 1)];
      if (col)
        next = {
          ...d,
          column: col.id,
          index: Math.min(
            d.index,
            inColumn(
              col.id,
              cards.filter((c) => c.id !== d.id),
            ).length,
          ),
        };
    }
    if (!next) return;
    e.preventDefault();
    if (next.column !== d.column || next.index !== d.index) {
      setDrag(next);
      pendingFocus.current = card.id;
      announce(position(next));
    }
  };

  const ghost =
    drag?.mode === "pointer" ? cards.find((c) => c.id === drag.id) : undefined;
  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.34, ease: EASE_EXPO };

  return (
    <LayoutGroup id={id}>
      <div
        ref={root}
        className={`mizu-board ${className}`}
        style={style}
        role="region"
        aria-label={label}
        data-dragging={drag ? drag.mode : undefined}
      >
        <div ref={scroller} className="mizu-board-columns">
          {columns.map((column) => {
            const list = inColumn(column.id);
            const count = list.length;
            const over = column.limit !== undefined && count > column.limit;
            const folded = collapsed.has(column.id);
            const headId = `${id}-${column.id}`;
            return (
              <section
                key={column.id}
                ref={(el) => {
                  if (el) columnRefs.current.set(column.id, el);
                  else columnRefs.current.delete(column.id);
                }}
                className="mizu-board-column"
                aria-labelledby={headId}
                data-collapsed={folded || undefined}
                data-over={over || undefined}
                data-target={drag?.column === column.id || undefined}
              >
                <header>
                  <h3
                    id={headId}
                    aria-label={`${column.title}, ${count} ${count === 1 ? "card" : "cards"}${column.limit !== undefined ? ` of a limit of ${column.limit}` : ""}`}
                  >
                    {column.title}
                  </h3>
                  <span className="mizu-board-count" aria-hidden="true">
                    {count}
                    {column.limit !== undefined && (
                      <small> / {column.limit}</small>
                    )}
                  </span>
                  <button
                    type="button"
                    className="mizu-board-fold"
                    aria-expanded={!folded}
                    aria-label={`${folded ? "Expand" : "Collapse"} ${column.title}`}
                    onClick={() =>
                      setCollapsed((s) => {
                        const next = new Set(s);
                        if (next.has(column.id)) next.delete(column.id);
                        else next.add(column.id);
                        return next;
                      })
                    }
                  >
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d={folded ? "M4 2l4 4-4 4" : "M2 4l4 4 4-4"} />
                    </svg>
                  </button>
                </header>
                {over && !folded && (
                  <p className="mizu-board-over" role="note">
                    Over the limit of {column.limit}
                  </p>
                )}
                {!folded && (
                  <ol className="mizu-board-cards">
                    {list.map((card) => {
                      const carried = drag?.id === card.id;
                      if (carried && drag.mode === "pointer")
                        return (
                          <motion.li
                            key={`${card.id}-slot`}
                            layout="position"
                            className="mizu-board-slot"
                            style={{ height: drag.height }}
                            aria-hidden="true"
                            transition={transition}
                          />
                        );
                      return (
                        <motion.li
                          key={card.id}
                          layout
                          layoutId={card.id}
                          transition={transition}
                          className="mizu-board-item"
                        >
                          <div
                            ref={(el) => {
                              if (el) cardRefs.current.set(card.id, el);
                              else cardRefs.current.delete(card.id);
                            }}
                            className="mizu-board-card"
                            role="button"
                            tabIndex={0}
                            aria-roledescription="draggable card"
                            aria-pressed={carried || undefined}
                            aria-describedby={`${id}-help`}
                            data-tone={card.tone}
                            data-grabbed={carried || undefined}
                            onPointerDown={(e) => onCardPointerDown(e, card)}
                            onKeyDown={(e) => onCardKey(e, card)}
                            onDoubleClick={() => onCardOpen?.(card)}
                          >
                            {editable && (
                              <span
                                className="mizu-board-grip"
                                aria-hidden="true"
                              >
                                <svg viewBox="0 0 8 14">
                                  {[2, 7, 12].map((cy) =>
                                    [2, 6].map((cx) => (
                                      <circle
                                        key={`${cx}${cy}`}
                                        cx={cx}
                                        cy={cy}
                                        r="1"
                                      />
                                    )),
                                  )}
                                </svg>
                              </span>
                            )}
                            {renderCard ? (
                              renderCard(card)
                            ) : (
                              <DefaultCard card={card} />
                            )}
                          </div>
                        </motion.li>
                      );
                    })}
                    {!list.length && (
                      <li className="mizu-board-empty">
                        {drag ? "Drop here" : "No cards"}
                      </li>
                    )}
                  </ol>
                )}
                {!folded && onAddCard && (
                  <button
                    type="button"
                    className="mizu-board-add"
                    onClick={() => onAddCard(column.id)}
                  >
                    + Add card
                  </button>
                )}
              </section>
            );
          })}
        </div>

        {ghost && drag && (
          <motion.div
            layoutId={ghost.id}
            transition={transition}
            className="mizu-board-ghost"
            aria-hidden="true"
            style={{ x, y, width: drag.width }}
          >
            <div
              className="mizu-board-card"
              data-tone={ghost.tone}
              data-lifted=""
            >
              {renderCard ? renderCard(ghost) : <DefaultCard card={ghost} />}
            </div>
          </motion.div>
        )}
        <p id={`${id}-help`} className="mizu-sr-only">
          {editable
            ? `Press Space to pick up. While holding, arrow keys move between positions and columns, Space drops and Escape cancels.${onCardOpen ? " Enter opens the card." : ""}`
            : onCardOpen
              ? "Press Enter to open."
              : ""}
        </p>
        <span className="mizu-sr-only" role="status" aria-live="assertive">
          {message}
        </span>
      </div>
    </LayoutGroup>
  );
}
