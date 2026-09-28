"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
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
  useControllable,
  useElementSize,
  useIsoLayoutEffect,
  useLatest,
  useTween,
} from "./internal";

/** The world point at the centre of the viewport, and the zoom. */
export type PlaneView = { x: number; y: number; zoom: number };
export type PlaneBox = { x: number; y: number; width: number; height: number };
export type PlaneHandle = {
  fit: (padding?: number) => void;
  zoomBy: (factor: number) => void;
  flyTo: (target: PlaneBox | { x: number; y: number; zoom?: number }) => void;
  toWorld: (clientX: number, clientY: number) => { x: number; y: number };
};

type Registry = {
  register: (id: string, box: PlaneBox | null) => void;
  reveal: (box: PlaneBox) => void;
  zoom: () => number;
  toWorld: (clientX: number, clientY: number) => { x: number; y: number };
};
const PlaneContext = createContext<Registry | null>(null);

/** For content inside a Plane that needs world coordinates, e.g. drawing connections while dragging. */
export function usePlane() {
  const plane = useContext(PlaneContext);
  if (!plane) throw new Error("usePlane must be used within <Plane>");
  return plane;
}

const union = (boxes: Iterable<PlaneBox>): PlaneBox | null => {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const b of boxes) {
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.width);
    y1 = Math.max(y1, b.y + b.height);
  }
  return x0 <= x1 ? { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } : null;
};

/**
 * An infinite, zoomable surface. Drag or scroll to travel, pinch or
 * Ctrl-scroll to zoom, and tab between items — the camera follows focus.
 * Content can adapt to scale through `--mizu-plane-zoom` and the world's
 * `data-scale="far"` when zoomed out.
 */
export const Plane = forwardRef<
  PlaneHandle,
  {
    label: string;
    children?: ReactNode;
    view?: PlaneView;
    defaultView?: PlaneView;
    onViewChange?: (view: PlaneView) => void;
    minZoom?: number;
    maxZoom?: number;
    grid?: "dots" | "lines" | "none";
    minimap?: boolean;
    /** Show the pointer's world coordinates. */
    coordinates?: boolean;
    /** Extra controls placed in the toolbar. */
    tools?: ReactNode;
    onBackgroundPointerDown?: (point: { x: number; y: number }) => void;
    className?: string;
    style?: CSSProperties;
  }
>(function Plane(
  {
    label,
    children,
    view,
    defaultView,
    onViewChange,
    minZoom = 0.15,
    maxZoom = 4,
    grid = "dots",
    minimap = true,
    coordinates = true,
    tools,
    onBackgroundPointerDown,
    className = "",
    style,
  },
  ref,
) {
  const id = useId();
  const reduce = useReducedMotion();
  const [viewportRef, size] = useElementSize<HTMLDivElement>();
  const [tween, stopTween] = useTween();
  const [camera, setCamera] = useControllable<PlaneView>(
    view,
    defaultView ?? { x: 0, y: 0, zoom: 1 },
    onViewChange,
  );
  const cameraRef = useLatest(camera);
  const sizeRef = useLatest(size);
  const boxes = useRef(new Map<string, PlaneBox>());
  const [items, setItems] = useState<readonly PlaneBox[]>([]);
  const bump = useRef(0);
  const inertia = useRef(0);
  const fitted = useRef(!!(view || defaultView));
  useEffect(
    () => () => {
      cancelAnimationFrame(bump.current);
      cancelAnimationFrame(inertia.current);
    },
    [],
  );

  const set = useCallback(
    (next: PlaneView) =>
      setCamera({
        x: next.x,
        y: next.y,
        zoom: clamp(next.zoom, minZoom, maxZoom),
      }),
    [setCamera, minZoom, maxZoom],
  );
  const toWorld = useCallback(
    (clientX: number, clientY: number) => {
      const r = viewportRef.current?.getBoundingClientRect();
      const c = cameraRef.current;
      if (!r) return { x: c.x, y: c.y };
      return {
        x: c.x + (clientX - r.left - r.width / 2) / c.zoom,
        y: c.y + (clientY - r.top - r.height / 2) / c.zoom,
      };
    },
    [viewportRef, cameraRef],
  );

  /** A camera flight: long distances pull back before settling in. */
  const fly = useCallback(
    (target: PlaneView) => {
      cancelAnimationFrame(inertia.current);
      const from = cameraRef.current;
      const to = { ...target, zoom: clamp(target.zoom, minZoom, maxZoom) };
      const { width } = sizeRef.current;
      const distance =
        Math.hypot(to.x - from.x, to.y - from.y) * Math.min(from.zoom, to.zoom);
      const dip = width ? clamp(distance / width - 0.6, 0, 1.2) * 0.45 : 0;
      tween(reduce ? 0 : 520 + dip * 500, (t) => {
        const z =
          Math.exp(
            Math.log(from.zoom) + (Math.log(to.zoom) - Math.log(from.zoom)) * t,
          ) *
          (1 - dip * Math.sin(Math.PI * t));
        set({
          x: from.x + (to.x - from.x) * t,
          y: from.y + (to.y - from.y) * t,
          zoom: z,
        });
      });
    },
    [cameraRef, sizeRef, tween, reduce, set, minZoom, maxZoom],
  );
  const frame = useCallback(
    (box: PlaneBox, padding = 48) => {
      const { width, height } = sizeRef.current;
      if (!width || !height) return null;
      return {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
        zoom: clamp(
          Math.min(
            (width - padding * 2) / Math.max(1, box.width),
            (height - padding * 2) / Math.max(1, box.height),
          ),
          minZoom,
          maxZoom,
        ),
      };
    },
    [sizeRef, minZoom, maxZoom],
  );
  const fit = useCallback(
    (padding?: number) => {
      const content = union(boxes.current.values());
      const target = content && frame(content, padding);
      if (target) fly({ ...target, zoom: Math.min(target.zoom, 1.25) });
    },
    [frame, fly],
  );
  const zoomBy = useCallback(
    (factor: number, at?: { x: number; y: number }) => {
      const c = cameraRef.current;
      const z = clamp(c.zoom * factor, minZoom, maxZoom);
      const p = at ?? c;
      fly({
        x: p.x + (c.x - p.x) * (c.zoom / z),
        y: p.y + (c.y - p.y) * (c.zoom / z),
        zoom: z,
      });
    },
    [cameraRef, fly, minZoom, maxZoom],
  );
  const reveal = useCallback(
    (box: PlaneBox) => {
      const { width, height } = sizeRef.current;
      const c = cameraRef.current;
      if (!width) return;
      const margin = 40 / c.zoom;
      const left = c.x - width / 2 / c.zoom,
        top = c.y - height / 2 / c.zoom;
      const inside =
        box.x >= left + margin &&
        box.y >= top + margin &&
        box.x + box.width <= left + width / c.zoom - margin &&
        box.y + box.height <= top + height / c.zoom - margin;
      if (inside) return;
      const fitsAtZoom =
        box.width * c.zoom < width - 80 && box.height * c.zoom < height - 80;
      fly(
        fitsAtZoom
          ? {
              x: box.x + box.width / 2,
              y: box.y + box.height / 2,
              zoom: c.zoom,
            }
          : (frame(box) ?? c),
      );
    },
    [sizeRef, cameraRef, fly, frame],
  );

  useImperativeHandle(ref, () => ({
    fit,
    zoomBy: (f) => zoomBy(f),
    flyTo: (target) => {
      if ("width" in target) {
        const t = frame(target);
        if (t) fly(t);
      } else
        fly({
          x: target.x,
          y: target.y,
          zoom: target.zoom ?? cameraRef.current.zoom,
        });
    },
    toWorld,
  }));

  const registry = useMemo<Registry>(
    () => ({
      register: (key, box) => {
        if (box) boxes.current.set(key, box);
        else boxes.current.delete(key);
        cancelAnimationFrame(bump.current);
        bump.current = requestAnimationFrame(() =>
          setItems([...boxes.current.values()]),
        );
      },
      reveal,
      zoom: () => cameraRef.current.zoom,
      toWorld,
    }),
    [reveal, cameraRef, toWorld],
  );

  // Frame the content once it has been measured, unless a view was supplied.
  useEffect(() => {
    if (fitted.current || !size.width || !items.length) return;
    fitted.current = true;
    const content = union(items);
    const target = content && frame(content);
    if (target) set({ ...target, zoom: Math.min(target.zoom, 1) });
  }, [items, size.width, frame, set]);

  // Wheel: Ctrl or pinch zooms at the pointer; plain scrolling pans only once the plane is active.
  const [hint, setHint] = useState(false);
  const hintTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(hintTimer.current), []);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const wheel = (e: WheelEvent) => {
      const c = cameraRef.current;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        stopTween();
        const at = toWorld(e.clientX, e.clientY);
        const z = clamp(
          c.zoom * Math.exp(-clamp(e.deltaY, -50, 50) * 0.01),
          minZoom,
          maxZoom,
        );
        set({
          x: at.x + (c.x - at.x) * (c.zoom / z),
          y: at.y + (c.y - at.y) * (c.zoom / z),
          zoom: z,
        });
      } else if (viewport.contains(document.activeElement)) {
        e.preventDefault();
        stopTween();
        set({ ...c, x: c.x + e.deltaX / c.zoom, y: c.y + e.deltaY / c.zoom });
      } else {
        setHint(true);
        window.clearTimeout(hintTimer.current);
        hintTimer.current = window.setTimeout(() => setHint(false), 1600);
      }
    };
    viewport.addEventListener("wheel", wheel, { passive: false });
    return () => viewport.removeEventListener("wheel", wheel);
  }, [viewportRef, cameraRef, toWorld, set, stopTween, minZoom, maxZoom]);

  // Pointer: drag pans with inertia, two pointers pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    vx: number;
    vy: number;
    t: number;
    pinch?: number;
  } | null>(null);
  const [panning, setPanning] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      e.button !== 0 ||
      target.closest(
        "[data-plane-item], button, a, input, textarea, select, [data-plane-ignore]",
      )
    )
      return;
    cancelAnimationFrame(inertia.current);
    stopTween();
    e.currentTarget.focus({ preventScroll: true });
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    gesture.current = {
      vx: 0,
      vy: 0,
      t: performance.now(),
      pinch:
        pts.length === 2
          ? Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y)
          : undefined,
    };
    setPanning(true);
    if (pts.length === 1)
      onBackgroundPointerDown?.(toWorld(e.clientX, e.clientY));
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (coordinates && e.pointerType === "mouse")
      setPointer(toWorld(e.clientX, e.clientY));
    const previous = pointers.current.get(e.pointerId);
    const g = gesture.current;
    if (!previous || !g) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const c = cameraRef.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && g.pinch) {
      const d = Math.max(
        10,
        Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y),
      );
      const mid = toWorld(
        (pts[0]!.x + pts[1]!.x) / 2,
        (pts[0]!.y + pts[1]!.y) / 2,
      );
      const z = clamp(c.zoom * (d / g.pinch), minZoom, maxZoom);
      g.pinch = d;
      set({
        x: mid.x + (c.x - mid.x) * (c.zoom / z),
        y: mid.y + (c.y - mid.y) * (c.zoom / z),
        zoom: z,
      });
      return;
    }
    const dx = e.clientX - previous.x,
      dy = e.clientY - previous.y;
    const now = performance.now();
    const dt = Math.max(1, now - g.t);
    g.vx = -dx / c.zoom / dt;
    g.vy = -dy / c.zoom / dt;
    g.t = now;
    set({ ...c, x: c.x - dx / c.zoom, y: c.y - dy / c.zoom });
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;
    if (pointers.current.size) {
      gesture.current = { vx: 0, vy: 0, t: performance.now() };
      return;
    }
    gesture.current = null;
    setPanning(false);
    if (!g || reduce || performance.now() - g.t > 80) return;
    let { vx, vy } = g,
      last = performance.now();
    const drift = (now: number) => {
      const dt = now - last;
      last = now;
      const decay = Math.exp(-dt / 260);
      vx *= decay;
      vy *= decay;
      const c = cameraRef.current;
      if (Math.hypot(vx, vy) * c.zoom < 0.02) return;
      set({ ...c, x: c.x + vx * dt, y: c.y + vy * dt });
      inertia.current = requestAnimationFrame(drift);
    };
    inertia.current = requestAnimationFrame(drift);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const c = cameraRef.current;
    const step = (e.shiftKey ? 240 : 80) / c.zoom;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => fly({ ...c, x: c.x - step }),
      ArrowRight: () => fly({ ...c, x: c.x + step }),
      ArrowUp: () => fly({ ...c, y: c.y - step }),
      ArrowDown: () => fly({ ...c, y: c.y + step }),
      "+": () => zoomBy(1.4),
      "=": () => zoomBy(1.4),
      "-": () => zoomBy(1 / 1.4),
      "0": () => fit(),
      "1": () => fly({ ...c, zoom: 1 }),
    };
    const action = keys[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  const { width, height } = size;
  const { x, y, zoom } = camera;
  const tx = width / 2 - x * zoom,
    ty = height / 2 - y * zoom;
  let spacing = 24 * zoom;
  while (spacing < 10) spacing *= 4;
  const content = useMemo(() => union(items), [items]);

  return (
    <PlaneContext.Provider value={registry}>
      <section
        className={`mizu-plane ${className}`}
        style={style}
        aria-label={label}
      >
        <div
          ref={viewportRef}
          className="mizu-plane-viewport"
          role="group"
          aria-roledescription="canvas"
          aria-label={`${label}, ${Math.round(zoom * 100)}%`}
          aria-describedby={`${id}-help`}
          tabIndex={0}
          data-grid={grid}
          data-panning={panning || undefined}
          style={
            {
              "--mizu-plane-step": `${spacing}px`,
              "--mizu-plane-offset": `${tx}px ${ty}px`,
            } as CSSProperties
          }
          onKeyDown={onKey}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={() => setPointer(null)}
          onDoubleClick={(e) => {
            if ((e.target as HTMLElement).closest("[data-plane-item], button"))
              return;
            zoomBy(e.shiftKey ? 1 / 1.8 : 1.8, toWorld(e.clientX, e.clientY));
          }}
        >
          <div
            className="mizu-plane-world"
            data-scale={zoom < 0.62 ? "far" : undefined}
            style={
              {
                transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
                "--mizu-plane-zoom": zoom,
              } as CSSProperties
            }
          >
            <span className="mizu-plane-origin" aria-hidden="true" />
            {children}
          </div>
          {hint && (
            <p className="mizu-plane-hint" aria-hidden="true">
              Click the canvas to scroll it · Ctrl + scroll to zoom
            </p>
          )}
        </div>

        <div
          className="mizu-plane-tools"
          role="toolbar"
          aria-label={`${label} view`}
          data-plane-ignore
        >
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => zoomBy(1 / 1.4)}
            disabled={zoom <= minZoom + 1e-6}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 6h8" />
            </svg>
          </button>
          <button
            type="button"
            className="mizu-plane-zoom"
            aria-label="Reset zoom to 100%"
            onClick={() => fly({ ...camera, zoom: 1 })}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => zoomBy(1.4)}
            disabled={zoom >= maxZoom - 1e-6}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 6h8M6 2v8" />
            </svg>
          </button>
          <button type="button" onClick={() => fit()} disabled={!content}>
            Fit
          </button>
          {tools}
        </div>

        {coordinates && (
          <p className="mizu-plane-coords" aria-hidden="true">
            {pointer ? (
              <>
                <span>X {Math.round(pointer.x)}</span>
                <span>Y {Math.round(pointer.y)}</span>
              </>
            ) : (
              <span>
                {Math.round(x)}, {Math.round(y)}
              </span>
            )}
          </p>
        )}

        {minimap && content && width > 0 && (
          <Minimap
            content={content}
            boxes={items}
            camera={camera}
            viewport={size}
            onJump={(p) => fly({ ...cameraRef.current, ...p })}
          />
        )}
        <p id={`${id}-help`} className="mizu-sr-only">
          Arrow keys move the view, plus and minus zoom, 0 fits everything, 1
          returns to 100%. Tab moves between items and the view follows.
        </p>
      </section>
    </PlaneContext.Provider>
  );
});

function Minimap({
  content,
  boxes,
  camera,
  viewport,
  onJump,
}: {
  content: PlaneBox;
  boxes: readonly PlaneBox[];
  camera: PlaneView;
  viewport: { width: number; height: number };
  onJump: (point: { x: number; y: number }) => void;
}) {
  const W = 168,
    H = 112,
    pad = 10;
  const view = {
    x: camera.x - viewport.width / 2 / camera.zoom,
    y: camera.y - viewport.height / 2 / camera.zoom,
    width: viewport.width / camera.zoom,
    height: viewport.height / camera.zoom,
  };
  const all = union([content, view])!;
  const s = Math.min((W - pad * 2) / all.width, (H - pad * 2) / all.height);
  const ox = pad + (W - pad * 2 - all.width * s) / 2 - all.x * s,
    oy = pad + (H - pad * 2 - all.height * s) / 2 - all.y * s;
  const drag = useRef(false);
  const jump = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onJump({
      x: (e.clientX - r.left - ox) / s,
      y: (e.clientY - r.top - oy) / s,
    });
  };
  return (
    <svg
      className="mizu-plane-minimap"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      aria-hidden="true"
      data-plane-ignore
      onPointerDown={(e) => {
        drag.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        jump(e);
      }}
      onPointerMove={(e) => drag.current && jump(e)}
      onPointerUp={() => {
        drag.current = false;
      }}
    >
      {boxes.map((b, i) => (
        <rect
          key={i}
          x={ox + b.x * s}
          y={oy + b.y * s}
          width={Math.max(1.5, b.width * s)}
          height={Math.max(1.5, b.height * s)}
        />
      ))}
      <rect
        className="mizu-plane-minimap-view"
        x={ox + view.x * s}
        y={oy + view.y * s}
        width={view.width * s}
        height={view.height * s}
      />
    </svg>
  );
}

/**
 * Content placed at world coordinates. Supplying `onMove` makes it draggable
 * with the pointer and nudgeable with arrow keys (Shift for larger steps).
 */
export function PlaneItem({
  id,
  x,
  y,
  width,
  height,
  label,
  onMove,
  onMoveEnd,
  children,
  className = "",
  style,
  onFocus,
  onKeyDown,
  ...rest
}: {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  onMove?: (x: number, y: number) => void;
  onMoveEnd?: (x: number, y: number) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "id" | "onMove" | "children" | "className" | "style"
>) {
  const plane = usePlane();
  const node = useRef<HTMLDivElement>(null);
  const position = useLatest({ x, y });
  const drag = useRef<{
    px: number;
    py: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  useIsoLayoutEffect(() => {
    const el = node.current;
    if (!el) return;
    const measure = () =>
      plane.register(id, {
        x,
        y,
        width: width ?? el.offsetWidth,
        height: height ?? el.offsetHeight,
      });
    measure();
    if (width !== undefined && height !== undefined)
      return () => plane.register(id, null);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      observer?.disconnect();
      plane.register(id, null);
    };
  }, [id, x, y, width, height, plane]);

  return (
    <div
      ref={node}
      data-plane-item={id}
      role="group"
      aria-label={label}
      tabIndex={0}
      className={`mizu-plane-item ${className}`}
      data-draggable={onMove ? "" : undefined}
      data-dragging={dragging || undefined}
      style={{
        ...style,
        transform: `translate(${x}px, ${y}px)`,
        width,
        height,
      }}
      {...rest}
      onFocus={(e) => {
        onFocus?.(e);
        if (
          e.target === e.currentTarget &&
          e.currentTarget.matches(":focus-visible")
        )
          plane.reveal({
            x,
            y,
            width: width ?? e.currentTarget.offsetWidth,
            height: height ?? e.currentTarget.offsetHeight,
          });
      }}
      onPointerDown={(e) => {
        if (
          !onMove ||
          e.button !== 0 ||
          (e.target as HTMLElement).closest(
            "button, a, input, textarea, select, [data-plane-ignore]",
          )
        )
          return;
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = {
          px: e.clientX,
          py: e.clientY,
          x: position.current.x,
          y: position.current.y,
          moved: false,
        };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || !onMove) return;
        const z = plane.zoom();
        const dx = (e.clientX - d.px) / z,
          dy = (e.clientY - d.py) / z;
        if (!d.moved && Math.hypot(dx, dy) * z < 3) return;
        if (!d.moved) setDragging(true);
        d.moved = true;
        onMove(Math.round(d.x + dx), Math.round(d.y + dy));
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        setDragging(false);
        if (d?.moved) onMoveEnd?.(position.current.x, position.current.y);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!onMove || e.target !== e.currentTarget || e.defaultPrevented)
          return;
        const step = e.shiftKey ? 48 : 8;
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        };
        const d = delta[e.key];
        if (!d) return;
        e.preventDefault();
        onMove(x + d[0], y + d[1]);
        onMoveEnd?.(x + d[0], y + d[1]);
      }}
    >
      {children}
    </div>
  );
}
