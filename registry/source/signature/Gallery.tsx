"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { lockScroll } from "../composite/Dialog";
import { EASE_EXPO } from "../motion/easings";
import { useReducedMotion } from "../motion/Preferences";
import {
  clamp,
  useAnnouncer,
  useControllable,
  useElementSize,
  useIsoLayoutEffect,
  useLatest,
} from "./internal";
import { justifyRows } from "./justify";

export { justifyRows, type GalleryRow } from "./justify";

export type GalleryItem = {
  id: string;
  /** The full image, fetched when the photo opens. */
  src: string;
  /** A lighter image for the grid and filmstrip; defaults to `src`. */
  thumbnail?: string;
  alt: string;
  /** Intrinsic size, or any pair in the same proportion: lays out before anything loads. */
  width: number;
  height: number;
  caption?: ReactNode;
};
type Point = { x: number; y: number };

const MAX_ZOOM = 4;
const SPRING = { type: "spring", stiffness: 300, damping: 32 } as const;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A justified photo grid whose photos open into a viewer from exactly where
 * they sit. Swipe or use the arrows to travel, pull down to dismiss, and
 * pinch, scroll or double-tap to zoom.
 */
export function Gallery({
  label,
  items,
  index,
  defaultIndex = null,
  onIndexChange,
  rowHeight = 220,
  gap = 6,
  loading = false,
  empty = "No photos yet.",
  className = "",
  style,
}: {
  label: string;
  items: readonly GalleryItem[];
  /** The open photo, or null while the viewer is closed. */
  index?: number | null;
  defaultIndex?: number | null;
  onIndexChange?: (index: number | null) => void;
  /** The height rows aim for; full rows adjust around it to fill the width. */
  rowHeight?: number;
  gap?: number;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [rootRef, { width }] = useElementSize<HTMLElement>();
  const [open, setOpen] = useControllable<number | null>(
    index,
    defaultIndex,
    onIndexChange,
  );
  const tilesRef = useRef(new Map<string, HTMLButtonElement>());
  const current =
    open === null || !items.length ? null : clamp(open, 0, items.length - 1);

  // Each photo's box and horizontal centre, so arrow keys can move between rows.
  const rows = width ? justifyRows(items, width, rowHeight, gap) : [];
  const boxes = rows.flatMap((row, r) => {
    let left = 0;
    return items.slice(row.start, row.end).map((item, i) => {
      const w = (item.width / item.height) * row.height;
      const box = {
        row: r,
        w: Math.floor(w * 100) / 100,
        h: row.height,
        cx: left + w / 2,
        fill: row.full && i === row.end - row.start - 1,
      };
      left += w + gap;
      return box;
    });
  });
  const tile = (i: number) =>
    items[i] ? tilesRef.current.get(items[i].id) : undefined;

  const onGridKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const from = Number((e.target as HTMLElement).dataset.index);
    if (Number.isNaN(from)) return;
    let to: number | undefined;
    if (e.key === "ArrowRight") to = from + 1;
    else if (e.key === "ArrowLeft") to = from - 1;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = items.length - 1;
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const step = e.key === "ArrowDown" ? 1 : -1;
      const here = boxes[from],
        row = here && rows[here.row + step];
      if (!here) to = from + step;
      else if (!row) return;
      else
        for (let i = row.start; i < row.end; i++)
          if (
            to === undefined ||
            Math.abs(boxes[i]!.cx - here.cx) < Math.abs(boxes[to]!.cx - here.cx)
          )
            to = i;
    }
    if (to === undefined) return;
    e.preventDefault();
    tile(clamp(to, 0, items.length - 1))?.focus();
  };

  return (
    <section
      ref={rootRef}
      className={`mizu-gallery ${className}`}
      style={style}
      aria-label={label}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <div className="mizu-gallery-loading" role="status" style={{ gap }}>
          <span className="mizu-sr-only">Loading photos</span>
          {[
            [3, 2, 4],
            [2, 3, 2, 3],
          ].map((row, r) => (
            <div key={r} aria-hidden="true">
              {row.map((grow, i) => (
                <span key={i} style={{ flex: grow, height: rowHeight }} />
              ))}
            </div>
          ))}
        </div>
      ) : !items.length ? (
        <div className="mizu-gallery-empty" role="status">
          {empty}
        </div>
      ) : (
        <ul className="mizu-gallery-grid" style={{ gap }} onKeyDown={onGridKey}>
          {items.map((item, i) => {
            const box = boxes[i];
            return (
              <li
                key={item.id}
                style={
                  box
                    ? {
                        width: box.w,
                        height: box.h,
                        flexGrow: box.fill ? 1 : 0,
                      }
                    : // Before the grid is measured: the target height, never wider than the grid.
                      {
                        width: `min(100%, ${(item.width / item.height) * rowHeight}px)`,
                        aspectRatio: `${item.width} / ${item.height}`,
                      }
                }
              >
                <button
                  ref={(el) => {
                    if (el) tilesRef.current.set(item.id, el);
                    else tilesRef.current.delete(item.id);
                  }}
                  type="button"
                  className="mizu-gallery-tile"
                  data-index={i}
                  data-open={current === i || undefined}
                  aria-label={item.alt}
                  aria-haspopup="dialog"
                  onClick={() => setOpen(i)}
                >
                  <img
                    src={item.thumbnail ?? item.src}
                    alt=""
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {current !== null && (
        <Viewer
          label={label}
          items={items}
          index={current}
          onIndex={setOpen}
          tile={tile}
        />
      )}
    </section>
  );
}

type Gesture = {
  start: Point;
  base: Point;
  onImage: boolean;
  moved: boolean;
  axis?: "x" | "y" | "pan";
  pinch?: { distance: number; zoom: number };
};

function Viewer({
  label,
  items,
  index,
  onIndex,
  tile,
}: {
  label: string;
  items: readonly GalleryItem[];
  index: number;
  onIndex: (index: number | null) => void;
  tile: (index: number) => HTMLElement | undefined;
}) {
  const reduce = !!useReducedMotion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLOListElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const pointersRef = useRef(new Map<number, Point>());
  const gestureRef = useRef<Gesture | null>(null);
  const tapRef = useRef({ time: 0, x: 0, y: 0 });
  const shownRef = useRef(index);
  const indexRef = useLatest(index);
  const tileRef = useLatest(tile);
  const [message, announce] = useAnnouncer();
  const [zoomed, setZoomed] = useState(false);
  const [travelled, setTravelled] = useState(false);
  const [loaded, setLoaded] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  // The frame travels (flight, swipe, pan); the image zooms; a dismiss is pulled.
  const x = useMotionValue(0),
    y = useMotionValue(0),
    scale = useMotionValue(1),
    zoom = useMotionValue(1),
    fade = useMotionValue(0),
    pull = useMotionValue(0);
  const shade = useTransform(
    () => fade.get() * (1 - Math.min(0.75, pull.get() / 320)),
  );
  const chrome = useTransform(
    () => fade.get() * (1 - Math.min(1, pull.get() / 140)),
  );
  const readout = useTransform(zoom, (z) =>
    z > 1.01 ? `${Math.round(z * 100)}%` : "",
  );
  useMotionValueEvent(zoom, "change", (z) => setZoomed(z > 1.01));

  const item = items[index]!;
  const ratio = item.width / item.height;

  // The frame's resting centre and size, and the stage it may pan across.
  const measure = () => {
    const frame = frameRef.current,
      stage = stageRef.current;
    if (!frame || !stage) return null;
    const r = frame.getBoundingClientRect(),
      s = stage.getBoundingClientRect(),
      k = scale.get() || 1;
    return {
      cx: r.left + r.width / 2 - x.get() - s.left,
      cy: r.top + r.height / 2 - y.get() - s.top,
      w: r.width / k,
      h: r.height / k,
      stage: s,
    };
  };
  type Measure = NonNullable<ReturnType<typeof measure>>;
  // Offsets that keep a zoomed photo covering the stage, or centred when it fits.
  const bound = (m: Measure, z: number, to: Point) => ({
    x:
      m.w * z <= m.stage.width
        ? 0
        : clamp(
            to.x,
            m.stage.width - (m.w * z) / 2 - m.cx,
            (m.w * z) / 2 - m.cx,
          ),
    y:
      m.h * z <= m.stage.height
        ? 0
        : clamp(
            to.y,
            m.stage.height - (m.h * z) / 2 - m.cy,
            (m.h * z) / 2 - m.cy,
          ),
  });
  // The transform that lays the frame exactly over `rect`.
  const over = (m: Measure, rect: DOMRect) => ({
    x: rect.left + rect.width / 2 - m.stage.left - m.cx,
    y: rect.top + rect.height / 2 - m.stage.top - m.cy,
    scale: rect.width / m.w,
  });

  const zoomTo = (target: number, at?: Point, instant = false) => {
    const m = measure();
    if (!m) return;
    const next = clamp(target, 1, MAX_ZOOM),
      k = next / zoom.get();
    const p = at
      ? { x: at.x - m.stage.left, y: at.y - m.stage.top }
      : { x: m.stage.width / 2, y: m.stage.height / 2 };
    // The point under the cursor or fingers stays where it is.
    const to = bound(m, next, {
      x: p.x - m.cx - (p.x - m.cx - x.get()) * k,
      y: p.y - m.cy - (p.y - m.cy - y.get()) * k,
    });
    if (instant || reduce) {
      zoom.set(next);
      x.set(to.x);
      y.set(to.y);
    } else {
      void animate(zoom, next, SPRING);
      void animate(x, to.x, SPRING);
      void animate(y, to.y, SPRING);
    }
  };
  const settle = () => {
    const spring = { type: "spring", stiffness: 420, damping: 34 } as const;
    void animate(x, 0, spring);
    void animate(y, 0, spring);
    void animate(scale, 1, spring);
    void animate(pull, 0, spring);
  };

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const home = tile(index);
    home?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    const to = reduce ? null : onScreen(home);
    const m = measure();
    const done = () => onIndex(null);
    const fading = animate(fade, 0, {
      duration: reduce ? 0.15 : 0.3,
      ease: EASE_EXPO,
    });
    if (!to || !m) {
      void fading.then(done);
      return;
    }
    zoom.set(1);
    const end = over(m, to);
    void animate(pull, 0, { duration: 0.2 });
    void animate(x, end.x, SPRING);
    void animate(y, end.y, SPRING);
    void animate(scale, end.scale, { ...SPRING, restDelta: 0.001 }).then(done);
  };
  const go = (to: number) => {
    if (closingRef.current) return;
    const next = clamp(to, 0, items.length - 1);
    if (next === index) {
      if (x.get() !== 0 || reduce) settle();
      else
        void animate(x, [0, next === 0 ? 28 : -28, 0], {
          duration: 0.45,
          ease: EASE_EXPO,
        });
      return;
    }
    zoom.set(1);
    y.set(0);
    scale.set(1);
    pull.set(0);
    if (reduce) x.set(0);
    else {
      x.set((next > index ? 1 : -1) * Math.min(160, window.innerWidth * 0.16));
      void animate(x, 0, SPRING);
    }
    setTravelled(true);
    onIndex(next);
  };
  const goRef = useLatest(go);
  const zoomRef = useLatest(zoomTo);
  const measureRef = useLatest(measure);
  const boundRef = useLatest(bound);

  // Native modality, the scroll lock, and the flight out of the grid.
  useIsoLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const restore = document.activeElement as HTMLElement | null;
    const from = reduce ? null : onScreen(tileRef.current(indexRef.current));
    dialog.showModal();
    if (!dialog.contains(document.activeElement)) closeRef.current?.focus();
    const release = lockScroll();
    const m = measureRef.current();
    if (from && m) {
      const start = over(m, from);
      x.set(start.x);
      y.set(start.y);
      scale.set(start.scale);
      void animate(x, 0, SPRING);
      void animate(y, 0, SPRING);
      void animate(scale, 1, SPRING);
    }
    void animate(fade, 1, { duration: reduce ? 0.15 : 0.4, ease: EASE_EXPO });
    return () => {
      dialog.close();
      release();
      const home = tileRef.current(indexRef.current) ?? restore;
      if (home?.isConnected) home.focus({ preventScroll: true });
    };
    // Runs once per opening; later photos travel sideways instead.
  }, []);

  // Trackpads: pinch zooms around the cursor, two-finger scroll pans or travels.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let travel = 0,
      quietUntil = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (closingRef.current) return;
      if (e.ctrlKey) {
        const at = { x: e.clientX, y: e.clientY };
        zoomRef.current(zoom.get() * Math.exp(-e.deltaY * 0.01), at, true);
        return;
      }
      if (zoom.get() > 1.01) {
        const m = measureRef.current();
        if (!m) return;
        const to = boundRef.current(m, zoom.get(), {
          x: x.get() - e.deltaX,
          y: y.get() - e.deltaY,
        });
        x.set(to.x);
        y.set(to.y);
        return;
      }
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      // One photo per swipe: momentum stays quiet until it has died away.
      const now = performance.now();
      if (now < quietUntil) {
        quietUntil = now + 180;
        return;
      }
      travel += e.deltaX;
      if (Math.abs(travel) > 60) {
        goRef.current(indexRef.current + Math.sign(travel));
        travel = 0;
        quietUntil = now + 400;
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [boundRef, goRef, indexRef, measureRef, x, y, zoom, zoomRef]);

  // Arriving at a photo: centre its thumbnail, warm its neighbours, announce it.
  useEffect(() => {
    const strip = stripRef.current,
      thumb = strip?.children[index] as HTMLElement | undefined;
    if (strip && thumb)
      strip.scrollTo({
        left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2,
        behavior: reduce ? "auto" : "smooth",
      });
    for (const n of [index - 1, index + 1])
      if (items[n]) new Image().src = items[n].src;
    if (shownRef.current !== index) {
      shownRef.current = index;
      announce(`${index + 1} of ${items.length}: ${items[index]!.alt}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const onKey = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const keys: Record<string, () => void> = {
      ArrowRight: () => go(index + 1),
      ArrowLeft: () => go(index - 1),
      Home: () => go(0),
      End: () => go(items.length - 1),
      "+": () => zoomTo(zoom.get() * 1.6),
      "=": () => zoomTo(zoom.get() * 1.6),
      "-": () => zoomTo(zoom.get() / 1.6),
      "0": () => zoomTo(1),
    };
    const action = keys[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (closingRef.current || e.button !== 0 || target.closest("button"))
      return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    for (const value of [x, y, scale, zoom, pull]) value.stop();
    const points = [...pointersRef.current.values()];
    gestureRef.current = {
      start: { x: e.clientX, y: e.clientY },
      base: { x: x.get(), y: y.get() },
      onImage: !!target.closest(".mizu-lightbox-frame"),
      moved: points.length > 1,
      pinch:
        points.length === 2
          ? { distance: distance(points), zoom: zoom.get() }
          : undefined,
    };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (!g || !pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const points = [...pointersRef.current.values()];
    if (g.pinch && points.length > 1) {
      const mid = {
        x: (points[0]!.x + points[1]!.x) / 2,
        y: (points[0]!.y + points[1]!.y) / 2,
      };
      zoomTo((g.pinch.zoom * distance(points)) / g.pinch.distance, mid, true);
      return;
    }
    const dx = e.clientX - g.start.x,
      dy = e.clientY - g.start.y;
    if (!g.axis) {
      if (Math.hypot(dx, dy) < 6) return;
      g.moved = true;
      g.axis =
        zoom.get() > 1.01 ? "pan" : Math.abs(dy) > Math.abs(dx) ? "y" : "x";
    }
    if (g.axis === "pan") {
      const m = measure();
      if (!m) return;
      const to = bound(m, zoom.get(), { x: g.base.x + dx, y: g.base.y + dy });
      x.set(to.x);
      y.set(to.y);
    } else if (g.axis === "y") {
      y.set(dy);
      pull.set(Math.abs(dy));
      scale.set(1 - Math.min(0.3, Math.abs(dy) / 1200));
    } else {
      // Resistance past the first and last photo.
      const edge =
        (dx > 0 && index === 0) || (dx < 0 && index === items.length - 1);
      x.set(edge ? dx * 0.3 : dx);
    }
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.delete(e.pointerId)) return;
    const g = gestureRef.current;
    if (!g) return;
    const remaining = [...pointersRef.current.values()][0];
    if (remaining) {
      // A pinch that loses a finger carries on as a pan.
      gestureRef.current = {
        start: remaining,
        base: { x: x.get(), y: y.get() },
        onImage: true,
        moved: true,
        axis: zoom.get() > 1.01 ? "pan" : "x",
      };
      return;
    }
    gestureRef.current = null;
    if (e.type === "pointercancel") return settle();
    if (!g.moved) {
      if (!g.onImage) return close();
      const now = performance.now(),
        last = tapRef.current;
      if (
        now - last.time < 320 &&
        Math.hypot(e.clientX - last.x, e.clientY - last.y) < 30
      ) {
        tapRef.current = { time: 0, x: 0, y: 0 };
        zoomTo(zoom.get() > 1.01 ? 1 : 2.5, { x: e.clientX, y: e.clientY });
      } else tapRef.current = { time: now, x: e.clientX, y: e.clientY };
      return;
    }
    if (g.pinch || g.axis === "pan") {
      if (zoom.get() < 1.05) zoomTo(1);
      return;
    }
    if (g.axis === "y") {
      if (Math.abs(y.get()) > 110 || Math.abs(y.getVelocity()) > 900) close();
      else settle();
    } else if (x.get() < -70 || x.getVelocity() < -700) go(index + 1);
    else if (x.get() > 70 || x.getVelocity() > 700) go(index - 1);
    else settle();
  };

  const busy = loaded !== item.src && failed !== item.src;

  return (
    <dialog
      ref={dialogRef}
      className="mizu-lightbox"
      aria-label={`${label}, photo ${index + 1} of ${items.length}`}
      onKeyDown={onKey}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <motion.div
        className="mizu-lightbox-shade"
        style={{ opacity: shade }}
        aria-hidden="true"
      />
      <motion.header className="mizu-lightbox-bar" style={{ opacity: chrome }}>
        <p className="mizu-lightbox-count" aria-hidden="true">
          <span className="mizu-lightbox-title">{label}</span>
          <span>
            <b>{pad(index + 1)}</b> / {pad(items.length)}
          </span>
        </p>
        <motion.span className="mizu-lightbox-zoom" aria-hidden="true">
          {readout}
        </motion.span>
        <button
          ref={closeRef}
          type="button"
          className="mizu-lightbox-close"
          onClick={close}
          aria-label="Close viewer"
        >
          <svg viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </motion.header>
      <div
        ref={stageRef}
        className="mizu-lightbox-stage"
        data-zoomed={zoomed || undefined}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="mizu-lightbox-fit">
          <motion.div
            ref={frameRef}
            className="mizu-lightbox-frame"
            style={{
              x,
              y,
              scale,
              aspectRatio: `${item.width} / ${item.height}`,
              width: `min(100cqw, ${ratio} * 100cqh)`,
            }}
          >
            {item.thumbnail && (
              <img src={item.thumbnail} alt="" draggable={false} />
            )}
            <motion.img
              key={item.id}
              src={item.src}
              alt={item.alt}
              draggable={false}
              onLoad={() => setLoaded(item.src)}
              onError={() => {
                setFailed(item.src);
                announce(`${item.alt} could not be loaded.`);
              }}
              initial={travelled && !reduce ? { opacity: 0 } : false}
              animate={{ opacity: failed === item.src ? 0 : 1 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              style={{ scale: zoom }}
            />
            {busy && (
              <span className="mizu-lightbox-loading" aria-hidden="true" />
            )}
            {failed === item.src && (
              <p className="mizu-lightbox-error">
                <strong>Not loaded</strong>
                This photo could not be loaded.
              </p>
            )}
          </motion.div>
        </div>
        <motion.button
          type="button"
          className="mizu-lightbox-step"
          data-side="previous"
          style={{ opacity: chrome }}
          disabled={index === 0}
          onClick={() => go(index - 1)}
          aria-label="Previous photo"
        >
          <svg viewBox="0 0 14 14" aria-hidden="true">
            <path d="M9 2 4 7l5 5" />
          </svg>
        </motion.button>
        <motion.button
          type="button"
          className="mizu-lightbox-step"
          data-side="next"
          style={{ opacity: chrome }}
          disabled={index === items.length - 1}
          onClick={() => go(index + 1)}
          aria-label="Next photo"
        >
          <svg viewBox="0 0 14 14" aria-hidden="true">
            <path d="m5 2 5 5-5 5" />
          </svg>
        </motion.button>
      </div>
      <motion.footer className="mizu-lightbox-foot" style={{ opacity: chrome }}>
        {item.caption && (
          <div className="mizu-lightbox-caption">{item.caption}</div>
        )}
        <ol
          ref={stripRef}
          className="mizu-lightbox-strip"
          aria-label="All photos"
        >
          {items.map((it, i) => (
            <li key={it.id}>
              <button
                type="button"
                aria-label={it.alt}
                aria-current={i === index || undefined}
                onClick={() => go(i)}
              >
                <img
                  src={it.thumbnail ?? it.src}
                  alt=""
                  loading="lazy"
                  draggable={false}
                />
              </button>
            </li>
          ))}
        </ol>
      </motion.footer>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </dialog>
  );
}

function onScreen(el?: Element) {
  const r = el?.getBoundingClientRect();
  return r && r.width > 0 && r.bottom > 0 && r.top < window.innerHeight
    ? r
    : null;
}
function distance(points: Point[]) {
  return Math.hypot(points[0]!.x - points[1]!.x, points[0]!.y - points[1]!.y);
}
