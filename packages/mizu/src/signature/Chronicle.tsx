"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "../motion/Preferences.tsx";
import { EASE_EXPO } from "../motion/easings.ts";
import {
  clamp,
  toTime,
  useAnnouncer,
  useControllable,
  useElementSize,
  useLatest,
  useTween,
} from "./internal.ts";
import { formatDuration, formatStamp, timeTicks } from "./time.ts";

export type ChronicleTone =
  "neutral" | "accent" | "success" | "warning" | "danger";
export type ChronicleLane = { id: string; label: string };
export type ChronicleEvent = {
  id: string;
  /** Lane id; events without one share the first lane. */
  lane?: string;
  start: number | Date;
  /** Omit for an instant. */
  end?: number | Date;
  label: string;
  tone?: ChronicleTone;
  /** Shown in the detail panel when the event is selected. */
  detail?: ReactNode;
};
export type ChronicleRange = readonly [number, number];

type Placed = {
  event: ChronicleEvent;
  t0: number;
  t1: number;
  lane: number;
  row: number;
  instant: boolean;
};

const ROW = 30;
const LANE_PAD = 14;
const CHAR = 6.9;

/**
 * Greedy row packing per lane. Each item reserves room for its label at the
 * fit-all scale, so labels never collide there; deeper zooms only gain room.
 */
function place(
  events: readonly ChronicleEvent[],
  laneIds: readonly string[],
  msPerPx: number,
) {
  const byLane = laneIds.map(() => [] as Placed[]);
  for (const event of events) {
    const t0 = toTime(event.start),
      t1 = event.end === undefined ? t0 : Math.max(t0, toTime(event.end));
    if (!Number.isFinite(t0) || !Number.isFinite(t1)) continue;
    const lane = Math.max(0, laneIds.indexOf(event.lane ?? laneIds[0]!));
    byLane[lane]!.push({
      event,
      t0,
      t1,
      lane,
      row: 0,
      instant: event.end === undefined,
    });
  }
  for (const lane of byLane) {
    lane.sort((a, b) => a.t0 - b.t0 || a.t1 - b.t1);
    // Label room may add up to three rows; overlapping spans always get their own.
    const rows: { soft: number; hard: number }[] = [];
    for (const item of lane) {
      const label = (item.event.label.length * CHAR + 24) * msPerPx;
      const inside = !item.instant && item.t1 - item.t0 >= label;
      let row = rows.findIndex((r) => r.soft < item.t0);
      if (row === -1 && rows.length < 3) row = rows.length;
      if (row === -1) row = rows.findIndex((r) => r.hard < item.t0);
      if (row === -1) row = rows.length;
      rows[row] = {
        soft: inside ? item.t1 : item.t1 + label,
        hard: item.t1 + 12 * msPerPx,
      };
      item.row = row;
    }
  }
  return byLane;
}

/**
 * A pannable, zoomable account of what happened when. Lanes separate sources,
 * spans show duration, a playhead can drive other views and every event is
 * reachable from the keyboard.
 */
export function Chronicle({
  label,
  events,
  lanes,
  range,
  defaultRange,
  onRangeChange,
  cursor,
  defaultCursor,
  onCursorChange,
  selected,
  defaultSelected = null,
  onSelectedChange,
  now,
  utc = false,
  minSpan = 1000,
  loading = false,
  empty = "Nothing recorded in this period.",
  className = "",
  style,
}: {
  label: string;
  events: readonly ChronicleEvent[];
  lanes?: readonly ChronicleLane[];
  range?: ChronicleRange;
  defaultRange?: ChronicleRange;
  onRangeChange?: (range: ChronicleRange) => void;
  /** Playhead time in ms. Supply either prop to show the playhead. */
  cursor?: number;
  defaultCursor?: number;
  onCursorChange?: (time: number) => void;
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (id: string | null) => void;
  now?: number | Date;
  utc?: boolean;
  /** Smallest visible interval in ms. */
  minSpan?: number;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const [trackRef, { width }] = useElementSize<HTMLDivElement>();
  const [message, announce] = useAnnouncer();
  const [tween, stopTween] = useTween();
  const inertia = useRef(0);
  useEffect(() => () => cancelAnimationFrame(inertia.current), []);

  const laneList = useMemo<readonly ChronicleLane[]>(() => {
    if (lanes?.length) return lanes;
    const ids = [...new Set(events.map((e) => e.lane ?? ""))];
    return ids.map((lane) => ({ id: lane, label: lane }));
  }, [lanes, events]);
  const laneIds = useMemo(() => laneList.map((l) => l.id), [laneList]);
  const extent = useMemo<ChronicleRange>(() => {
    let lo = Infinity,
      hi = -Infinity;
    for (const e of events) {
      const t0 = toTime(e.start),
        t1 = e.end === undefined ? t0 : toTime(e.end);
      if (!Number.isFinite(t0) || !Number.isFinite(t1)) continue;
      lo = Math.min(lo, t0);
      hi = Math.max(hi, t1);
    }
    if (lo > hi) {
      const t = now === undefined ? 0 : toTime(now);
      return [t - 36e5, t + 36e5];
    }
    const pad = Math.max(hi - lo, minSpan);
    return [lo - pad * 0.05, hi + pad * 0.12];
  }, [events, now, minSpan]);
  const fitScale = width ? (extent[1] - extent[0]) / width : 0;
  const placed = useMemo(
    () => place(events, laneIds, fitScale),
    [events, laneIds, fitScale],
  );
  const flat = useMemo(() => placed.flat(), [placed]);

  const [rangeState, setRangeState] = useControllable<ChronicleRange | null>(
    range,
    defaultRange ?? null,
  );
  // A stored range that no longer overlaps the events falls back to fitting them.
  const view =
    rangeState &&
    rangeState[1] > rangeState[0] &&
    rangeState[1] > extent[0] &&
    rangeState[0] < extent[1]
      ? rangeState
      : extent;
  const [a, b] = view;
  const span = b - a;
  const latestView = useLatest(view);
  const bounds = useLatest({ extent, minSpan });
  const rangeChange = useLatest(onRangeChange);

  const hasPlayhead = cursor !== undefined || defaultCursor !== undefined;
  const [time, setTime] = useControllable<number>(
    cursor,
    defaultCursor ?? extent[0],
    onCursorChange,
  );
  const [chosen, setChosen] = useControllable<string | null>(
    selected,
    defaultSelected,
    onSelectedChange,
  );
  const [focusId, setFocusId] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; id?: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const pendingFocus = useRef<string | null>(null);

  const commit = (next: ChronicleRange) => {
    const {
      extent: [e0, e1],
      minSpan: least,
    } = bounds.current;
    const full = e1 - e0;
    let s = clamp(next[1] - next[0], least, full * 3);
    const mid = (next[0] + next[1]) / 2;
    const lo = clamp(mid - s / 2, e0 - full, e1 + full - s);
    s = Math.max(s, least);
    const r: ChronicleRange = [lo, lo + s];
    setRangeState(r);
    rangeChange.current?.(r);
  };
  const glide = (target: ChronicleRange) => {
    cancelAnimationFrame(inertia.current);
    const [s0, e0] = latestView.current;
    const c0 = (s0 + e0) / 2,
      c1 = (target[0] + target[1]) / 2;
    const l0 = Math.log(e0 - s0),
      l1 = Math.log(target[1] - target[0]);
    tween(reduce ? 0 : 480, (t) => {
      const c = c0 + (c1 - c0) * t,
        s = Math.exp(l0 + (l1 - l0) * t);
      commit([c - s / 2, c + s / 2]);
    });
  };
  const zoom = (factor: number, anchor?: number) => {
    const [s0, e0] = latestView.current;
    const at =
      anchor ??
      (hasPlayhead && time >= s0 && time <= e0 ? time : (s0 + e0) / 2);
    glide([at - (at - s0) * factor, at + (e0 - at) * factor]);
  };
  const x = (t: number) => ((t - a) / span) * width;
  const timeAt = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    return r && r.width ? a + ((clientX - r.left) / r.width) * span : a;
  };

  // Wheel needs a non-passive listener: pinch (ctrl + wheel) zooms, horizontal wheel pans, vertical scrolls the page.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const wheel = (e: WheelEvent) => {
      const [s0, e0] = latestView.current;
      const r = track.getBoundingClientRect();
      if (!r.width) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        cancelAnimationFrame(inertia.current);
        const at = s0 + ((e.clientX - r.left) / r.width) * (e0 - s0);
        const f = Math.exp(clamp(e.deltaY, -60, 60) * 0.012);
        commit([at - (at - s0) * f, at + (e0 - at) * f]);
      } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        cancelAnimationFrame(inertia.current);
        const dt = (e.deltaX / r.width) * (e0 - s0);
        commit([s0 + dt, e0 + dt]);
      }
    };
    track.addEventListener("wheel", wheel, { passive: false });
    return () => track.removeEventListener("wheel", wheel);
    // commit reads only refs and stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Direct manipulation: one pointer pans with inertia, two pointers pinch.
  const pointers = useRef(new Map<number, number>());
  const gesture = useRef<{
    last: number;
    v: number;
    at: number;
    pinch?: number;
  } | null>(null);
  const onTrackDown = (e: PointerEvent<HTMLDivElement>) => {
    if (
      e.button !== 0 ||
      (e.target as HTMLElement).closest("[role='option'], button")
    )
      return;
    cancelAnimationFrame(inertia.current);
    stopTween();
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, e.clientX);
    const xs = [...pointers.current.values()];
    gesture.current = {
      last: e.clientX,
      v: 0,
      at: performance.now(),
      pinch: xs.length === 2 ? Math.abs(xs[0]! - xs[1]!) : undefined,
    };
  };
  const onTrackMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) {
      setHover({ x: e.clientX - e.currentTarget.getBoundingClientRect().left });
      return;
    }
    const g = gesture.current;
    const r = e.currentTarget.getBoundingClientRect();
    if (!g || !r.width) return;
    pointers.current.set(e.pointerId, e.clientX);
    const [s0, e0] = latestView.current;
    const xs = [...pointers.current.values()];
    if (xs.length === 2 && g.pinch) {
      const d = Math.max(8, Math.abs(xs[0]! - xs[1]!));
      const mid = s0 + (((xs[0]! + xs[1]!) / 2 - r.left) / r.width) * (e0 - s0);
      const f = g.pinch / d;
      g.pinch = d;
      commit([mid - (mid - s0) * f, mid + (e0 - mid) * f]);
      return;
    }
    const dx = e.clientX - g.last;
    const dt = (-dx / r.width) * (e0 - s0);
    const stamp = performance.now();
    g.v = dt / Math.max(1, stamp - g.at);
    g.at = stamp;
    g.last = e.clientX;
    commit([s0 + dt, e0 + dt]);
  };
  const onTrackUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;
    if (pointers.current.size) {
      const [left] = pointers.current.values();
      gesture.current = { last: left!, v: 0, at: performance.now() };
      return;
    }
    gesture.current = null;
    setDragging(false);
    if (!g || reduce || performance.now() - g.at > 80) return;
    let v = g.v,
      last = performance.now();
    const drift = (stamp: number) => {
      const dt = stamp - last;
      last = stamp;
      v *= Math.exp(-dt / 280);
      const [s0, e0] = latestView.current;
      if (Math.abs(v * 16) < (e0 - s0) / 4000) return;
      commit([s0 + v * dt, e0 + v * dt]);
      inertia.current = requestAnimationFrame(drift);
    };
    inertia.current = requestAnimationFrame(drift);
  };

  const onTrackKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const [s0, e0] = view;
    const step = (e0 - s0) * (e.shiftKey ? 0.6 : 0.15);
    const [x0, x1] = extent;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => glide([s0 - step, e0 - step]),
      ArrowRight: () => glide([s0 + step, e0 + step]),
      "+": () => zoom(0.6),
      "=": () => zoom(0.6),
      "-": () => zoom(1 / 0.6),
      "0": () => glide(extent),
      Home: () => glide([x0, x0 + (e0 - s0)]),
      End: () => glide([x1 - (e0 - s0), x1]),
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  // Keyboard travel across events: arrows follow time within a lane, up/down change lanes.
  const neighbour = (from: Placed, key: string): Placed | undefined => {
    const lane = placed[from.lane]!;
    const i = lane.indexOf(from);
    if (key === "ArrowLeft") return lane[i - 1];
    if (key === "ArrowRight") return lane[i + 1];
    if (key === "Home") return lane[0];
    if (key === "End") return lane[lane.length - 1];
    const dir = key === "ArrowUp" ? -1 : 1;
    for (let l = from.lane + dir; l >= 0 && l < placed.length; l += dir) {
      const candidates = placed[l]!;
      if (!candidates.length) continue;
      const mid = (from.t0 + from.t1) / 2;
      return candidates.reduce((best, c) =>
        Math.abs((c.t0 + c.t1) / 2 - mid) <
        Math.abs((best.t0 + best.t1) / 2 - mid)
          ? c
          : best,
      );
    }
  };
  const reveal = (p: Placed) => {
    const [s0, e0] = latestView.current;
    const s = e0 - s0;
    if (p.t0 >= s0 + s * 0.04 && p.t1 <= e0 - s * 0.04) return;
    const fits = p.t1 - p.t0 < s * 0.8;
    const target: ChronicleRange = fits
      ? [(p.t0 + p.t1) / 2 - s / 2, (p.t0 + p.t1) / 2 + s / 2]
      : [p.t0 - (p.t1 - p.t0) * 0.25, p.t1 + (p.t1 - p.t0) * 0.25];
    glide(target);
  };
  const onEventKey = (e: KeyboardEvent<HTMLDivElement>, p: Placed) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const next = chosen === p.event.id ? null : p.event.id;
      setChosen(next);
      announce(next ? `Selected ${p.event.label}` : "Selection cleared");
      return;
    }
    if (e.key === "Escape" && chosen) {
      e.preventDefault();
      setChosen(null);
      announce("Selection cleared");
      return;
    }
    const target = neighbour(p, e.key);
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key)
    )
      return;
    e.preventDefault();
    if (!target) return;
    setFocusId(target.event.id);
    pendingFocus.current = target.event.id;
    reveal(target);
  };
  useEffect(() => {
    const idToFocus = pendingFocus.current;
    if (!idToFocus) return;
    const node = nodes.current.get(idToFocus);
    if (node) {
      pendingFocus.current = null;
      node.focus({ preventScroll: true });
    }
  });

  const zoomTo = (p: Placed) => {
    const d = Math.max(p.t1 - p.t0, bounds.current.minSpan * 20);
    glide([p.t0 - d * 0.4, p.t1 + d * 0.4]);
  };

  // Render only what is near the visible interval, plus anything focused or selected.
  const margin = span * 0.25;
  const tabStop =
    focusId ??
    chosen ??
    flat.find((p) => p.t1 >= a && p.t0 <= b)?.event.id ??
    flat[0]?.event.id;
  const visible = (p: Placed) =>
    (p.t1 >= a - margin && p.t0 <= b + margin) ||
    p.event.id === tabStop ||
    p.event.id === chosen;
  const { ticks, context } = useMemo(
    () => timeTicks(a, b, width, { utc }),
    [a, b, width, utc],
  );
  const detail = flat.find((p) => p.event.id === chosen);
  const hovered = hover?.id
    ? flat.find((p) => p.event.id === hover.id)
    : undefined;
  const measured = width > 0;

  const [revealing, setRevealing] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setRevealing(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  const histogram = useMemo(() => {
    const bins = new Array(96).fill(0) as number[];
    const [x0, x1] = extent;
    for (const p of flat) {
      const i = Math.floor(((p.t0 - x0) / (x1 - x0)) * bins.length);
      bins[clamp(i, 0, bins.length - 1)]! += 1;
    }
    const max = Math.max(1, ...bins);
    return bins.map((n) => n / max);
  }, [flat, extent]);

  return (
    <section
      className={`mizu-chronicle ${className}`}
      style={style}
      aria-label={label}
      data-reveal={revealing && !reduce ? "" : undefined}
      data-selecting={chosen ? "" : undefined}
    >
      <header className="mizu-chronicle-bar">
        <h3>{label}</h3>
        <p className="mizu-chronicle-readout" aria-live="off">
          {measured ? (
            <>
              <span>{formatStamp(a, span, utc)}</span>
              <span aria-hidden="true">—</span>
              <span>{formatStamp(b, span, utc)}</span>
              <span className="mizu-chronicle-span">
                {formatDuration(span)}
              </span>
            </>
          ) : (
            " "
          )}
        </p>
        <div className="mizu-chronicle-tools" role="group" aria-label="Zoom">
          <button
            type="button"
            onClick={() => zoom(1 / 0.6)}
            aria-label="Zoom out"
            disabled={span >= (extent[1] - extent[0]) * 2.99}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 6h8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => zoom(0.6)}
            aria-label="Zoom in"
            disabled={span <= minSpan * 1.01}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 6h8M6 2v8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => glide(extent)}
            className="mizu-chronicle-fit"
          >
            Fit
          </button>
        </div>
      </header>

      <div className="mizu-chronicle-body">
        <div className="mizu-chronicle-lanes-head" aria-hidden="true">
          <span className="mizu-chronicle-context">
            {measured ? context : ""}
          </span>
          {laneList.map((lane, i) => (
            <span
              key={lane.id}
              style={{
                height:
                  Math.max(1, ...placed[i]!.map((p) => p.row + 1)) * ROW +
                  LANE_PAD * 2,
              }}
            >
              {lane.label}
            </span>
          ))}
        </div>

        <div
          ref={trackRef}
          className="mizu-chronicle-track"
          role="group"
          aria-roledescription="timeline viewport"
          tabIndex={0}
          aria-label={`${label} viewport`}
          aria-describedby={`${id}-help`}
          onKeyDown={onTrackKey}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
          onPointerCancel={onTrackUp}
          onPointerLeave={() => setHover(null)}
        >
          <div className="mizu-chronicle-axis" aria-hidden="true">
            {ticks.map((tick) => (
              <span
                key={tick.t}
                data-major={tick.major || undefined}
                style={{ transform: `translateX(${x(tick.t)}px)` }}
              >
                {tick.label && <b>{tick.label}</b>}
              </span>
            ))}
            {hovered && (
              <i
                className="mizu-chronicle-extent"
                style={{
                  transform: `translateX(${x(hovered.t0)}px)`,
                  width: Math.max(2, x(hovered.t1) - x(hovered.t0)),
                }}
              />
            )}
          </div>

          <div className="mizu-chronicle-grid" aria-hidden="true">
            {ticks
              .filter((t) => t.major)
              .map((tick) => (
                <span
                  key={tick.t}
                  style={{ transform: `translateX(${x(tick.t)}px)` }}
                />
              ))}
          </div>

          <div
            className="mizu-chronicle-events"
            role="listbox"
            aria-label={`${label} events`}
            aria-describedby={`${id}-keys`}
          >
            {placed.map((lane, laneIndex) => {
              const rows = Math.max(1, ...lane.map((p) => p.row + 1));
              const shown = measured ? lane.filter(visible) : [];
              const next = new Map<Placed, number>();
              const lastInRow: (Placed | undefined)[] = [];
              for (const p of shown) {
                const previous = lastInRow[p.row];
                if (previous) next.set(previous, x(p.t0) - (p.instant ? 6 : 0));
                lastInRow[p.row] = p;
              }
              const free: number[] = [];
              return (
                <div
                  key={laneList[laneIndex]!.id}
                  role="group"
                  aria-label={laneList[laneIndex]!.label || label}
                  data-name={laneList[laneIndex]!.label || undefined}
                  className="mizu-chronicle-lane"
                  style={{ height: rows * ROW + LANE_PAD * 2 }}
                >
                  {shown.map((p) => {
                    const left = x(p.t0);
                    const w = p.instant ? 0 : Math.max(6, x(p.t1) - left);
                    const text = p.event.label.length * CHAR + 14;
                    const inside = !p.instant && w >= text + 10;
                    const start = inside
                      ? left
                      : left + w + (p.instant ? 10 : 6);
                    const fits =
                      inside ||
                      (start >= (free[p.row] ?? -Infinity) &&
                        start + text <= (next.get(p) ?? Infinity));
                    free[p.row] = fits
                      ? start + (inside ? w : text)
                      : Math.max(free[p.row] ?? 0, left + w + 4);
                    const stamp = p.instant
                      ? formatStamp(p.t0, span, utc)
                      : `${formatStamp(p.t0, span, utc)} to ${formatStamp(p.t1, span, utc)}, ${formatDuration(p.t1 - p.t0)}`;
                    return (
                      <div
                        key={p.event.id}
                        ref={(node) => {
                          if (node) nodes.current.set(p.event.id, node);
                          else nodes.current.delete(p.event.id);
                        }}
                        id={`${id}-${p.event.id}`}
                        role="option"
                        aria-selected={chosen === p.event.id}
                        aria-label={`${p.event.label}, ${stamp}`}
                        tabIndex={tabStop === p.event.id ? 0 : -1}
                        className="mizu-chronicle-event"
                        data-kind={p.instant ? "instant" : "span"}
                        data-tone={p.event.tone ?? "neutral"}
                        data-label={
                          fits ? (inside ? "inside" : "after") : "hidden"
                        }
                        style={
                          {
                            transform: `translate(${left}px, ${LANE_PAD + p.row * ROW}px)`,
                            width: p.instant ? undefined : w,
                            "--mizu-reveal": clamp(
                              left / Math.max(1, width),
                              0,
                              1,
                            ),
                          } as CSSProperties
                        }
                        onFocus={() => setFocusId(p.event.id)}
                        onKeyDown={(e) => onEventKey(e, p)}
                        onClick={() => {
                          setFocusId(p.event.id);
                          setChosen(chosen === p.event.id ? null : p.event.id);
                        }}
                        onDoubleClick={() => zoomTo(p)}
                        onPointerEnter={() =>
                          setHover({ x: left, id: p.event.id })
                        }
                      >
                        <span
                          className="mizu-chronicle-mark"
                          aria-hidden="true"
                        />
                        <span
                          className="mizu-chronicle-label"
                          aria-hidden="true"
                        >
                          {p.event.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {measured &&
            now !== undefined &&
            toTime(now) >= a &&
            toTime(now) <= b && (
              <div
                className="mizu-chronicle-now"
                style={{ transform: `translateX(${x(toTime(now))}px)` }}
                aria-hidden="true"
              >
                <span>Now</span>
              </div>
            )}
          {measured && hover && !dragging && (
            <div
              className="mizu-chronicle-ghost"
              style={{ transform: `translateX(${hover.x}px)` }}
              aria-hidden="true"
            />
          )}
          {measured && hasPlayhead && time >= a && time <= b && (
            <div
              className="mizu-chronicle-playhead"
              style={{ transform: `translateX(${x(time)}px)` }}
            >
              <span
                role="slider"
                tabIndex={0}
                aria-label="Playhead"
                aria-valuemin={Math.round(extent[0])}
                aria-valuemax={Math.round(extent[1])}
                aria-valuenow={Math.round(time)}
                aria-valuetext={formatStamp(time, span, utc)}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (e.currentTarget.hasPointerCapture(e.pointerId))
                    setTime(clamp(timeAt(e.clientX), extent[0], extent[1]));
                }}
                onKeyDown={(e) => {
                  const unit = span / (e.shiftKey ? 8 : 60);
                  const next =
                    e.key === "ArrowLeft"
                      ? time - unit
                      : e.key === "ArrowRight"
                        ? time + unit
                        : e.key === "Home"
                          ? a
                          : e.key === "End"
                            ? b
                            : null;
                  if (next === null) return;
                  e.preventDefault();
                  setTime(clamp(next, extent[0], extent[1]));
                }}
              />
              <output>{formatStamp(time, span, utc)}</output>
            </div>
          )}
          {!loading && measured && !flat.length && (
            <p className="mizu-chronicle-empty">{empty}</p>
          )}
          {loading && (
            <div
              className="mizu-chronicle-loading mizu-sig-scan"
              role="status"
              aria-label="Loading events"
            >
              {Array.from({ length: Math.max(3, laneList.length) }, (_, i) => (
                <span key={i} style={{ "--mizu-row": i } as CSSProperties} />
              ))}
            </div>
          )}
          {hasPlayhead && (
            <button
              type="button"
              className="mizu-chronicle-scrub"
              tabIndex={-1}
              aria-hidden="true"
              onPointerDown={(e) => {
                e.stopPropagation();
                setTime(clamp(timeAt(e.clientX), extent[0], extent[1]));
              }}
            />
          )}
        </div>
      </div>

      <Overview
        histogram={histogram}
        extent={extent}
        view={view}
        onPan={(next) => {
          cancelAnimationFrame(inertia.current);
          commit(next);
        }}
        onGlide={glide}
      />

      <p id={`${id}-help`} className="mizu-sr-only">
        Arrow keys pan, plus and minus zoom, 0 fits every event, Home and End
        jump to the edges. Pinch or Control-scroll to zoom.
      </p>
      <p id={`${id}-keys`} className="mizu-sr-only">
        Left and right move through a lane, up and down change lanes, Enter
        selects, Escape clears.
      </p>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        {detail && (
          <motion.section
            key={detail.event.id}
            className="mizu-chronicle-detail"
            aria-label={`${detail.event.label} details`}
            data-tone={detail.event.tone ?? "neutral"}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, y: -6 }
            }
            transition={{ duration: reduce ? 0 : 0.32, ease: EASE_EXPO }}
          >
            <div className="mizu-chronicle-detail-head">
              <h4>
                <span
                  aria-hidden="true"
                  className="mizu-chronicle-mark"
                  data-kind={detail.instant ? "instant" : "span"}
                />
                {detail.event.label}
              </h4>
              <p>
                {formatStamp(detail.t0, detail.t1 - detail.t0 || span, utc)}
                {!detail.instant &&
                  ` — ${formatStamp(detail.t1, detail.t1 - detail.t0, utc)} · ${formatDuration(detail.t1 - detail.t0)}`}
                {laneList[detail.lane]?.label &&
                  ` · ${laneList[detail.lane]!.label}`}
              </p>
            </div>
            {detail.event.detail && (
              <div className="mizu-chronicle-detail-body">
                {detail.event.detail}
              </div>
            )}
            <div className="mizu-chronicle-detail-actions">
              <button
                type="button"
                className="mizu-text-button"
                onClick={() => zoomTo(detail)}
              >
                Zoom to event
              </button>
              {hasPlayhead && (
                <button
                  type="button"
                  className="mizu-text-button"
                  onClick={() => setTime(detail.t0)}
                >
                  Move playhead here
                </button>
              )}
              <button
                type="button"
                className="mizu-text-button"
                onClick={() => setChosen(null)}
              >
                Clear selection
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </section>
  );
}

function Overview({
  histogram,
  extent,
  view,
  onPan,
  onGlide,
}: {
  histogram: number[];
  extent: ChronicleRange;
  view: ChronicleRange;
  onPan: (range: ChronicleRange) => void;
  onGlide: (range: ChronicleRange) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    mode: "move" | "start" | "end";
    x: number;
    view: ChronicleRange;
  } | null>(null);
  const full = extent[1] - extent[0];
  const left = clamp(((view[0] - extent[0]) / full) * 100, 0, 100);
  const right = clamp(((view[1] - extent[0]) / full) * 100, 0, 100);
  return (
    <div
      ref={ref}
      className="mizu-chronicle-overview"
      aria-hidden="true"
      onPointerDown={(e) => {
        const r = ref.current!.getBoundingClientRect();
        if (!r.width || e.button !== 0) return;
        const handle = (e.target as HTMLElement).dataset.handle as
          "start" | "end" | "move" | undefined;
        if (!handle) {
          const at = extent[0] + ((e.clientX - r.left) / r.width) * full;
          const s = view[1] - view[0];
          onGlide([at - s / 2, at + s / 2]);
          return;
        }
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { mode: handle, x: e.clientX, view };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        const r = ref.current!.getBoundingClientRect();
        if (!d || !r.width) return;
        const dt = ((e.clientX - d.x) / r.width) * full;
        const [s0, e0] = d.view;
        if (d.mode === "move") onPan([s0 + dt, e0 + dt]);
        else if (d.mode === "start")
          onPan([Math.min(s0 + dt, e0 - full / 400), e0]);
        else onPan([s0, Math.max(e0 + dt, s0 + full / 400)]);
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <svg viewBox={`0 0 ${histogram.length} 1`} preserveAspectRatio="none">
        {histogram.map((h, i) => (
          <rect
            key={i}
            x={i + 0.18}
            width={0.64}
            y={1 - Math.max(0.04, h)}
            height={Math.max(0.04, h)}
          />
        ))}
      </svg>
      <span
        className="mizu-chronicle-shade"
        style={{ left: 0, width: `${left}%` }}
      />
      <span
        className="mizu-chronicle-shade"
        style={{ left: `${right}%`, right: 0 }}
      />
      <span
        className="mizu-chronicle-brush"
        data-handle="move"
        style={{ left: `${left}%`, width: `${Math.max(0.6, right - left)}%` }}
      >
        <i data-handle="start" />
        <i data-handle="end" />
      </span>
    </div>
  );
}
