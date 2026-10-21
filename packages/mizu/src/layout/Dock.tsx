"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type DockTab = { id: string; label: string; content: ReactNode };
export type DockLayout = {
  panes: [string[], string[]];
  active: [string | null, string | null];
  split: number;
  collapsed: 0 | 1 | null;
};

function normalize(
  layout: DockLayout | undefined,
  tabs: DockTab[],
): DockLayout {
  const ids = tabs.map((tab) => tab.id),
    seen = new Set<string>();
  const keep = (items: string[]) =>
    items.filter((id) => {
      if (!ids.includes(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  const middle = Math.ceil(ids.length / 2);
  const panes: DockLayout["panes"] = layout
    ? [keep(layout.panes[0]), keep(layout.panes[1])]
    : [keep(ids.slice(0, middle)), keep(ids.slice(middle))];
  panes[0].push(...ids.filter((id) => !seen.has(id)));
  return {
    panes,
    active: panes.map((items, pane) =>
      items.includes(layout?.active[pane] ?? "")
        ? layout!.active[pane]
        : (items[0] ?? null),
    ) as DockLayout["active"],
    split: Math.max(
      20,
      Math.min(80, Number.isFinite(layout?.split) ? layout!.split : 50),
    ),
    collapsed:
      layout?.collapsed === 0 || layout?.collapsed === 1
        ? layout.collapsed
        : null,
  };
}

export function Dock({
  label,
  tabs,
  value,
  defaultValue,
  onValueChange,
  readOnly = false,
  className = "",
}: {
  label: string;
  tabs: DockTab[];
  value?: DockLayout;
  defaultValue?: DockLayout;
  onValueChange?: (layout: DockLayout) => void;
  /** Selection stays available; structural layout edits are disabled. */
  readOnly?: boolean;
  className?: string;
}) {
  const [internal, setInternal] = useState(() => normalize(defaultValue, tabs));
  const id = useId(),
    grid = useRef<HTMLDivElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null>(null);
  const available = tabs.filter(
    (tab, index) => tabs.findIndex((item) => item.id === tab.id) === index,
  );
  const current = normalize(value ?? internal, available);
  const tabOf = (key: string | null) => available.find((tab) => tab.id === key);
  const tabId = (key: string) => `${id}-tab-${encodeURIComponent(key)}`;
  const panelId = (key: string) => `${id}-panel-${encodeURIComponent(key)}`;
  const paneName = (pane: number) => (pane === 0 ? "first" : "second");
  const update = (next: DockLayout) => {
    const valid = normalize(next, available);
    if (value === undefined) setInternal(valid);
    onValueChange?.(valid);
  };
  useEffect(() => {
    if (pendingFocus.current !== null) {
      triggers.current.get(pendingFocus.current)?.focus();
      pendingFocus.current = null;
    }
  });
  const select = (pane: 0 | 1, key: string) => {
    const active: DockLayout["active"] = [...current.active];
    active[pane] = key;
    update({ ...current, active });
  };
  const reorder = (pane: 0 | 1, key: string, direction: number) => {
    if (readOnly) return;
    const items = [...current.panes[pane]],
      from = items.indexOf(key),
      to = from + direction;
    if (from < 0 || to < 0 || to >= items.length) return;
    [items[from], items[to]] = [items[to]!, items[from]!];
    const panes: DockLayout["panes"] = [...current.panes];
    panes[pane] = items;
    pendingFocus.current = key;
    update({ ...current, panes });
  };
  const move = (pane: 0 | 1, key: string) => {
    if (readOnly) return;
    const other = pane === 0 ? 1 : 0;
    const panes: DockLayout["panes"] = [
      [...current.panes[0]],
      [...current.panes[1]],
    ];
    const index = panes[pane].indexOf(key);
    if (index < 0) return;
    panes[pane].splice(index, 1);
    panes[other].push(key);
    const active: DockLayout["active"] = [...current.active];
    active[pane] = panes[pane][Math.min(index, panes[pane].length - 1)] ?? null;
    active[other] = key;
    pendingFocus.current = key;
    update({
      ...current,
      panes,
      active,
      collapsed: current.collapsed === other ? null : current.collapsed,
    });
  };
  const resize = (split: number) => {
    if (!readOnly) update({ ...current, split });
  };
  const style = {
    "--mizu-dock-first": `${current.split}fr`,
    "--mizu-dock-second": `${100 - current.split}fr`,
  } as CSSProperties;

  return (
    <section
      className={`mizu-dock ${className}`}
      aria-label={label}
      data-collapsed={
        current.collapsed === null ? "none" : paneName(current.collapsed)
      }
      data-readonly={readOnly || undefined}
      style={style}
    >
      <div className="mizu-dock-toolbar">
        <strong>{label}</strong>
        {current.collapsed !== null && (
          <button
            type="button"
            disabled={readOnly}
            onClick={() => update({ ...current, collapsed: null })}
          >
            Restore {paneName(current.collapsed)} pane
          </button>
        )}
        {readOnly && <span className="mizu-dock-readout">Layout locked</span>}
      </div>
      <div className="mizu-dock-grid" ref={grid}>
        {([0, 1] as const).map((pane) => {
          const active = current.active[pane],
            selected = tabOf(active);
          const index =
            active === null ? -1 : current.panes[pane].indexOf(active);
          return (
            <div
              key={pane}
              className="mizu-dock-pane-head"
              data-pane={pane}
              hidden={current.collapsed === pane}
            >
              <div className="mizu-dock-pane-title">
                <span>{pane === 0 ? "First pane" : "Second pane"}</span>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => update({ ...current, collapsed: pane })}
                >
                  Collapse {paneName(pane)} pane
                </button>
              </div>
              {current.panes[pane].length > 0 && (
                <div
                  role="tablist"
                  aria-label={`${label}: ${paneName(pane)} pane`}
                  className="mizu-dock-tabs"
                >
                  {current.panes[pane].map((key) => (
                    <button
                      key={key}
                      ref={(element) => {
                        if (element) triggers.current.set(key, element);
                        else triggers.current.delete(key);
                      }}
                      type="button"
                      role="tab"
                      id={tabId(key)}
                      aria-controls={panelId(key)}
                      aria-selected={key === active}
                      tabIndex={key === active ? 0 : -1}
                      onClick={() => select(pane, key)}
                      onKeyDown={(event) => {
                        const direction =
                          event.key === "ArrowLeft"
                            ? -1
                            : event.key === "ArrowRight"
                              ? 1
                              : 0;
                        if (event.altKey && direction) {
                          event.preventDefault();
                          if (!event.shiftKey) reorder(pane, key, direction);
                          else if (direction === (pane === 0 ? 1 : -1))
                            move(pane, key);
                          return;
                        }
                        if (
                          !direction &&
                          event.key !== "Home" &&
                          event.key !== "End"
                        )
                          return;
                        event.preventDefault();
                        const items = current.panes[pane],
                          position = items.indexOf(key);
                        const next =
                          event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? items.length - 1
                              : (position + direction + items.length) %
                                items.length;
                        const target = items[next]!;
                        triggers.current.get(target)?.focus();
                        select(pane, target);
                      }}
                    >
                      {tabOf(key)?.label}
                    </button>
                  ))}
                </div>
              )}
              {selected && (
                <div
                  role="group"
                  className="mizu-dock-actions"
                  aria-label={`${selected.label} panel actions`}
                >
                  <button
                    type="button"
                    aria-label={`Move ${selected.label} earlier`}
                    disabled={readOnly || index <= 0}
                    onClick={() => reorder(pane, selected.id, -1)}
                  >
                    Earlier
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${selected.label} later`}
                    disabled={
                      readOnly || index === current.panes[pane].length - 1
                    }
                    onClick={() => reorder(pane, selected.id, 1)}
                  >
                    Later
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${selected.label} to ${paneName(pane === 0 ? 1 : 0)} pane`}
                    disabled={readOnly}
                    onClick={() => move(pane, selected.id)}
                  >
                    Move to {paneName(pane === 0 ? 1 : 0)} pane
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div
          role="separator"
          aria-label={`Resize ${label}`}
          aria-orientation="vertical"
          aria-controls={
            available.map((tab) => panelId(tab.id)).join(" ") || undefined
          }
          aria-valuemin={20}
          aria-valuemax={80}
          aria-valuenow={current.split}
          aria-disabled={readOnly}
          tabIndex={readOnly ? -1 : 0}
          className="mizu-dock-separator"
          hidden={current.collapsed !== null}
          onPointerDown={(event) => {
            if (readOnly || event.button !== 0) return;
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            const bounds = grid.current!.getBoundingClientRect();
            if (bounds.width > 24)
              resize(
                Math.round(
                  ((event.clientX - bounds.left - 12) / (bounds.width - 24)) *
                    100,
                ),
              );
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onKeyDown={(event) => {
            const next =
              event.key === "Home"
                ? 20
                : event.key === "End"
                  ? 80
                  : event.key === "ArrowLeft"
                    ? current.split - (event.shiftKey ? 10 : 1)
                    : event.key === "ArrowRight"
                      ? current.split + (event.shiftKey ? 10 : 1)
                      : null;
            if (next === null) return;
            event.preventDefault();
            resize(next);
          }}
        >
          <span aria-hidden="true" />
        </div>
        {/* Stable siblings keep a panel's editor state when it moves between panes. */}
        {available.map((tab) => {
          const pane = current.panes[0].includes(tab.id) ? 0 : 1;
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={panelId(tab.id)}
              aria-labelledby={tabId(tab.id)}
              tabIndex={0}
              className="mizu-dock-panel"
              data-pane={pane}
              hidden={
                current.active[pane] !== tab.id || current.collapsed === pane
              }
            >
              {tab.content}
            </div>
          );
        })}
        {([0, 1] as const).map(
          (pane) =>
            current.panes[pane].length === 0 && (
              <div
                key={`empty-${pane}`}
                className="mizu-dock-panel mizu-dock-empty"
                data-pane={pane}
                hidden={current.collapsed === pane}
              >
                <p>No panels in the {paneName(pane)} pane.</p>
                <p>Move a tab here from the other pane.</p>
              </div>
            ),
        )}
      </div>
      <div className="mizu-dock-footer">
        <p role="status">
          {([0, 1] as const)
            .map(
              (pane) =>
                `${pane === 0 ? "First" : "Second"}: ${current.collapsed === pane ? "collapsed" : (tabOf(current.active[pane])?.label ?? "empty")}`,
            )
            .join(" · ")}
        </p>
        <p>
          On a tab: arrows select; Alt + arrows reorder; Alt + Shift + arrows
          move panes.
        </p>
      </div>
    </section>
  );
}
