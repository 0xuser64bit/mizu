"use client";

import {
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useReducedMotion } from "../motion/Preferences.tsx";
import { EASE_EXPO } from "../motion/easings.ts";
import {
  useAnnouncer,
  useControllable,
  useIsoLayoutEffect,
} from "./internal.ts";
import {
  build,
  flatten,
  hasChildren,
  indent,
  moveSibling,
  outdent,
  subtreeEnd,
  visibleRows,
  type OutlineItem,
  type OutlineRow,
} from "./outline.ts";

export type { OutlineItem } from "./outline.ts";

const makeId = () =>
  `o${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const sizes =
  typeof CSS !== "undefined" && CSS.supports?.("field-sizing", "content");

/**
 * A keyboard-first outline: Enter splits, Tab and Shift+Tab restructure,
 * Alt+arrows move whole branches, items fold and can be zoomed into until
 * they become the page's title.
 */
export function Outliner({
  label,
  items,
  defaultItems = [],
  onItemsChange,
  placeholder = "Write a line…",
  createId = makeId,
  className = "",
  style,
}: {
  label: string;
  items?: readonly OutlineItem[];
  defaultItems?: readonly OutlineItem[];
  onItemsChange?: (items: OutlineItem[]) => void;
  placeholder?: string;
  createId?: () => string;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const [message, announce] = useAnnouncer();
  // `build` always returns a fresh array, so handing it on as mutable is honest.
  const [tree, setTree] = useControllable<readonly OutlineItem[]>(
    items,
    defaultItems,
    onItemsChange && ((next) => onItemsChange(next as OutlineItem[])),
  );
  const rows = useMemo(() => flatten(tree), [tree]);
  const [zoom, setZoom] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const fields = useRef(new Map<string, HTMLTextAreaElement>());
  const pending = useRef<{ id: string; caret: number } | null>(null);
  const zoomed = zoom !== null && rows.some((r) => r.id === zoom) ? zoom : null;
  const shown = useMemo(() => visibleRows(rows, zoomed), [rows, zoomed]);
  const zoomIndex = zoomed ? rows.findIndex((r) => r.id === zoomed) : -1;
  const floor = zoomIndex === -1 ? 0 : rows[zoomIndex]!.depth + 1;

  const commit = (
    next: readonly OutlineRow[],
    focus?: { id: string; caret: number },
  ) => {
    setTree(build(next));
    if (focus) pending.current = focus;
  };

  useIsoLayoutEffect(() => {
    const target = pending.current;
    const el = target && fields.current.get(target.id);
    if (!target || !el) return;
    pending.current = null;
    el.focus();
    const caret = Math.min(target.caret, el.value.length);
    el.setSelectionRange(caret, caret);
  });
  // Browsers without field-sizing grow each line to its content here.
  useIsoLayoutEffect(() => {
    if (sizes) return;
    for (const el of fields.current.values()) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  });

  const ancestors = (index: number) => {
    const out: OutlineRow[] = [];
    let depth = rows[index]!.depth;
    for (let k = index - 1; k >= 0 && depth > 0; k--)
      if (rows[k]!.depth < depth) {
        out.unshift(rows[k]!);
        depth = rows[k]!.depth;
      }
    return out;
  };
  // One pass: each row's parent index, and each visible row's position among its visible siblings.
  const parents = useMemo(() => {
    const out: number[] = [];
    const stack: number[] = [];
    rows.forEach((r, k) => {
      while (stack.length && rows[stack[stack.length - 1]!]!.depth >= r.depth)
        stack.pop();
      out.push(stack[stack.length - 1] ?? -1);
      stack.push(k);
    });
    return out;
  }, [rows]);
  const parentOf = (index: number) => parents[index] ?? -1;
  const places = useMemo(() => {
    const groups = new Map<number, number[]>();
    for (const s of shown)
      groups.set(parents[s.index] ?? -1, [
        ...(groups.get(parents[s.index] ?? -1) ?? []),
        s.index,
      ]);
    const out = new Map<number, [number, number]>();
    for (const members of groups.values())
      members.forEach((m, k) => out.set(m, [k + 1, members.length]));
    return out;
  }, [shown, parents]);
  const activeIndex = active ? rows.findIndex((r) => r.id === active) : -1;
  const threadParent = activeIndex === -1 ? -1 : parentOf(activeIndex);
  const threadEnd = threadParent === -1 ? -1 : subtreeEnd(rows, threadParent);

  const zoomTo = (target: string | null) => {
    setZoom(target);
    const row = rows.find((r) => r.id === target);
    announce(
      row
        ? `Focused on ${row.text || "untitled item"}.`
        : "Showing the whole outline.",
    );
    const first = target ? visibleRows(rows, target)[0]?.row : undefined;
    pending.current = {
      id: first?.id ?? target ?? shown[0]?.row.id ?? "",
      caret: 0,
    };
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>, i: number) => {
    const el = e.currentTarget;
    const row = rows[i]!;
    const caret = el.selectionStart,
      collapsedSelection = caret === el.selectionEnd;
    const mod = e.metaKey || e.ctrlKey;
    const visibleAt = shown.findIndex((s) => s.index === i);
    const neighbour = (d: number) => shown[visibleAt + d]?.row;

    if (e.key === "Enter" && mod) {
      e.preventDefault();
      commit(rows.map((r, k) => (k === i ? { ...r, done: !r.done } : r)));
      announce(row.done ? "Marked not done." : "Marked done.");
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && collapsedSelection) {
      e.preventDefault();
      const fresh: OutlineRow = { id: createId(), text: "", depth: row.depth };
      if (caret === 0 && row.text) {
        commit([...rows.slice(0, i), fresh, ...rows.slice(i)], {
          id: row.id,
          caret: 0,
        });
        return;
      }
      const openParent = hasChildren(rows, i) && !row.collapsed;
      const at = openParent ? i + 1 : subtreeEnd(rows, i);
      fresh.depth = openParent ? row.depth + 1 : row.depth;
      fresh.text = row.text.slice(caret);
      const next = rows.map((r, k) =>
        k === i ? { ...r, text: r.text.slice(0, caret) } : r,
      );
      commit([...next.slice(0, at), fresh, ...next.slice(at)], {
        id: fresh.id,
        caret: 0,
      });
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const next = e.shiftKey ? outdent(rows, i, floor) : indent(rows, i);
      if (next !== rows) {
        commit(next, { id: row.id, caret });
        announce(
          `${e.shiftKey ? "Outdented" : "Indented"} to level ${next.find((r) => r.id === row.id)!.depth - floor + 1}.`,
        );
      }
      return;
    }
    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const next = moveSibling(rows, i, e.key === "ArrowUp" ? -1 : 1);
      if (next !== rows) {
        commit(next, { id: row.id, caret });
        announce(`Moved ${e.key === "ArrowUp" ? "up" : "down"}.`);
      }
      return;
    }
    if (e.altKey && e.key === "ArrowRight") {
      e.preventDefault();
      return zoomTo(row.id);
    }
    if (e.altKey && e.key === "ArrowLeft" && zoomed) {
      e.preventDefault();
      const z = rows[zoomIndex]!;
      const up = ancestors(zoomIndex).pop();
      setZoom(up?.id ?? null);
      pending.current = { id: z.id, caret: 0 };
      announce(up ? `Focused on ${up.text}.` : "Showing the whole outline.");
      return;
    }
    if (mod && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      if (!hasChildren(rows, i)) return;
      const collapsed = e.key === "ArrowUp";
      if (!!row.collapsed !== collapsed) {
        commit(
          rows.map((r, k) => (k === i ? { ...r, collapsed } : r)),
          { id: row.id, caret },
        );
        announce(collapsed ? "Collapsed." : "Expanded.");
      }
      return;
    }
    if (
      (e.key === "ArrowUp" || e.key === "ArrowDown") &&
      collapsedSelection &&
      !e.shiftKey
    ) {
      const single =
        el.scrollHeight <=
        parseFloat(getComputedStyle(el).lineHeight || "24") * 1.6;
      const up = e.key === "ArrowUp";
      const atEdge = up
        ? caret === 0 || (single && !row.text.slice(0, caret).includes("\n"))
        : caret === row.text.length ||
          (single && !row.text.slice(caret).includes("\n"));
      const target = neighbour(up ? -1 : 1);
      if (atEdge && target) {
        e.preventDefault();
        pending.current = {
          id: target.id,
          caret: up ? target.text.length : Math.min(caret, target.text.length),
        };
        setActive(target.id);
      }
      return;
    }
    if (e.key === "Backspace" && caret === 0 && collapsedSelection) {
      const previous = neighbour(-1);
      if (!row.text && !hasChildren(rows, i)) {
        e.preventDefault();
        if (!previous && shown.length === 1 && !zoomed) return commit([]);
        commit(
          rows.filter((_, k) => k !== i),
          previous && { id: previous.id, caret: previous.text.length },
        );
        return;
      }
      if (previous) {
        e.preventDefault();
        commit(
          rows
            .filter((_, k) => k !== i)
            .map((r) =>
              r.id === previous.id ? { ...r, text: r.text + row.text } : r,
            ),
          { id: previous.id, caret: previous.text.length },
        );
      }
      return;
    }
    if (e.key === "Delete" && caret === row.text.length && collapsedSelection) {
      const next = neighbour(1);
      if (!next || hasChildren(rows, rows.indexOf(next))) return;
      e.preventDefault();
      commit(
        rows
          .filter((r) => r.id !== next.id)
          .map((r, k) => (k === i ? { ...r, text: r.text + next.text } : r)),
        { id: row.id, caret },
      );
    }
  };

  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.28, ease: EASE_EXPO };
  const trail =
    zoomIndex === -1 ? [] : [...ancestors(zoomIndex), rows[zoomIndex]!];

  return (
    <LayoutGroup id={id}>
      <section
        className={`mizu-outline ${className}`}
        style={style}
        aria-label={label}
      >
        <nav className="mizu-outline-trail" aria-label={`${label} location`}>
          <button
            type="button"
            onClick={() => zoomTo(null)}
            aria-current={zoomed ? undefined : "location"}
            disabled={!zoomed}
          >
            {label}
          </button>
          {trail.map((r, k) => (
            <span key={r.id}>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => zoomTo(r.id)}
                aria-current={k === trail.length - 1 ? "location" : undefined}
                disabled={k === trail.length - 1}
              >
                {r.text || "Untitled"}
              </button>
            </span>
          ))}
        </nav>

        {zoomed && (
          <motion.div
            layoutId={`${id}-${zoomed}`}
            transition={transition}
            className="mizu-outline-title"
          >
            <textarea
              rows={1}
              aria-label="Focused item"
              value={rows[zoomIndex]!.text}
              ref={(el) => {
                if (el) fields.current.set(zoomed, el);
                else fields.current.delete(zoomed);
              }}
              onChange={(e) =>
                commit(
                  rows.map((r) =>
                    r.id === zoomed ? { ...r, text: e.target.value } : r,
                  ),
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const fresh: OutlineRow = {
                    id: createId(),
                    text: "",
                    depth: floor,
                  };
                  commit(
                    [
                      ...rows.slice(0, zoomIndex + 1),
                      fresh,
                      ...rows.slice(zoomIndex + 1),
                    ],
                    { id: fresh.id, caret: 0 },
                  );
                } else if (e.altKey && e.key === "ArrowLeft") {
                  e.preventDefault();
                  const up = ancestors(zoomIndex).pop();
                  setZoom(up?.id ?? null);
                }
              }}
            />
          </motion.div>
        )}

        <ul className="mizu-outline-list" aria-describedby={`${id}-keys`}>
          <AnimatePresence initial={false}>
            {shown.map(({ row, index, level }, position) => {
              const kids = hasChildren(rows, index);
              const hidden =
                row.collapsed && kids ? subtreeEnd(rows, index) - index - 1 : 0;
              const inThread =
                threadParent !== -1 &&
                index > threadParent &&
                index < threadEnd;
              const [place, of] = places.get(index) ?? [
                position + 1,
                shown.length,
              ];
              return (
                <motion.li
                  key={row.id}
                  layout="position"
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={
                    reduce
                      ? { opacity: 0, transition: { duration: 0 } }
                      : { opacity: 0, height: 0 }
                  }
                  transition={transition}
                  className="mizu-outline-row"
                  data-done={row.done || undefined}
                  data-thread={inThread || undefined}
                  data-active={active === row.id || undefined}
                  style={
                    {
                      "--mizu-level": level,
                      "--mizu-thread":
                        threadParent === -1
                          ? 0
                          : rows[threadParent]!.depth - floor,
                    } as CSSProperties
                  }
                >
                  <div className="mizu-outline-line">
                    {kids ? (
                      <button
                        type="button"
                        className="mizu-outline-fold"
                        tabIndex={-1}
                        aria-label={`${row.collapsed ? "Expand" : "Collapse"} ${row.text || "item"}`}
                        aria-expanded={!row.collapsed}
                        onClick={() =>
                          commit(
                            rows.map((r, k) =>
                              k === index
                                ? { ...r, collapsed: !r.collapsed }
                                : r,
                            ),
                          )
                        }
                      >
                        <svg viewBox="0 0 10 10" aria-hidden="true">
                          <path
                            d={row.collapsed ? "M3 2l4 3-4 3" : "M2 3l3 4 3-4"}
                          />
                        </svg>
                      </button>
                    ) : (
                      <span className="mizu-outline-fold" aria-hidden="true" />
                    )}
                    <button
                      type="button"
                      className="mizu-outline-bullet"
                      tabIndex={-1}
                      aria-label={`Focus on ${row.text || "untitled item"}`}
                      data-folded={hidden > 0 || undefined}
                      onClick={() => zoomTo(row.id)}
                    >
                      {hidden > 0 && (
                        <span className="mizu-sr-only">{hidden} hidden</span>
                      )}
                    </button>
                    <motion.div
                      layoutId={`${id}-${row.id}`}
                      transition={transition}
                      className="mizu-outline-text"
                    >
                      <textarea
                        ref={(el) => {
                          if (el) fields.current.set(row.id, el);
                          else fields.current.delete(row.id);
                        }}
                        rows={1}
                        value={row.text}
                        placeholder={
                          position === 0 && shown.length === 1
                            ? placeholder
                            : undefined
                        }
                        aria-label={`Level ${level + 1}, ${place} of ${of}`}
                        aria-describedby={
                          hidden || row.done
                            ? `${id}-${row.id}-state`
                            : undefined
                        }
                        onFocus={() => setActive(row.id)}
                        onChange={(e) =>
                          commit(
                            rows.map((r, k) =>
                              k === index ? { ...r, text: e.target.value } : r,
                            ),
                          )
                        }
                        onKeyDown={(e) => onKey(e, index)}
                      />
                    </motion.div>
                    {(hidden > 0 || row.done) && (
                      <span
                        id={`${id}-${row.id}-state`}
                        className="mizu-sr-only"
                      >
                        {row.done ? "Done. " : ""}
                        {hidden > 0 ? `Collapsed, ${hidden} items hidden.` : ""}
                      </span>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
          {!shown.length && (
            <li
              className="mizu-outline-row mizu-outline-start"
              style={{ "--mizu-level": 0 } as CSSProperties}
            >
              <div className="mizu-outline-line">
                <span className="mizu-outline-fold" aria-hidden="true" />
                <span className="mizu-outline-bullet" aria-hidden="true" />
                <div className="mizu-outline-text">
                  <textarea
                    rows={1}
                    value=""
                    placeholder={placeholder}
                    aria-label={`New item in ${zoomed ? rows[zoomIndex]!.text || "this item" : label}`}
                    onChange={(e) => {
                      const fresh: OutlineRow = {
                        id: createId(),
                        text: e.target.value,
                        depth: floor,
                      };
                      const at =
                        zoomIndex === -1
                          ? rows.length
                          : subtreeEnd(rows, zoomIndex);
                      commit([...rows.slice(0, at), fresh, ...rows.slice(at)], {
                        id: fresh.id,
                        caret: e.target.value.length,
                      });
                    }}
                  />
                </div>
              </div>
            </li>
          )}
        </ul>
        <p id={`${id}-keys`} className="mizu-sr-only">
          Enter adds a line, Tab and Shift Tab change level, Alt with arrows
          moves a line, Control or Command with Enter marks it done, Control or
          Command with arrows folds it, Alt Right focuses on it and Alt Left
          steps back out.
        </p>
        <span className="mizu-sr-only" role="status" aria-live="polite">
          {message}
        </span>
      </section>
    </LayoutGroup>
  );
}
