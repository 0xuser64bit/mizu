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
import { useReducedMotion } from "../motion/Preferences";
import {
  clamp,
  toTime,
  type Interval,
  type SignatureTone,
  useAnnouncer,
  useControllable,
  useElementSize,
  useLatest,
  useTween,
} from "./internal";
import { formatDuration, formatStamp, numberTicks, timeTicks } from "./time";

export type TrendPoint = { x: number | Date; y: number | null };
export type TrendSeries = {
  id: string;
  label: string;
  data: readonly TrendPoint[];
  tone?: SignatureTone;
  /** Fill beneath the line. */
  area?: boolean;
  /** A dashed stroke, e.g. for a previous period or forecast. */
  dashed?: boolean;
};
export type TrendAnnotation = {
  id: string;
  x: number | Date;
  label: string;
  detail?: ReactNode;
};
export type TrendThreshold = { y: number; label: string; tone?: SignatureTone };

type Pt = { x: number; y: number | null };
type Prepared = TrendSeries & { tone: SignatureTone; points: Pt[] };

const TONES: SignatureTone[] = [
  "accent",
  "paper",
  "muted",
  "success",
  "warning",
  "danger",
];
const PAD = { top: 30, right: 12, bottom: 30, left: 0 };
const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Nearest index by x in an x-sorted array. */
function nearest(points: readonly Pt[], x: number) {
  let lo = 0,
    hi = points.length - 1;
  if (hi < 0) return -1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid]!.x < x) lo = mid;
    else hi = mid;
  }
  return Math.abs(points[lo]!.x - x) <= Math.abs(points[hi]!.x - x) ? lo : hi;
}

/** Keeps each pixel column's first, lowest, highest and last point, so peaks survive. */
function decimate(
  points: readonly Pt[],
  x0: number,
  x1: number,
  columns: number,
) {
  const first = Math.max(0, nearest(points, x0) - 1),
    last = Math.min(points.length - 1, nearest(points, x1) + 1);
  const slice = points.slice(first, last + 1);
  if (slice.length <= columns * 3) return slice;
  const out: Pt[] = [];
  const width = (x1 - x0) / columns;
  let bucket: Pt[] = [];
  let index = Math.floor((slice[0]!.x - x0) / width);
  const flush = () => {
    if (!bucket.length) return;
    const valued = bucket.filter((p) => p.y !== null);
    const low = valued.reduce<Pt | undefined>(
      (m, p) => (!m || p.y! < m.y! ? p : m),
      undefined,
    );
    const high = valued.reduce<Pt | undefined>(
      (m, p) => (!m || p.y! > m.y! ? p : m),
      undefined,
    );
    const keep = new Set(
      [bucket[0]!, low, high, bucket[bucket.length - 1]!].filter(
        Boolean,
      ) as Pt[],
    );
    out.push(...bucket.filter((p) => keep.has(p) || p.y === null));
    bucket = [];
  };
  for (const p of slice) {
    const i = Math.floor((p.x - x0) / width);
    if (i !== index) {
      flush();
      index = i;
    }
    bucket.push(p);
  }
  flush();
  return out;
}

/**
 * An instrument for values over time: a live legend doubles as the readout,
 * dragging measures change across a period, and every reading is reachable
 * from the keyboard or as a table.
 */
export function TrendChart({
  label,
  series,
  annotations = [],
  thresholds = [],
  format = (v) => compact.format(v),
  formatX,
  xType = "time",
  utc = false,
  height = 300,
  zero,
  range,
  defaultRange,
  onRangeChange,
  cursor,
  onCursorChange,
  loading = false,
  empty = "No readings in this range.",
  className = "",
  style,
}: {
  label: string;
  series: readonly TrendSeries[];
  annotations?: readonly TrendAnnotation[];
  thresholds?: readonly TrendThreshold[];
  format?: (value: number) => string;
  formatX?: (x: number) => string;
  xType?: "time" | "number";
  utc?: boolean;
  /** Plot height in pixels. */
  height?: number;
  /** Keep zero on the value axis. Defaults to true when any series fills an area. */
  zero?: boolean;
  range?: Interval;
  defaultRange?: Interval;
  onRangeChange?: (range: Interval) => void;
  /** x of the crosshair, or null. Control it to synchronise several views. */
  cursor?: number | null;
  onCursorChange?: (x: number | null) => void;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const clipId = `${id.replace(/[^\w-]/g, "")}-plot`;
  const reduce = useReducedMotion();
  const [plotRef, { width }] = useElementSize<HTMLDivElement>();
  const [message, announce] = useAnnouncer();
  const [tweenX, stopX] = useTween();
  const [tweenY] = useTween();

  const prepared = useMemo<Prepared[]>(
    () =>
      series.map((s, i) => ({
        ...s,
        tone: s.tone ?? TONES[i % TONES.length]!,
        points: s.data
          .map((p) => ({
            x: toTime(p.x),
            y: p.y !== null && Number.isFinite(p.y) ? p.y : null,
          }))
          .filter((p) => Number.isFinite(p.x))
          .sort((a, b) => a.x - b.x),
      })),
    [series],
  );
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const shown = useMemo(
    () => prepared.filter((s) => !hidden.has(s.id)),
    [prepared, hidden],
  );
  const extent = useMemo<Interval>(() => {
    let lo = Infinity,
      hi = -Infinity;
    for (const s of prepared)
      if (s.points.length) {
        lo = Math.min(lo, s.points[0]!.x);
        hi = Math.max(hi, s.points[s.points.length - 1]!.x);
      }
    return lo < hi ? [lo, hi] : lo === hi ? [lo - 1, hi + 1] : [0, 1];
  }, [prepared]);

  const [rangeState, setRangeState] = useControllable<Interval | null>(
    range,
    defaultRange ?? null,
  );
  // A stored range from other data falls back to the full extent.
  const view =
    rangeState &&
    rangeState[1] > rangeState[0] &&
    rangeState[0] >= extent[0] - 1e-6 &&
    rangeState[1] <= extent[1] + 1e-6
      ? rangeState
      : extent;
  const [x0, x1] = view;
  const viewRef = useLatest(view);
  const rangeChangeRef = useLatest(onRangeChange);
  const commit = (next: Interval) => {
    const [e0, e1] = extent;
    const full = e1 - e0;
    const s = clamp(next[1] - next[0], full / 2000, full);
    const lo = clamp(next[0], e0, e1 - s);
    const d: Interval = [lo, lo + s];
    setRangeState(d);
    rangeChangeRef.current?.(d);
  };
  const glide = (target: Interval) => {
    const [a0, b0] = viewRef.current;
    tweenX(reduce ? 0 : 520, (t) =>
      commit([a0 + (target[0] - a0) * t, b0 + (target[1] - b0) * t]),
    );
  };

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = Math.max(40, height - PAD.top - PAD.bottom);
  const baseline = zero ?? prepared.some((s) => s.area);

  // The value axis follows the visible data and eases when it changes.
  const target = useMemo(() => {
    let lo = Infinity,
      hi = -Infinity;
    for (const s of shown)
      for (const p of s.points)
        if (p.y !== null && p.x >= x0 && p.x <= x1) {
          lo = Math.min(lo, p.y);
          hi = Math.max(hi, p.y);
        }
    for (const t of thresholds) {
      lo = Math.min(lo, t.y);
      hi = Math.max(hi, t.y);
    }
    if (lo > hi) return { lo: 0, hi: 1, step: 0.5 };
    if (baseline) {
      lo = Math.min(0, lo);
      hi = Math.max(0, hi);
    }
    const ticks = numberTicks(lo, hi, Math.max(2, Math.floor(plotH / 64)));
    return {
      lo: ticks[0]!,
      hi: ticks[ticks.length - 1]!,
      step: ticks[1]! - ticks[0]!,
    };
  }, [shown, thresholds, x0, x1, baseline, plotH]);
  const [yView, setYView] = useState<readonly [number, number]>([
    target.lo,
    target.hi,
  ]);
  useEffect(() => {
    const [a, b] = yView;
    if (a === target.lo && b === target.hi) return;
    tweenY(reduce ? 0 : 420, (t) =>
      setYView([a + (target.lo - a) * t, b + (target.hi - b) * t]),
    );
    // yView is read as the start of the tween, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.lo, target.hi, reduce, tweenY]);

  const [y0, y1] = yView;
  const sx = (x: number) => PAD.left + ((x - x0) / (x1 - x0 || 1)) * plotW;
  const sy = (y: number) => PAD.top + (1 - (y - y0) / (y1 - y0 || 1)) * plotH;
  const invert = (px: number) =>
    x0 + ((px - PAD.left) / (plotW || 1)) * (x1 - x0);

  const paths = useMemo(() => {
    if (!plotW) return [];
    return prepared.map((s) => {
      const pts = decimate(s.points, x0, x1, Math.ceil(plotW));
      let line = "",
        area = "",
        run: Pt[] = [];
      const close = () => {
        if (run.length && s.area)
          area += `M${sx(run[0]!.x)},${sy(Math.max(y0, Math.min(0, y1)))}${run.map((p) => `L${sx(p.x)},${sy(p.y!)}`).join("")}L${sx(run[run.length - 1]!.x)},${sy(Math.max(y0, Math.min(0, y1)))}Z`;
        run = [];
      };
      for (const p of pts) {
        if (p.y === null) {
          close();
          continue;
        }
        line += `${run.length ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`;
        run.push(p);
      }
      close();
      return { id: s.id, line, area };
    });
    // sx / sy close over x0, x1, y0, y1 and plotW, listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepared, x0, x1, y0, y1, plotW, plotH]);

  const [cursorState, setCursor] = useControllable<number | null>(
    cursor,
    null,
    onCursorChange,
  );
  const [measure, setMeasure] = useState<readonly [number, number] | null>(
    null,
  );
  const [focusNote, setFocusNote] = useState<string | null>(null);
  const primary = shown[0] ?? prepared[0];
  const snap = (x: number) => {
    const points = primary?.points ?? [];
    const i = nearest(points, x);
    return i === -1 ? x : points[i]!.x;
  };
  const valueAt = (s: Prepared, x: number) => {
    const i = nearest(s.points, x);
    const p = s.points[i];
    return p && Math.abs(p.x - x) <= (x1 - x0) / 20 ? p.y : null;
  };
  const fx = (x: number) =>
    formatX
      ? formatX(x)
      : xType === "time"
        ? formatStamp(x, x1 - x0, utc)
        : String(x);
  const valueText = (s: Prepared, x: number) => {
    const v = valueAt(s, x);
    return v === null ? "no reading" : format(v);
  };
  const readout = (x: number) =>
    `${fx(x)} — ${shown.map((s) => `${s.label} ${valueText(s, x)}`).join(", ")}`;

  // Pointer: hover reads, drag measures, a tap places the crosshair.
  const drag = useRef<{ start: number; px: number; moved: boolean } | null>(
    null,
  );
  const localX = (e: PointerEvent<HTMLDivElement>) =>
    e.clientX - e.currentTarget.getBoundingClientRect().left;
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !plotW) return;
    stopX();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { start: invert(localX(e)), px: localX(e), moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!plotW) return;
    const px = clamp(localX(e), PAD.left, PAD.left + plotW);
    const d = drag.current;
    if (d && (d.moved || Math.abs(px - d.px) > 4)) {
      d.moved = true;
      const a = snap(d.start),
        b = snap(invert(px));
      setMeasure(a <= b ? [a, b] : [b, a]);
      setCursor(b);
      return;
    }
    if (e.pointerType === "mouse") setCursor(snap(invert(px)));
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) {
      setMeasure(null);
      setCursor(snap(invert(clamp(localX(e), PAD.left, PAD.left + plotW))));
    } else if (measure && measure[0] === measure[1]) setMeasure(null);
  };

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const wheel = (e: WheelEvent) => {
      const [a, b] = viewRef.current;
      const r = plot.getBoundingClientRect();
      if (!r.width) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const at =
          a +
          ((e.clientX - r.left - PAD.left) / (r.width - PAD.left - PAD.right)) *
            (b - a);
        const f = Math.exp(clamp(e.deltaY, -60, 60) * 0.012);
        commit([at - (at - a) * f, at + (b - at) * f]);
      } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        const shift = (e.deltaX / r.width) * (b - a);
        commit([a + shift, b + shift]);
      }
    };
    plot.addEventListener("wheel", wheel, { passive: false });
    return () => plot.removeEventListener("wheel", wheel);
    // commit reads refs and the latest extent through closure refresh on re-subscribe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extent]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const points = primary?.points.filter((p) => p.x >= x0 && p.x <= x1) ?? [];
    if (!points.length) return;
    const at = cursorState ?? points[0]!.x;
    const i = nearest(points, at);
    const move = (to: number) => {
      const x = points[clamp(to, 0, points.length - 1)]!.x;
      if (e.shiftKey) {
        const anchor = measure
          ? measure[0] === at
            ? measure[1]
            : measure[0]
          : at;
        setMeasure(anchor <= x ? [anchor, x] : [x, anchor]);
      } else setMeasure(null);
      setCursor(x);
      announce(readout(x));
    };
    const step = e.altKey ? 10 : 1;
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(cursorState === null ? 0 : i + step),
      ArrowLeft: () =>
        move(cursorState === null ? points.length - 1 : i - step),
      Home: () => move(0),
      End: () => move(points.length - 1),
      Enter: () => measure && zoomTo(measure),
      Escape: () => {
        setMeasure(null);
        setCursor(null);
      },
      "+": () => zoom(0.5),
      "=": () => zoom(0.5),
      "-": () => zoom(2),
      "0": () => glide(extent),
    };
    const action = keys[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };
  const zoom = (factor: number) => {
    const [a, b] = view;
    const at = cursorState ?? (a + b) / 2;
    glide([at - (at - a) * factor, at + (b - at) * factor]);
  };
  const zoomTo = (range: readonly [number, number]) => {
    setMeasure(null);
    glide(range[1] > range[0] ? range : view);
  };

  const measured = plotW > 0;
  const xTicks = useMemo(
    () =>
      !measured
        ? []
        : xType === "time"
          ? timeTicks(x0, x1, plotW, { utc, spacing: 96 }).ticks.filter(
              (t) => t.major,
            )
          : numberTicks(x0, x1, Math.max(2, Math.floor(plotW / 110)))
              .filter((t) => t >= x0 && t <= x1)
              .map((t) => ({
                t,
                label: formatX ? formatX(t) : String(t),
                major: true,
              })),
    [measured, xType, x0, x1, plotW, utc, formatX],
  );
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    for (
      let v = Math.ceil((y0 - 1e-9) / target.step) * target.step;
      v <= y1 + 1e-9;
      v += target.step
    )
      ticks.push(Number(v.toPrecision(12)));
    return ticks;
  }, [y0, y1, target.step]);
  const [table, setTable] = useState(false);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setDrawn(true), 1600);
    return () => window.clearTimeout(t);
  }, []);
  const hasData = prepared.some((s) => s.points.some((p) => p.y !== null));
  const visibleAnnotations = annotations
    .map((a, i) => ({
      ...a,
      t: toTime(a.x),
      number: String(i + 1).padStart(2, "0"),
    }))
    .filter((a) => a.t >= x0 && a.t <= x1);
  const activeNote = annotations.find((a) => a.id === focusNote);

  const delta = (s: Prepared) => {
    if (!measure) return null;
    const a = valueAt(s, measure[0]),
      b = valueAt(s, measure[1]);
    let peak: number | null = null;
    for (const p of s.points)
      if (
        p.x >= measure[0] &&
        p.x <= measure[1] &&
        p.y !== null &&
        (peak === null || p.y > peak)
      )
        peak = p.y;
    if (a === null || b === null)
      return peak === null ? null : { abs: null, pct: null, peak };
    const pct = a !== 0 ? ((b - a) / Math.abs(a)) * 100 : null;
    return { abs: b - a, pct, peak };
  };
  const signed = (v: number) =>
    `${v > 0 ? "+" : v < 0 ? "−" : "±"}${format(Math.abs(v))}`;

  return (
    <figure
      className={`mizu-trend ${className}`}
      style={style}
      aria-labelledby={`${id}-title`}
      data-drawn={drawn || reduce ? "" : undefined}
    >
      <figcaption className="mizu-trend-head">
        <span id={`${id}-title`} className="mizu-trend-title">
          {label}
        </span>
        <div className="mizu-trend-legend" role="group" aria-label="Series">
          {prepared.map((s) => {
            const on = !hidden.has(s.id);
            const x = measure
              ? measure[1]
              : (cursorState ?? s.points[s.points.length - 1]?.x);
            const v = x === undefined || x === null ? null : valueAt(s, x);
            const d = delta(s);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                data-tone={s.tone}
                data-dashed={s.dashed || undefined}
                disabled={on && shown.length === 1}
                onClick={() =>
                  setHidden((h) => {
                    const next = new Set(h);
                    if (next.has(s.id)) next.delete(s.id);
                    else next.add(s.id);
                    return next;
                  })
                }
              >
                <i aria-hidden="true" />
                <span>{s.label}</span>
                <b aria-live="off">
                  {measure && on
                    ? d?.abs != null
                      ? `${signed(d.abs)}${d.pct === null ? "" : ` · ${d.pct > 0 ? "+" : ""}${d.pct.toFixed(1)}%`}`
                      : "—"
                    : v === null
                      ? "—"
                      : format(v)}
                </b>
                {measure && on && d?.peak != null && (
                  <small>Peak {format(d.peak)}</small>
                )}
              </button>
            );
          })}
        </div>
      </figcaption>

      {table ? (
        <TrendTable
          series={shown}
          x0={x0}
          x1={x1}
          fx={fx}
          format={format}
          label={label}
        />
      ) : (
        <div
          ref={plotRef}
          className="mizu-trend-plot"
          style={{ height }}
          role="group"
          aria-roledescription="chart"
          aria-label={`${label}. ${hasData && measured ? `${fx(x0)} to ${fx(x1)}.` : ""}`}
          aria-describedby={`${id}-help`}
          tabIndex={0}
          onKeyDown={onKey}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse" && !drag.current && !measure)
              setCursor(null);
          }}
          onDoubleClick={() => glide(extent)}
        >
          {measured && (
            <svg width={width} height={height} aria-hidden="true">
              <defs>
                <clipPath id={clipId}>
                  <rect x={PAD.left} y={0} width={plotW} height={height} />
                </clipPath>
              </defs>
              <g className="mizu-trend-grid">
                {yTicks.map((t) => (
                  <g key={t} transform={`translate(0 ${sy(t)})`}>
                    <line x1={PAD.left} x2={PAD.left + plotW} />
                    <text x={PAD.left} y={-6}>
                      {format(t)}
                    </text>
                  </g>
                ))}
              </g>
              <g
                className="mizu-trend-axis"
                transform={`translate(0 ${PAD.top + plotH})`}
              >
                {xTicks.map((t) => (
                  <g key={t.t} transform={`translate(${sx(t.t)} 0)`}>
                    <line y2={5} />
                    <text x={5} y={20}>
                      {t.label}
                    </text>
                  </g>
                ))}
              </g>
              {measure && (
                <g className="mizu-trend-measure">
                  <rect
                    x={sx(measure[0])}
                    y={PAD.top}
                    width={Math.max(1, sx(measure[1]) - sx(measure[0]))}
                    height={plotH}
                  />
                  <line
                    x1={sx(measure[0])}
                    x2={sx(measure[0])}
                    y1={PAD.top}
                    y2={PAD.top + plotH}
                  />
                  <line
                    x1={sx(measure[1])}
                    x2={sx(measure[1])}
                    y1={PAD.top}
                    y2={PAD.top + plotH}
                  />
                </g>
              )}
              {thresholds.map((t) => (
                <g
                  key={t.label}
                  className="mizu-trend-threshold"
                  data-tone={t.tone ?? "warning"}
                  transform={`translate(0 ${sy(t.y)})`}
                >
                  <line x1={PAD.left} x2={PAD.left + plotW} />
                  <text x={PAD.left + plotW} y={-6} textAnchor="end">
                    {t.label}
                  </text>
                </g>
              ))}
              {paths.map((p) => {
                const s = prepared.find((q) => q.id === p.id)!;
                return (
                  <g
                    key={p.id}
                    className="mizu-trend-series"
                    clipPath={`url(#${clipId})`}
                    data-tone={s.tone}
                    data-hidden={hidden.has(p.id) || undefined}
                  >
                    {p.area && <path className="mizu-trend-area" d={p.area} />}
                    <path
                      className="mizu-trend-line"
                      d={p.line}
                      pathLength={s.dashed ? undefined : 1}
                      data-dashed={s.dashed || undefined}
                    />
                  </g>
                );
              })}
              {visibleAnnotations.map((a) => (
                <g
                  key={a.id}
                  className="mizu-trend-note"
                  transform={`translate(${sx(a.t)} 0)`}
                  data-active={focusNote === a.id || undefined}
                >
                  <line y1={PAD.top - 8} y2={PAD.top + plotH} />
                  <rect
                    x={-4}
                    y={PAD.top - 19}
                    width={8}
                    height={8}
                    transform={`rotate(45 0 ${PAD.top - 15})`}
                  />
                  <text x={9} y={PAD.top - 11}>
                    {a.number}
                  </text>
                </g>
              ))}
              {cursorState !== null &&
                cursorState >= x0 &&
                cursorState <= x1 && (
                  <g
                    className="mizu-trend-cursor"
                    transform={`translate(${sx(cursorState)} 0)`}
                  >
                    <line y1={PAD.top} y2={PAD.top + plotH} />
                    {shown.map((s) => {
                      const v = valueAt(s, cursorState);
                      return v === null ? null : (
                        <rect
                          key={s.id}
                          data-tone={s.tone}
                          x={-4}
                          y={sy(v) - 4}
                          width={8}
                          height={8}
                          transform={`rotate(45 0 ${sy(v)})`}
                        />
                      );
                    })}
                  </g>
                )}
            </svg>
          )}
          {measured &&
            cursorState !== null &&
            cursorState >= x0 &&
            cursorState <= x1 && (
              <output
                className="mizu-trend-stamp"
                style={{
                  transform: `translateX(${clamp(sx(cursorState), 48, width - 48)}px) translateX(-50%)`,
                  top: PAD.top + plotH + 7,
                }}
              >
                {fx(cursorState)}
              </output>
            )}
          {measured &&
            visibleAnnotations.map((a) => (
              <button
                key={a.id}
                type="button"
                className="mizu-trend-note-hit"
                style={{
                  transform: `translateX(${sx(a.t)}px)`,
                  top: PAD.top - 30,
                }}
                aria-label={`Annotation: ${a.label}`}
                aria-expanded={focusNote === a.id}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  setFocusNote(focusNote === a.id ? null : a.id);
                  setCursor(snap(a.t));
                }}
              />
            ))}
          {!loading && measured && !hasData && (
            <p className="mizu-trend-empty">{empty}</p>
          )}
          {loading && (
            <div
              className="mizu-trend-loading mizu-sig-scan"
              role="status"
              aria-label="Loading readings"
            />
          )}
        </div>
      )}

      <div className="mizu-trend-foot">
        {measure ? (
          <>
            <p>
              <span>Measured</span> {fx(measure[0])} → {fx(measure[1])}
              {xType === "time" &&
                ` · ${formatDuration(measure[1] - measure[0])}`}
            </p>
            <button
              type="button"
              className="mizu-text-button"
              onClick={() => zoomTo(measure)}
            >
              Zoom to period
            </button>
            <button
              type="button"
              className="mizu-text-button"
              onClick={() => setMeasure(null)}
            >
              Clear
            </button>
          </>
        ) : activeNote ? (
          <>
            <p>
              <span>
                {String(annotations.indexOf(activeNote) + 1).padStart(2, "0")}
              </span>{" "}
              {activeNote.label}
              {activeNote.detail && <small>{activeNote.detail}</small>}
            </p>
            <button
              type="button"
              className="mizu-text-button"
              onClick={() => setFocusNote(null)}
            >
              Close note
            </button>
          </>
        ) : (
          <p className="mizu-trend-hint">
            {x1 - x0 < extent[1] - extent[0] - 1e-6 ? (
              <button
                type="button"
                className="mizu-text-button"
                onClick={() => glide(extent)}
              >
                Show the whole range
              </button>
            ) : (
              "Drag across the chart to measure a period."
            )}
          </p>
        )}
        <button
          type="button"
          className="mizu-text-button mizu-trend-toggle"
          aria-pressed={table}
          onClick={() => setTable(!table)}
        >
          {table ? "View as chart" : "View as table"}
        </button>
      </div>
      <p id={`${id}-help`} className="mizu-sr-only">
        Left and right arrows read each value; Shift extends a measured period
        and Enter zooms to it. Plus and minus zoom, 0 shows the whole range,
        Escape clears.
      </p>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </figure>
  );
}

function TrendTable({
  series,
  x0,
  x1,
  fx,
  format,
  label,
}: {
  series: Prepared[];
  x0: number;
  x1: number;
  fx: (x: number) => string;
  format: (v: number) => string;
  label: string;
}) {
  const xs = [
    ...new Set(
      series.flatMap((s) =>
        s.points.filter((p) => p.x >= x0 && p.x <= x1).map((p) => p.x),
      ),
    ),
  ].sort((a, b) => a - b);
  // ponytail: rows are thinned to 240 evenly spaced readings; export raw data for complete tables.
  const stride = Math.max(1, Math.ceil(xs.length / 240));
  const rows = xs.filter((_, i) => i % stride === 0);
  const lookup = series.map((s) => new Map(s.points.map((p) => [p.x, p.y])));
  return (
    <div
      className="mizu-table-scroll mizu-trend-table"
      tabIndex={0}
      role="region"
      aria-label={`${label} readings`}
    >
      <table className="mizu-data-table">
        <thead>
          <tr>
            <th scope="col">Time</th>
            {series.map((s) => (
              <th scope="col" key={s.id} style={{ textAlign: "right" }}>
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x}>
              <th scope="row">{fx(x)}</th>
              {lookup.map((m, i) => {
                const v = m.get(x);
                return (
                  <td key={series[i]!.id} style={{ textAlign: "right" }}>
                    {v === undefined || v === null ? "—" : format(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {stride > 1 && (
        <p className="mizu-field-hint">
          Showing every {stride} readings of {xs.length}.
        </p>
      )}
    </div>
  );
}
