"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "../motion/Preferences.tsx";
import {
  useAnnouncer,
  useControllable,
  useElementSize,
  useTween,
  type SignatureTone,
} from "./internal.ts";
import { squarify, type Box } from "./squarify.ts";

export { squarify } from "./squarify.ts";

export type TreemapNode = {
  id: string;
  label: string;
  /** A leaf's size. Branches sum their children. */
  value?: number;
  children?: readonly TreemapNode[];
  tone?: SignatureTone;
  /** Shown in the readout for this node. */
  detail?: ReactNode;
};

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const arrange = (
  node: TreemapNode,
  box: Box,
  totals: Map<TreemapNode, number>,
) =>
  squarify(
    (node.children ?? []).map((c) => ({ item: c, value: totals.get(c) ?? 0 })),
    box,
  );

const sum = (node: TreemapNode, cache: Map<TreemapNode, number>): number => {
  if (cache.has(node)) return cache.get(node)!;
  const total = node.children?.length
    ? node.children.reduce((s, c) => s + sum(c, cache), 0)
    : Math.max(0, Number.isFinite(node.value) ? node.value! : 0);
  cache.set(node, total);
  return total;
};

/**
 * A hierarchy by size. Blocks are proportional to their value; opening one
 * moves the camera into it, and the path leads back out.
 */
export function Treemap({
  label,
  data,
  format = (v) => compact.format(v),
  path,
  defaultPath = [],
  onPathChange,
  onSelect,
  heat,
  height = 440,
  className = "",
  style,
}: {
  label: string;
  /** The root. Its children fill the first view. */
  data: TreemapNode;
  format?: (value: number) => string;
  /** Ids from the root's child down to the opened node. */
  path?: readonly string[];
  defaultPath?: readonly string[];
  onPathChange?: (path: readonly string[]) => void;
  /** Called when a leaf is chosen. */
  onSelect?: (node: TreemapNode, path: readonly TreemapNode[]) => void;
  /** 0–1 intensity mixed into each block's surface, e.g. growth or error rate. */
  heat?: (node: TreemapNode) => number | undefined;
  height?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const [stageRef, { width }] = useElementSize<HTMLDivElement>();
  const [message, announce] = useAnnouncer();
  const [tween] = useTween();
  const totals = useMemo(() => {
    const cache = new Map<TreemapNode, number>();
    sum(data, cache);
    return cache;
  }, [data]);
  const [trail, setTrail] = useControllable<readonly string[]>(
    path,
    defaultPath,
    onPathChange,
  );

  // Resolve ids to nodes, stopping at the first id that no longer exists.
  const chain = useMemo(() => {
    const nodes: TreemapNode[] = [data];
    for (const step of trail) {
      const next = nodes[nodes.length - 1]!.children?.find(
        (c) => c.id === step,
      );
      if (!next?.children?.length) break;
      nodes.push(next);
    }
    return nodes;
  }, [data, trail]);
  const focus = chain[chain.length - 1]!;
  const full: Box = { x: 0, y: 0, w: width, h: height };
  const layout = (node: TreemapNode, box: Box) => arrange(node, box, totals);
  const current = useMemo(
    () => arrange(focus, { x: 0, y: 0, w: width, h: height }, totals),
    [focus, width, height, totals],
  );

  // A move between levels is a camera move: the opened block's box fills the stage.
  const [motion, setMotion] = useState<{
    layers: [TreemapNode, Box][][];
    from: Box;
    to: Box;
    t: number;
    opening: boolean;
  } | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const nodes = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null>(null);

  // The entering level uses its final arrangement, squeezed into the opened block's box.
  const inside = (node: TreemapNode, box: Box): [TreemapNode, Box][] =>
    [...layout(node, full)].map(([n, r]) => [
      n,
      {
        x: box.x + (r.x * box.w) / width,
        y: box.y + (r.y * box.h) / height,
        w: (r.w * box.w) / width,
        h: (r.h * box.h) / height,
      },
    ]);
  const go = (
    next: readonly string[],
    opened?: TreemapNode,
    closing?: TreemapNode,
  ) => {
    if (!width) return setTrail(next);
    if (opened) {
      const box = current.get(opened)!;
      setMotion({
        layers: [[...current], inside(opened, box)],
        from: full,
        to: box,
        t: 0,
        opening: true,
      });
    } else if (closing) {
      const outer = layout(chain[chain.length - 2]!, full);
      const box = outer.get(closing)!;
      setMotion({
        layers: [[...outer], inside(closing, box)],
        from: box,
        to: full,
        t: 0,
        opening: false,
      });
    }
    tween(
      reduce ? 0 : 620,
      (t) => setMotion((m) => (m ? { ...m, t } : m)),
      () => {
        setMotion(null);
        setTrail(next);
      },
    );
  };
  const open = (node: TreemapNode) => {
    if (motion) return;
    if (node.children?.length) {
      setChosen(null);
      pendingFocus.current = node.children.reduce((a, b) =>
        (totals.get(a) ?? 0) >= (totals.get(b) ?? 0) ? a : b,
      ).id;
      announce(`Opened ${node.label}, ${node.children.length} items.`);
      go([...chain.slice(1).map((n) => n.id), node.id], node);
    } else {
      setChosen(node.id);
      onSelect?.(node, [...chain, node]);
    }
  };
  const up = (levels = 1) => {
    if (motion || chain.length < 2) return;
    const closing = chain[chain.length - 1]!;
    pendingFocus.current = closing.id;
    announce(`Back to ${chain[chain.length - 1 - levels]!.label}.`);
    if (levels === 1)
      go(
        chain.slice(1, -1).map((n) => n.id),
        undefined,
        closing,
      );
    else setTrail(chain.slice(1, chain.length - levels).map((n) => n.id));
  };

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target || motion) return;
    const node = nodes.current.get(target);
    if (node) {
      pendingFocus.current = null;
      node.focus({ preventScroll: true });
    }
  });

  // Spatial arrows: move to the nearest block whose centre lies in that direction.
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, node: TreemapNode) => {
    const box = current.get(node);
    if (e.key === "Backspace" || e.key === "Escape") {
      if (chain.length > 1) {
        e.preventDefault();
        up();
      }
      return;
    }
    const dirs: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    };
    const d = dirs[e.key];
    if (!d || !box) return;
    e.preventDefault();
    const cx = box.x + box.w / 2,
      cy = box.y + box.h / 2;
    let best: TreemapNode | undefined,
      score = Infinity;
    for (const [other, b] of current) {
      if (other === node) continue;
      const dx = b.x + b.w / 2 - cx,
        dy = b.y + b.h / 2 - cy;
      const along = dx * d[0] + dy * d[1];
      if (along <= 1) continue;
      const across = Math.abs(dx * d[1]) + Math.abs(dy * d[0]);
      const s = along + across * 2;
      if (s < score) {
        score = s;
        best = other;
      }
    }
    if (best) nodes.current.get(best.id)?.focus();
  };

  const project = (b: Box): Box => {
    if (!motion) return b;
    const t = motion.t;
    const lerp = (a: number, c: number) => a + (c - a) * t;
    const s0 = Math.log(motion.from.w),
      s1 = Math.log(motion.to.w);
    const cw = Math.exp(s0 + (s1 - s0) * t);
    const ch =
      cw *
      (motion.from.h / motion.from.w +
        (motion.to.h / motion.to.w - motion.from.h / motion.from.w) * t);
    const cx =
        lerp(motion.from.x + motion.from.w / 2, motion.to.x + motion.to.w / 2) -
        cw / 2,
      cy =
        lerp(motion.from.y + motion.from.h / 2, motion.to.y + motion.to.h / 2) -
        ch / 2;
    return {
      x: ((b.x - cx) * width) / cw,
      y: ((b.y - cy) * height) / ch,
      w: (b.w * width) / cw,
      h: (b.h * height) / ch,
    };
  };

  const parentTotal = totals.get(focus) ?? 0,
    rootTotal = totals.get(data) ?? 0;
  const readoutNode =
    (active && (focus.children ?? []).find((c) => c.id === active)) ||
    (chosen && (focus.children ?? []).find((c) => c.id === chosen)) ||
    undefined;
  const share = (v: number, of: number) =>
    of ? `${((v / of) * 100).toFixed(v / of < 0.1 ? 1 : 0)}%` : "—";

  // Levels cross-fade in the direction of travel: the deeper level leads going in, trails going out.
  const fade = (layer: number) => {
    if (!motion) return 1;
    const deeper = Math.min(
      1,
      motion.opening ? motion.t * 1.8 : (1 - motion.t) * 1.8,
    );
    return layer === 1 ? deeper : 1 - Math.max(0, deeper - 0.35) / 0.65;
  };
  const block = (
    node: TreemapNode,
    b: Box,
    layer: number,
    interactive: boolean,
  ) => {
    const p = project(b);
    const total = totals.get(node) ?? 0;
    const hot = heat?.(node);
    const branch = !!node.children?.length;
    const nested =
      interactive && !motion && branch && p.w > 120 && p.h > 110
        ? layout(node, { x: 0, y: 50, w: p.w - 2, h: p.h - 52 })
        : null;
    return (
      <li
        key={`${layer}-${node.id}`}
        className="mizu-treemap-block"
        data-layer={layer}
        data-tone={node.tone}
        data-size={
          p.w < 44 || p.h < 26
            ? "dot"
            : p.w < 96 || p.h < 50
              ? "small"
              : undefined
        }
        data-selected={chosen === node.id || undefined}
        style={
          {
            transform: `translate(${p.x}px, ${p.y}px)`,
            width: Math.max(0, p.w),
            height: Math.max(0, p.h),
            "--mizu-heat":
              hot === undefined ? undefined : Math.max(0, Math.min(1, hot)),
            opacity: motion ? fade(layer) : undefined,
          } as CSSProperties
        }
      >
        {interactive ? (
          <button
            ref={(el) => {
              if (el) nodes.current.set(node.id, el);
              else nodes.current.delete(node.id);
            }}
            type="button"
            className="mizu-treemap-face"
            aria-label={`${node.label}, ${format(total)}, ${share(total, parentTotal)} of ${focus.label}${branch ? `, ${node.children!.length} inside. Press Enter to open` : ""}`}
            aria-describedby={`${id}-keys`}
            onClick={() => open(node)}
            onKeyDown={(e) => onKey(e, node)}
            onPointerEnter={() => setActive(node.id)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(node.id)}
            onBlur={() => setActive(null)}
          >
            <span className="mizu-treemap-name">{node.label}</span>
            <span className="mizu-treemap-value">
              {format(total)} <small>{share(total, parentTotal)}</small>
            </span>
            {branch && <i className="mizu-treemap-open" aria-hidden="true" />}
          </button>
        ) : (
          <div className="mizu-treemap-face">
            <span className="mizu-treemap-name">{node.label}</span>
            <span className="mizu-treemap-value">{format(total)}</span>
          </div>
        )}
        {nested && (
          <ul className="mizu-treemap-nested" aria-hidden="true">
            {[...nested].map(([child, cb]) => (
              <li
                key={child.id}
                style={{
                  transform: `translate(${cb.x}px, ${cb.y}px)`,
                  width: cb.w,
                  height: cb.h,
                }}
                data-tone={child.tone}
              >
                {cb.w > 70 && cb.h > 22 && <span>{child.label}</span>}
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <section
      className={`mizu-treemap ${className}`}
      style={style}
      aria-label={label}
    >
      <header className="mizu-treemap-head">
        <nav aria-label={`${label} path`}>
          <ol>
            {chain.map((n, i) => (
              <li key={n.id}>
                {i < chain.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => up(chain.length - 1 - i)}
                    disabled={!!motion}
                  >
                    {i === 0 ? label : n.label}
                  </button>
                ) : (
                  <span aria-current="location">
                    {i === 0 ? label : n.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p>
          {format(parentTotal)}
          {chain.length > 1 && (
            <small> · {share(parentTotal, rootTotal)} of all</small>
          )}
        </p>
      </header>
      <div
        ref={stageRef}
        className="mizu-treemap-stage"
        style={{ height }}
        data-moving={motion ? "" : undefined}
      >
        {width > 0 && (
          <ul
            aria-label={`${focus.label}: ${focus.children?.length ?? 0} items by size`}
          >
            {motion
              ? motion.layers.flatMap((layer, i) =>
                  layer.map(([n, b]) => block(n, b, i, false)),
                )
              : [...current].map(([n, b]) => block(n, b, 0, true))}
          </ul>
        )}
        {width > 0 && !current.size && !motion && (
          <p className="mizu-treemap-empty">Nothing to measure here.</p>
        )}
      </div>
      <footer className="mizu-treemap-readout" aria-live="off">
        {readoutNode ? (
          <>
            <strong>{readoutNode.label}</strong>
            <span>{format(totals.get(readoutNode) ?? 0)}</span>
            <span>
              {share(totals.get(readoutNode) ?? 0, parentTotal)} of{" "}
              {focus.label}
            </span>
            <span>{share(totals.get(readoutNode) ?? 0, rootTotal)} of all</span>
            {readoutNode.detail && <small>{readoutNode.detail}</small>}
          </>
        ) : (
          <span className="mizu-treemap-hint">
            {chain.length > 1
              ? "Enter opens a block · Backspace goes back"
              : "Choose a block to open it"}
          </span>
        )}
      </footer>
      <p id={`${id}-keys`} className="mizu-sr-only">
        Arrow keys move between neighbouring blocks. Enter opens a block,
        Backspace returns to the level above.
      </p>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </section>
  );
}
