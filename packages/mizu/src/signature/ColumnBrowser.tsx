"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ErrorState } from "../status/Feedback.tsx";
import {
  useAnnouncer,
  useControllable,
  useElementSize,
  useIsoLayoutEffect,
  useLatest,
} from "./internal.ts";

export type BrowserItem = {
  id: string;
  label: string;
  /** Nested items, when you already have them. */
  children?: readonly BrowserItem[];
  /** Has children that `loadChildren` fetches on first visit. */
  hasChildren?: boolean;
  icon?: ReactNode;
  /** A short readout on the right: a count, a size, a date. */
  meta?: ReactNode;
  disabled?: boolean;
};
type Loaded = { items?: readonly BrowserItem[]; error?: string };
type Column = {
  parent: BrowserItem | null;
  items: readonly BrowserItem[] | null;
  error?: string;
  selected?: string;
};

/** Below this container width one pane shows at a time; mirrored in columns.css. */
const NARROW_BELOW = 520;
const isBranch = (item: BrowserItem) => !!item.children || !!item.hasChildren;

/**
 * Miller columns: choose an item and its contents open in the next column,
 * loading on demand, until a leaf opens in a preview. On narrow screens the
 * columns become a stack you push and pop.
 */
export function ColumnBrowser({
  label,
  items,
  loadChildren,
  path,
  defaultPath = [],
  onPathChange,
  onOpen,
  renderPreview,
  columnWidth = 240,
  empty = "Nothing here.",
  className = "",
  style,
}: {
  label: string;
  items: readonly BrowserItem[];
  /** Fetches the children of an item marked `hasChildren`; results are kept. */
  loadChildren?: (item: BrowserItem) => Promise<readonly BrowserItem[]>;
  /** Selected ids from the top level down. */
  path?: readonly string[];
  defaultPath?: readonly string[];
  onPathChange?: (path: readonly string[]) => void;
  /** Enter or double-click on an item without children. */
  onOpen?: (item: BrowserItem) => void;
  /** The last pane, for an item without children; `trail` is the selected path. */
  renderPreview?: (
    item: BrowserItem,
    trail: readonly BrowserItem[],
  ) => ReactNode;
  columnWidth?: number;
  empty?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [rootRef, { width }] = useElementSize<HTMLDivElement>();
  const narrow = width > 0 && width < NARROW_BELOW;
  const [selected, setSelected] = useControllable<readonly string[]>(
    path,
    defaultPath,
    onPathChange,
  );
  const [loaded, setLoaded] = useState<Record<string, Loaded>>({});
  // The pane that holds focus, or shows alone when narrow: where the path ends.
  const [current, setCurrent] = useState(() =>
    Math.max(0, (path ?? defaultPath).length - 1),
  );
  const [from, setFrom] = useState<"forward" | "back">("forward");
  const [message, announce] = useAnnouncer();
  const trackRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<{ level: number; id?: string } | null>(null);
  const pendingRef = useRef(new Set<string>());
  const typedRef = useRef({ text: "", at: 0 });
  const loadRef = useLatest(loadChildren);

  // The columns along the selected path, and the leaf at its end if any.
  const columns: Column[] = [];
  let list: readonly BrowserItem[] | null = items,
    parent: BrowserItem | null = null,
    error: string | undefined,
    leaf: BrowserItem | null = null;
  for (let level = 0; level < 64; level++) {
    const chosen: BrowserItem | undefined = list?.find(
      (i) => i.id === selected[level],
    );
    columns.push({ parent, items: list, error, selected: chosen?.id });
    if (!chosen) break;
    if (!isBranch(chosen)) {
      leaf = chosen;
      break;
    }
    parent = chosen;
    const cache: Loaded | undefined = chosen.children
      ? undefined
      : loaded[chosen.id];
    list = chosen.children ?? cache?.items ?? null;
    error = cache?.error;
  }
  const trail = columns.flatMap(
    (c) => c.items?.find((i) => i.id === c.selected) ?? [],
  );
  const panes = columns.length + (leaf ? 1 : 0);
  const active = Math.min(current, panes - 1);

  // Fetch what the path needs; the results are kept for the next visit.
  useEffect(() => {
    const load = loadRef.current;
    if (!load) return;
    for (const item of trail) {
      if (
        !item.hasChildren ||
        item.children ||
        loaded[item.id] ||
        pendingRef.current.has(item.id)
      )
        continue;
      pendingRef.current.add(item.id);
      void Promise.resolve()
        .then(() => load(item))
        .then(
          (children) =>
            setLoaded((l) => ({ ...l, [item.id]: { items: children } })),
          (e: unknown) =>
            setLoaded((l) => ({
              ...l,
              [item.id]: {
                error:
                  e instanceof Error ? e.message : "It could not be loaded.",
              },
            })),
        )
        .finally(() => pendingRef.current.delete(item.id));
    }
  });

  // Focus follows keyboard moves into columns that may only just have rendered.
  useIsoLayoutEffect(() => {
    const target = focusRef.current,
      root = rootRef.current;
    if (!target || !root) return;
    const el = [...root.querySelectorAll<HTMLElement>("[data-level]")].find(
      (n) =>
        n.dataset.level === String(target.level) &&
        (target.id === undefined
          ? n.hasAttribute("data-pane")
          : n.dataset.id === target.id),
    );
    if (el) {
      focusRef.current = null;
      el.focus();
    }
  });

  // Keep the newest column in view.
  useIsoLayoutEffect(() => {
    const track = trackRef.current;
    if (track && !narrow) track.scrollLeft = track.scrollWidth;
  }, [panes, narrow]);

  const go = (
    level: number,
    id: string | undefined,
    way: "forward" | "back",
  ) => {
    setCurrent(level);
    setFrom(way);
    focusRef.current = { level, id };
    const column = columns[level];
    if (way === "forward" && column?.parent)
      announce(
        column.items
          ? `${column.parent.label}: ${column.items.length} items`
          : `Loading ${column.parent.label}`,
      );
  };
  const choose = (level: number, item: BrowserItem, push: boolean) => {
    if (item.disabled) return;
    setSelected([...selected.slice(0, level), item.id]);
    if (push) go(level + 1, undefined, "forward");
    else {
      setCurrent(level);
      setFrom("forward");
    }
  };
  const retry = (item: BrowserItem) =>
    setLoaded((l) => {
      const next = { ...l };
      delete next[item.id];
      return next;
    });

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[role="option"]');
    if (!el) {
      // A pane that was still loading, or empty, when focus arrived.
      if (!target.hasAttribute("data-pane")) return;
      const level = Number(target.dataset.level);
      const first = columns[level]?.items?.find((i) => !i.disabled);
      if ((e.key === "ArrowDown" || e.key === "Home") && first) {
        e.preventDefault();
        setSelected([...selected.slice(0, level), first.id]);
        go(level, first.id, "forward");
      } else if (e.key === "ArrowLeft" && level > 0) {
        e.preventDefault();
        setSelected(selected.slice(0, level));
        go(level - 1, selected[level - 1], "back");
      }
      return;
    }
    const level = Number(el.dataset.level);
    const options = columns[level]?.items ?? [];
    const index = options.findIndex((i) => i.id === el.dataset.id);
    const item = options[index];
    if (!item) return;
    const scan = (start: number, step: number) => {
      for (let i = start; i >= 0 && i < options.length; i += step)
        if (!options[i]!.disabled) return options[i];
    };
    let move: BrowserItem | undefined;
    if (e.key === "ArrowDown") move = scan(index + 1, 1);
    else if (e.key === "ArrowUp") move = scan(index - 1, -1);
    else if (e.key === "Home") move = scan(0, 1);
    else if (e.key === "End") move = scan(options.length - 1, -1);
    else if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      if (!isBranch(item)) {
        if (e.key === "Enter") onOpen?.(item);
        else if (narrow) go(level + 1, undefined, "forward");
        return;
      }
      const inside = (item.children ?? loaded[item.id]?.items)?.find(
        (i) => !i.disabled,
      );
      setSelected([
        ...selected.slice(0, level),
        item.id,
        ...(inside ? [inside.id] : []),
      ]);
      go(level + 1, inside?.id, "forward");
      return;
    } else if (e.key === "ArrowLeft") {
      if (level === 0) return;
      e.preventDefault();
      setSelected(selected.slice(0, level));
      go(level - 1, selected[level - 1], "back");
      return;
    } else if (e.key.length === 1 && e.key.trim()) {
      // Type to jump: letters build a prefix; one repeated letter cycles.
      const now = e.timeStamp,
        typed = typedRef.current;
      typed.text = now - typed.at > 700 ? e.key : typed.text + e.key;
      typed.at = now;
      const query = typed.text.toLowerCase();
      const order = [
        ...options.slice(index + 1),
        ...options.slice(0, index + 1),
      ];
      const starts = (q: string) =>
        order.find((i) => !i.disabled && i.label.toLowerCase().startsWith(q));
      move =
        starts(query) ??
        (new Set(query).size === 1 ? starts(query[0]!) : undefined);
    }
    if (!move) return;
    e.preventDefault();
    setSelected([...selected.slice(0, level), move.id]);
    go(level, move.id, "forward");
  };

  const crumbs = [label, ...trail.map((t) => t.label)];
  const shown = columns[active]?.items;
  return (
    <div
      ref={rootRef}
      className={`mizu-columns ${className}`}
      style={
        {
          ...style,
          "--mizu-columns-width": `${columnWidth}px`,
        } as CSSProperties
      }
      role="group"
      aria-label={label}
      onKeyDown={onKey}
    >
      <div className="mizu-columns-bar">
        <button
          type="button"
          className="mizu-columns-back"
          disabled={active === 0}
          onClick={() => go(active - 1, selected[active - 1], "back")}
          aria-label={`Back to ${crumbs[active - 1] ?? label}`}
        >
          <svg viewBox="0 0 14 14" aria-hidden="true">
            <path d="M9 2 4 7l5 5" />
          </svg>
        </button>
        <nav aria-label="Location" style={{ display: "contents" }}>
          <ol className="mizu-columns-crumbs">
            {crumbs
              .slice(0, narrow ? active + 1 : undefined)
              .map((crumb, i) => (
                <li key={i}>
                  <button
                    type="button"
                    aria-current={i === active ? "location" : undefined}
                    onClick={() =>
                      go(i, selected[i], i < active ? "back" : "forward")
                    }
                  >
                    {crumb}
                  </button>
                </li>
              ))}
          </ol>
        </nav>
        {shown && (
          <span className="mizu-columns-count">
            {shown.length} {shown.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>
      <div ref={trackRef} className="mizu-columns-track">
        {columns.map((column, level) => {
          const here = level === active;
          const tabbable =
            column.items?.find((i) => i.id === column.selected) ??
            column.items?.find((i) => !i.disabled);
          return (
            <div
              key={column.parent?.id ?? "root"}
              className="mizu-columns-pane"
              data-pane=""
              data-level={level}
              data-current={here || undefined}
              data-from={here ? from : undefined}
              role="listbox"
              aria-label={column.parent?.label ?? label}
              aria-busy={!column.items && !column.error ? true : undefined}
              tabIndex={here && !tabbable ? 0 : -1}
            >
              {column.error ? (
                <ErrorState
                  title="Could not load"
                  onRetry={() => column.parent && retry(column.parent)}
                >
                  {column.error}
                </ErrorState>
              ) : !column.items ? (
                <>
                  <span className="mizu-columns-loading" aria-hidden="true" />
                  <div className="mizu-columns-skeleton" aria-hidden="true">
                    {[72, 54, 64, 40].map((w) => (
                      <span key={w} style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <span className="mizu-sr-only">Loading</span>
                </>
              ) : !column.items.length ? (
                <p className="mizu-columns-note">{empty}</p>
              ) : (
                column.items.map((item) => {
                  const on = item.id === column.selected;
                  return (
                    <div
                      key={item.id}
                      role="option"
                      className="mizu-columns-option"
                      data-level={level}
                      data-id={item.id}
                      aria-selected={on}
                      aria-disabled={item.disabled || undefined}
                      tabIndex={here && item === tabbable ? 0 : -1}
                      onClick={() => choose(level, item, narrow)}
                      onDoubleClick={() => !isBranch(item) && onOpen?.(item)}
                    >
                      <span className="mizu-columns-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      <span className="mizu-columns-meta">{item.meta}</span>
                      {isBranch(item) ? (
                        <svg
                          className="mizu-columns-chevron"
                          viewBox="0 0 10 10"
                          aria-hidden="true"
                        >
                          <path d="m3 1.5 3.5 3.5L3 8.5" />
                        </svg>
                      ) : (
                        <span />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
        {leaf && (
          <section
            key={`preview-${leaf.id}`}
            className="mizu-columns-pane mizu-columns-preview"
            data-pane=""
            data-level={columns.length}
            data-current={active === columns.length || undefined}
            data-from={active === columns.length ? from : undefined}
            aria-label={`Preview: ${leaf.label}`}
            tabIndex={-1}
          >
            {renderPreview ? (
              renderPreview(leaf, trail)
            ) : (
              <div className="mizu-columns-summary">
                <p>{leaf.label}</p>
                {leaf.meta && <span>{leaf.meta}</span>}
              </div>
            )}
          </section>
        )}
      </div>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
