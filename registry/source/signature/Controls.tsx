"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "../motion/Preferences";
import { clamp, useControllable, useLatest } from "./internal";

/** How travel maps to value: evenly, or by ratio (frequencies, times, gains). */
export type ControlTaper = "linear" | "log";
type Scale = { min: number; max: number; step: number; taper: ControlTaper };
type ScaleProps = {
  min?: number;
  max?: number;
  step?: number;
  /** "log" needs a positive min. */
  taper?: ControlTaper;
  format?: (value: number) => string;
};
type ControlProps = ScaleProps & {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** When a gesture or key press finishes: the moment to save or send. */
  onValueCommit?: (value: number) => void;
  /** Where double-click, Backspace or Delete return to; defaults to defaultValue. */
  resetValue?: number;
  disabled?: boolean;
  /** Submits the value with a surrounding form. */
  name?: string;
  className?: string;
  style?: CSSProperties;
};

const SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;
const DRAG_PIXELS = 220;

function scaleOf({
  min = 0,
  max = 100,
  step = 1,
  taper = "linear",
}: ScaleProps): Scale {
  return {
    min,
    max,
    step,
    taper: taper === "log" && min > 0 ? "log" : "linear",
  };
}
function places(step: number) {
  const [, fraction = ""] = String(step).split(".");
  return fraction.length;
}
function snap(v: number, s: Scale) {
  const n = Math.round((v - s.min) / s.step) * s.step + s.min;
  return clamp(Number(n.toFixed(places(s.step))), s.min, s.max);
}
/** Travel (0–1) for a value, and back. */
function travelOf(v: number, s: Scale) {
  const t =
    s.taper === "log"
      ? Math.log(v / s.min) / Math.log(s.max / s.min)
      : (v - s.min) / (s.max - s.min || 1);
  return clamp(t, 0, 1);
}
function valueAt(t: number, s: Scale) {
  const p = clamp(t, 0, 1);
  return snap(
    s.taper === "log"
      ? s.min * (s.max / s.min) ** p
      : s.min + p * (s.max - s.min),
    s,
  );
}
/** One key press: a step (1% of travel when log), or a tenth of the range with Shift or Page keys. */
function stepped(v: number, s: Scale, direction: number, big: boolean) {
  if (s.taper === "log")
    return valueAt(travelOf(v, s) + direction * (big ? 0.1 : 0.01), s);
  const size = big
    ? Math.max(s.step, Math.round((s.max - s.min) / 10 / s.step) * s.step)
    : s.step;
  return snap(v + direction * size, s);
}
const DIRECTION: Record<string, number> = {
  ArrowUp: 1,
  ArrowRight: 1,
  PageUp: 1,
  ArrowDown: -1,
  ArrowLeft: -1,
  PageDown: -1,
};

/** A value that glides to discrete changes and follows the hand directly. */
function useTravel(value: number, s: Scale) {
  const reduce = useReducedMotion();
  const travel = useMotionValue(travelOf(value, s));
  const handRef = useRef(false);
  const target = travelOf(value, s);
  useEffect(() => {
    if (handRef.current || reduce) {
      travel.set(target);
      return;
    }
    const glide = animate(travel, target, SPRING);
    return () => glide.stop();
  }, [target, reduce, travel]);
  return [travel, handRef] as const;
}

/** The native range input behind a drawn control, and a hidden field for forms. */
function Input({
  label,
  value,
  scale,
  format,
  disabled,
  name,
  axis,
  onValue,
  onKey,
}: {
  label: string;
  value: number;
  scale: Scale;
  format: (v: number) => string;
  disabled?: boolean;
  name?: string;
  axis?: "x" | "y";
  onValue: (v: number) => void;
  onKey: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const log = scale.taper === "log";
  return (
    <>
      <input
        type="range"
        className="mizu-control-input"
        data-axis={axis}
        aria-label={label}
        aria-valuetext={format(value)}
        min={log ? 0 : scale.min}
        max={log ? 1000 : scale.max}
        step={log ? 1 : scale.step}
        value={log ? Math.round(travelOf(value, scale) * 1000) : value}
        disabled={disabled}
        onChange={(e) =>
          onValue(
            log
              ? valueAt(Number(e.target.value) / 1000, scale)
              : snap(Number(e.target.value), scale),
          )
        }
        onKeyDown={onKey}
      />
      {name && <input type="hidden" name={name} value={value} />}
    </>
  );
}

/** Shared state and gestures for the single-value controls. */
function useControl(props: ControlProps) {
  const s = scaleOf(props);
  const format = props.format ?? ((v: number) => String(v));
  const [value, setValue] = useControllable(
    props.value,
    props.defaultValue ?? s.min,
    props.onValueChange,
  );
  const [travel, handRef] = useTravel(value, s);
  const [dragging, setDragging] = useState(false);
  const valueRef = useLatest(value);
  const commitRef = useLatest(props.onValueCommit);
  const inputRef = useRef<HTMLDivElement>(null);
  const home = snap(props.resetValue ?? props.defaultValue ?? s.min, s);

  const change = (v: number, commit = false) => {
    setValue(v);
    if (commit) commitRef.current?.(v);
  };
  const reset = () => change(home, true);
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const direction = DIRECTION[e.key];
    let next: number | undefined;
    if (direction)
      next = stepped(
        value,
        s,
        direction,
        e.shiftKey || e.key.startsWith("Page"),
      );
    else if (e.key === "Home") next = s.min;
    else if (e.key === "End") next = s.max;
    else if (e.key === "Backspace" || e.key === "Delete") next = home;
    if (next === undefined) return;
    e.preventDefault();
    change(next, true);
  };
  /** A relative vertical drag: `pixels` of travel cover the range; Shift is ten times finer. */
  const drag = (e: PointerEvent<Element>, pixels: number) => {
    if (props.disabled || e.button !== 0) return;
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    inputRef.current?.querySelector("input")?.focus({ preventScroll: true });
    handRef.current = true;
    setDragging(true);
    let y = e.clientY,
      t = travel.get();
    const move = (ev: globalThis.PointerEvent) => {
      t = clamp(
        t - ((ev.clientY - y) / pixels) * (ev.shiftKey ? 0.1 : 1),
        0,
        1,
      );
      y = ev.clientY;
      travel.set(t);
      setValue(valueAt(t, s));
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      handRef.current = false;
      setDragging(false);
      commitRef.current?.(valueRef.current);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };
  const input = (
    <div ref={inputRef} style={{ display: "contents" }}>
      <Input
        label={props.label}
        value={value}
        scale={s}
        format={format}
        disabled={props.disabled}
        name={props.name}
        onValue={(v) => change(v, true)}
        onKey={onKey}
      />
    </div>
  );
  return { s, value, travel, format, dragging, change, reset, drag, input };
}

/** A point on the knob's 270° dial, from 7 o'clock round to 5. */
function dial(c: number, r: number, t: number) {
  const a = ((-135 + 270 * t) * Math.PI) / 180;
  // Rounded: engines disagree in the last digit of sin and cos, which would break hydration.
  const round = (n: number) => Math.round(n * 100) / 100;
  return [round(c + r * Math.sin(a)), round(c - r * Math.cos(a))] as const;
}
function arc(c: number, r: number, from: number, to: number) {
  const [a, b] = from <= to ? [from, to] : [to, from];
  if (b - a < 0.001) return "";
  const [x0, y0] = dial(c, r, a),
    [x1, y1] = dial(c, r, b);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${(b - a) * 270 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/**
 * A rotary control: drag up or down (Shift for fine), use the arrow keys,
 * or double-click to return home. Bipolar knobs fill from the centre.
 */
export function Knob({
  size = 64,
  bipolar = false,
  className = "",
  style,
  ...props
}: ControlProps & { size?: number; bipolar?: boolean }) {
  const k = useControl(props);
  const c = size / 2,
    r = c - 5;
  const value = useTransform(k.travel, (t) => arc(c, r, bipolar ? 0.5 : 0, t));
  // The pointer runs from just inside the face towards its centre.
  const tipX = useTransform(k.travel, (t) => dial(c, r - 11, t)[0]),
    tipY = useTransform(k.travel, (t) => dial(c, r - 11, t)[1]),
    tailX = useTransform(k.travel, (t) => dial(c, (r - 8) * 0.35, t)[0]),
    tailY = useTransform(k.travel, (t) => dial(c, (r - 8) * 0.35, t)[1]);
  return (
    <div
      className={`mizu-knob ${className}`}
      style={style}
      data-disabled={props.disabled || undefined}
      data-dragging={k.dragging || undefined}
    >
      <span className="mizu-control-label" aria-hidden="true">
        {props.label}
      </span>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        onPointerDown={(e) => k.drag(e, DRAG_PIXELS)}
        onDoubleClick={k.reset}
      >
        {Array.from({ length: 11 }, (_, i) => {
          const [x0, y0] = dial(c, r + 3, i / 10),
            [x1, y1] = dial(c, r + 6, i / 10);
          return (
            <line
              key={i}
              className="mizu-knob-tick"
              x1={x0}
              y1={y0}
              x2={x1}
              y2={y1}
            />
          );
        })}
        <path className="mizu-knob-track" d={arc(c, r, 0, 1)} />
        <motion.path className="mizu-knob-value" d={value} />
        <circle className="mizu-knob-face" cx={c} cy={c} r={r - 8} />
        <motion.line
          className="mizu-knob-pointer"
          x1={tipX}
          y1={tipY}
          x2={tailX}
          y2={tailY}
        />
      </svg>
      <span className="mizu-control-readout" aria-hidden="true">
        {k.format(k.value)}
      </span>
      {k.input}
    </div>
  );
}

const CAP = 16;

/**
 * A console fader: drag the cap (Shift for fine), click the track to jump,
 * double-click to return home. Give it a `level` to show a meter beside it
 * with a falling peak.
 */
export function Fader({
  height = 176,
  marks = [],
  level,
  className = "",
  style,
  ...props
}: ControlProps & {
  height?: number;
  /** Values to label beside the track. */
  marks?: readonly number[];
  /** A live signal level from 0 to 1 for the meter; a motion value updates it without re-rendering. */
  level?: number | MotionValue<number>;
}) {
  const f = useControl(props);
  const travelPx = height - CAP;
  const capY = useTransform(f.travel, (t) => (1 - t) * travelPx);
  const fill = useTransform(f.travel, (t) => (t * travelPx + CAP / 2) / height);
  const meter = useMotionValue(0),
    peak = useMotionValue(0);
  const meterY = useTransform(peak, (p) => (1 - p) * height);
  const levelRef = useLatest(level);
  const metered = level !== undefined;

  // Meter ballistics: instant attack, steady release, and a peak that holds then falls.
  useEffect(() => {
    if (!metered) return;
    let frame = 0,
      last = performance.now(),
      held = 0,
      heldAt = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const source = levelRef.current;
      const target = clamp(
        typeof source === "number" ? source : (source?.get() ?? 0),
        0,
        1,
      );
      meter.set(Math.max(target, meter.get() - dt * 1.5));
      if (target >= held) {
        held = target;
        heldAt = now;
      } else if (now - heldAt > 900) held = Math.max(target, held - dt * 0.5);
      peak.set(held);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [metered, levelRef, meter, peak]);

  return (
    <div
      className={`mizu-fader ${className}`}
      style={style}
      data-disabled={props.disabled || undefined}
      data-dragging={f.dragging || undefined}
    >
      <span className="mizu-control-label" aria-hidden="true">
        {props.label}
      </span>
      <div className="mizu-fader-body" style={{ height }}>
        {marks.length > 0 && (
          <div
            className="mizu-fader-marks"
            style={{
              width: `${Math.max(...marks.map((m) => f.format(m).length))}ch`,
            }}
            aria-hidden="true"
          >
            {marks.map((m) => (
              <span
                key={m}
                style={{ top: (1 - travelOf(m, f.s)) * travelPx + CAP / 2 }}
              >
                {f.format(m)}
              </span>
            ))}
          </div>
        )}
        <div
          className="mizu-fader-track"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest(".mizu-fader-cap")) return;
            if (props.disabled || e.button !== 0) return;
            const r = e.currentTarget.getBoundingClientRect();
            f.change(
              valueAt(1 - (e.clientY - r.top - CAP / 2) / travelPx, f.s),
              true,
            );
          }}
          onDoubleClick={f.reset}
        >
          <motion.span
            className="mizu-fader-fill"
            style={{ height: "100%", scaleY: fill }}
          />
          <motion.span
            className="mizu-fader-cap"
            style={{ y: capY }}
            onPointerDown={(e) => f.drag(e, travelPx)}
          />
        </div>
        {metered && (
          <div className="mizu-fader-meter" aria-hidden="true">
            <motion.span style={{ scaleY: meter }} />
            <motion.i style={{ y: meterY }} />
          </div>
        )}
      </div>
      <span className="mizu-control-readout" aria-hidden="true">
        {f.format(f.value)}
      </span>
      {f.input}
    </div>
  );
}

type Point = { x: number; y: number };
type Axis = ScaleProps & { label?: string };

/**
 * A two-dimensional control: press anywhere and the puck springs there,
 * then follows (Shift for fine). Each axis is also a slider for keyboards
 * and assistive technology; arrows move both from either.
 */
export function XYPad({
  label,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  x: xAxis = {},
  y: yAxis = {},
  resetValue,
  size = 200,
  disabled,
  name,
  className = "",
  style,
}: {
  label: string;
  value?: Point;
  defaultValue?: Point;
  onValueChange?: (value: Point) => void;
  onValueCommit?: (value: Point) => void;
  x?: Axis;
  y?: Axis;
  resetValue?: Point;
  size?: number;
  disabled?: boolean;
  /** Submits `${name}-x` and `${name}-y` with a surrounding form. */
  name?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const sx = scaleOf(xAxis),
    sy = scaleOf(yAxis);
  const fx = xAxis.format ?? String,
    fy = yAxis.format ?? String;
  const centre = { x: valueAt(0.5, sx), y: valueAt(0.5, sy) };
  const [point, setPoint] = useControllable(
    value,
    defaultValue ?? centre,
    onValueChange,
  );
  const [tx, handRef] = useTravel(point.x, sx);
  const [ty, handYRef] = useTravel(point.y, sy);
  const pointRef = useLatest(point);
  const commitRef = useLatest(onValueCommit);
  const trail = useMotionValue(""),
    trailFade = useMotionValue(0);
  const home = resetValue ?? defaultValue ?? centre;

  const px = useTransform(tx, (t) => t * size),
    py = useTransform(ty, (t) => (1 - t) * size);
  const change = (next: Point, commit = false) => {
    setPoint(next);
    if (commit) commitRef.current?.(next);
  };
  const reset = () =>
    change({ x: snap(home.x, sx), y: snap(home.y, sy) }, true);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const big = e.shiftKey || e.key.startsWith("Page");
    const p = pointRef.current;
    let next: Point | undefined;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight")
      next = {
        ...p,
        x: stepped(p.x, sx, e.key === "ArrowRight" ? 1 : -1, big),
      };
    else if (
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key.startsWith("Page")
    )
      next = {
        ...p,
        y: stepped(
          p.y,
          sy,
          e.key === "ArrowUp" || e.key === "PageUp" ? 1 : -1,
          big,
        ),
      };
    else if (e.key === "Backspace" || e.key === "Delete")
      next = { x: snap(home.x, sx), y: snap(home.y, sy) };
    if (!next) return;
    e.preventDefault();
    change(next, true);
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    const pad = e.currentTarget,
      r = pad.getBoundingClientRect();
    pad.setPointerCapture(e.pointerId);
    pad.querySelector("input")?.focus({ preventScroll: true });
    const at = (cx: number, cy: number) => ({
      x: clamp((cx - r.left) / r.width, 0, 1),
      y: clamp(1 - (cy - r.top) / r.height, 0, 1),
    });
    let t = at(e.clientX, e.clientY),
      last = { x: e.clientX, y: e.clientY };
    const points: string[] = [];
    const draw = () => {
      points.push(
        `${(t.x * size).toFixed(1)},${((1 - t.y) * size).toFixed(1)}`,
      );
      if (points.length > 18) points.shift();
      trail.set(points.join(" "));
    };
    trailFade.set(reduce ? 0 : 1);
    // The press itself springs the puck over; after that it follows the hand.
    change({ x: valueAt(t.x, sx), y: valueAt(t.y, sy) });
    draw();
    const move = (ev: globalThis.PointerEvent) => {
      handRef.current = handYRef.current = true;
      if (ev.shiftKey)
        t = {
          x: clamp(t.x + ((ev.clientX - last.x) / r.width) * 0.1, 0, 1),
          y: clamp(t.y - ((ev.clientY - last.y) / r.height) * 0.1, 0, 1),
        };
      else t = at(ev.clientX, ev.clientY);
      last = { x: ev.clientX, y: ev.clientY };
      tx.set(t.x);
      ty.set(t.y);
      change({ x: valueAt(t.x, sx), y: valueAt(t.y, sy) });
      draw();
    };
    const up = () => {
      pad.removeEventListener("pointermove", move);
      pad.removeEventListener("pointerup", up);
      pad.removeEventListener("pointercancel", up);
      handRef.current = handYRef.current = false;
      commitRef.current?.(pointRef.current);
      void animate(trailFade, 0, { duration: 0.6 });
    };
    pad.addEventListener("pointermove", move);
    pad.addEventListener("pointerup", up);
    pad.addEventListener("pointercancel", up);
  };

  return (
    <div
      className={`mizu-xy ${className}`}
      style={style}
      role="group"
      aria-label={label}
      data-disabled={disabled || undefined}
    >
      <span className="mizu-control-label" aria-hidden="true">
        {label}
      </span>
      <div
        className="mizu-xy-pad"
        style={{ width: size, height: size }}
        onPointerDown={onDown}
        onDoubleClick={reset}
      >
        <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <motion.line
            className="mizu-xy-cross"
            data-axis="x"
            x1={px}
            x2={px}
            y1={0}
            y2={size}
          />
          <motion.line
            className="mizu-xy-cross"
            data-axis="y"
            x1={0}
            x2={size}
            y1={py}
            y2={py}
          />
          <motion.polyline
            className="mizu-xy-trail"
            points={trail}
            style={{ opacity: trailFade }}
          />
        </svg>
        <motion.span
          className="mizu-xy-puck"
          style={{ x: px, y: py }}
          aria-hidden="true"
        />
        <Input
          label={`${label}: ${xAxis.label ?? "X"}`}
          axis="x"
          value={point.x}
          scale={sx}
          format={fx}
          disabled={disabled}
          name={name && `${name}-x`}
          onValue={(x) => change({ ...pointRef.current, x }, true)}
          onKey={onKey}
        />
        <Input
          label={`${label}: ${yAxis.label ?? "Y"}`}
          axis="y"
          value={point.y}
          scale={sy}
          format={fy}
          disabled={disabled}
          name={name && `${name}-y`}
          onValue={(y) => change({ ...pointRef.current, y }, true)}
          onKey={onKey}
        />
      </div>
      <p className="mizu-control-readout mizu-xy-readout" aria-hidden="true">
        <span>
          {xAxis.label ?? "X"} {fx(point.x)}
        </span>
        <span>
          {yAxis.label ?? "Y"} {fy(point.y)}
        </span>
      </p>
    </div>
  );
}
