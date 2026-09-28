"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { useReducedMotion } from "../motion/Preferences.tsx";
import { EASE_EXPO } from "../motion/easings.ts";
import { useAnnouncer, type SignatureTone } from "./internal.ts";

export type TriageDirection = "left" | "right" | "up";
export type TriageDecision = {
  id: string;
  label: string;
  direction: TriageDirection;
  tone?: SignatureTone;
};
type Decided<T> = { item: T; decision: TriageDecision };

const KEYS: Record<TriageDirection, string> = {
  left: "ArrowLeft",
  right: "ArrowRight",
  up: "ArrowUp",
};
const GLYPH: Record<TriageDirection, string> = {
  left: "←",
  right: "→",
  up: "↑",
};
const THRESHOLD = 110;

/**
 * Decisions at the speed of a gesture: fling the top card toward a decision,
 * or use arrow keys and buttons. Every decision can be undone.
 */
export function TriageDeck<T extends { id: string }>({
  label,
  items,
  renderItem,
  itemLabel,
  decisions,
  onDecide,
  onUndo,
  empty = "Nothing left to review.",
  className = "",
  style,
}: {
  label: string;
  items: readonly T[];
  renderItem: (item: T) => ReactNode;
  /** A short name for announcements, e.g. the item's title. */
  itemLabel: (item: T) => string;
  /** Up to one decision per direction: left, right and up. */
  decisions: readonly TriageDecision[];
  onDecide?: (item: T, decision: TriageDecision) => void;
  onUndo?: (item: T, decision: TriageDecision) => void;
  empty?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const [message, announce] = useAnnouncer();
  const [history, setHistory] = useState<Decided<T>[]>([]);
  const [returning, setReturning] = useState<{
    id: string;
    direction: TriageDirection;
  } | null>(null);
  const flinging = useRef(false);
  const top = useRef<{ fling: (decision: TriageDecision) => void } | null>(
    null,
  );
  const decidedIds = new Set(history.map((h) => h.item.id));
  const queue = items.filter((i) => !decidedIds.has(i.id));
  const current = queue[0];
  const byDirection = (d: TriageDirection) =>
    decisions.find((x) => x.direction === d);

  const commit = (decision: TriageDecision) => {
    if (!current) return;
    flinging.current = false;
    setHistory((h) => [...h, { item: current, decision }]);
    setReturning(null);
    onDecide?.(current, decision);
    const next = queue[1];
    announce(
      `${decision.label}: ${itemLabel(current)}.${next ? ` Next: ${itemLabel(next)}.` : " Queue cleared."}`,
    );
  };
  const decide = (decision: TriageDecision) => {
    if (!current || flinging.current) return;
    flinging.current = true;
    if (top.current) top.current.fling(decision);
    else commit(decision);
  };
  const undo = () => {
    const last = history[history.length - 1];
    if (!last || flinging.current) return;
    setHistory((h) => h.slice(0, -1));
    setReturning({ id: last.item.id, direction: last.decision.direction });
    onUndo?.(last.item, last.decision);
    announce(`Undid ${last.decision.label} on ${itemLabel(last.item)}.`);
  };
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("input, textarea, select")) return;
    const decision = decisions.find((d) => KEYS[d.direction] === e.key);
    if (decision && current) {
      e.preventDefault();
      decide(decision);
    } else if (
      (e.key === "Backspace" || e.key === "z" || e.key === "Z") &&
      history.length
    ) {
      e.preventDefault();
      undo();
    }
  };

  const tally = decisions.map((d) => ({
    d,
    n: history.filter((h) => h.decision.id === d.id).length,
  }));
  const position = history.length + 1;
  const total = items.length;

  return (
    <section
      className={`mizu-triage ${className}`}
      style={style}
      aria-label={label}
      onKeyDown={onKey}
    >
      <header className="mizu-triage-head">
        <p className="mizu-triage-count">
          {current ? (
            <>
              <strong>{String(position).padStart(2, "0")}</strong> /{" "}
              {String(total).padStart(2, "0")}
            </>
          ) : (
            "Done"
          )}
        </p>
        <ul className="mizu-triage-tally" aria-label="Decisions so far">
          {tally.map(({ d, n }) => (
            <li key={d.id} data-tone={d.tone}>
              <i aria-hidden="true" />
              {d.label} <b>{n}</b>
            </li>
          ))}
        </ul>
      </header>

      <div
        className="mizu-triage-stage"
        tabIndex={0}
        role="group"
        aria-roledescription="card deck"
        aria-label={
          current
            ? `${itemLabel(current)}, item ${position} of ${total}`
            : `${label}: empty`
        }
        aria-describedby={`${id}-keys`}
      >
        {queue
          .slice(0, 3)
          .map((item, depth) =>
            depth === 0 ? (
              <TopCard
                key={item.id}
                handleRef={top}
                reduce={!!reduce}
                enterFrom={
                  returning?.id === item.id ? returning.direction : null
                }
                decisions={decisions}
                onCommit={commit}
                onRelease={() => {
                  flinging.current = false;
                }}
              >
                {renderItem(item)}
              </TopCard>
            ) : (
              <motion.div
                key={item.id}
                className="mizu-triage-card"
                aria-hidden="true"
                initial={false}
                animate={{
                  scale: 1 - depth * 0.05,
                  y: depth * 14,
                  opacity: 1 - depth * 0.3,
                }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.4, ease: EASE_EXPO }
                }
                style={{ zIndex: 3 - depth }}
              >
                {renderItem(item)}
              </motion.div>
            ),
          )
          .reverse()}
        {!current && (
          <div className="mizu-triage-empty" role="status">
            <span aria-hidden="true" />
            <div>{empty}</div>
          </div>
        )}
      </div>

      <div className="mizu-triage-actions">
        {(["left", "up", "right"] as const).map((direction) => {
          const d = byDirection(direction);
          return d ? (
            <button
              key={d.id}
              type="button"
              data-tone={d.tone}
              data-direction={direction}
              disabled={!current}
              onClick={() => decide(d)}
            >
              <kbd aria-hidden="true">{GLYPH[direction]}</kbd>
              {d.label}
            </button>
          ) : null;
        })}
        <button
          type="button"
          className="mizu-triage-undo"
          disabled={!history.length}
          onClick={undo}
        >
          Undo
        </button>
      </div>
      <p id={`${id}-keys`} className="mizu-sr-only">
        {decisions
          .map(
            (d) =>
              `${GLYPH[d.direction] === "←" ? "Left" : GLYPH[d.direction] === "→" ? "Right" : "Up"} arrow: ${d.label}.`,
          )
          .join(" ")}{" "}
        Backspace undoes.
      </p>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </section>
  );
}

function TopCard({
  children,
  handleRef,
  reduce,
  enterFrom,
  decisions,
  onCommit,
  onRelease,
}: {
  children: ReactNode;
  handleRef: React.RefObject<{
    fling: (decision: TriageDecision) => void;
  } | null>;
  reduce: boolean;
  enterFrom: TriageDirection | null;
  decisions: readonly TriageDecision[];
  onCommit: (decision: TriageDecision) => void;
  onRelease: () => void;
}) {
  const start = enterFrom && !reduce ? offscreen(enterFrom) : { x: 0, y: 0 };
  const x = useMotionValue(start.x),
    y = useMotionValue(start.y);
  const rotate = useTransform(x, [-320, 320], reduce ? [0, 0] : [-14, 14]);
  const byDirection = (d: TriageDirection) =>
    decisions.find((x) => x.direction === d);
  const left = byDirection("left"),
    right = byDirection("right"),
    up = byDirection("up");
  const leftStamp = useTransform(x, [-THRESHOLD, -30], [1, 0]);
  const rightStamp = useTransform(x, [30, THRESHOLD], [0, 1]);
  const upStamp = useTransform(y, [-THRESHOLD, -30], [1, 0]);
  // An undone card arrives from the side it left by; otherwise it sits in place.
  useEffect(() => {
    if (x.get() === 0 && y.get() === 0) return;
    const ax = animate(x, 0, { type: "spring", stiffness: 260, damping: 28 });
    const ay = animate(y, 0, { type: "spring", stiffness: 260, damping: 28 });
    return () => {
      ax.stop();
      ay.stop();
    };
  }, [x, y]);

  const fling = (decision: TriageDecision, velocity = { x: 0, y: 0 }) => {
    if (reduce) {
      onCommit(decision);
      return;
    }
    const target = offscreen(decision.direction);
    const ax = animate(x, target.x, {
      type: "spring",
      velocity: velocity.x,
      stiffness: 180,
      damping: 26,
      restDelta: 40,
    });
    const ay = animate(y, target.y, {
      type: "spring",
      velocity: velocity.y,
      stiffness: 180,
      damping: 26,
      restDelta: 40,
    });
    void (decision.direction === "up" ? ay : ax).then(() => onCommit(decision));
  };
  useEffect(() => {
    const own = { fling: (d: TriageDecision) => fling(d) };
    handleRef.current = own;
    return () => {
      if (handleRef.current === own) handleRef.current = null;
    };
  });

  return (
    <motion.div
      className="mizu-triage-card"
      data-top=""
      style={{ x, y, rotate, zIndex: 4 }}
      drag={up ? true : "x"}
      dragSnapToOrigin={false}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={(_, info: PanInfo) => {
        const { offset, velocity } = info;
        const pick =
          up &&
          (offset.y < -THRESHOLD || velocity.y < -700) &&
          Math.abs(offset.y) > Math.abs(offset.x)
            ? up
            : right && (offset.x > THRESHOLD || velocity.x > 700)
              ? right
              : left && (offset.x < -THRESHOLD || velocity.x < -700)
                ? left
                : null;
        if (pick) fling(pick, velocity);
        else {
          onRelease();
          void animate(x, 0, { type: "spring", stiffness: 420, damping: 32 });
          void animate(y, 0, { type: "spring", stiffness: 420, damping: 32 });
        }
      }}
    >
      {left && (
        <motion.span
          className="mizu-triage-stamp"
          data-side="left"
          data-tone={left.tone}
          style={{ opacity: leftStamp }}
          aria-hidden="true"
        >
          {left.label}
        </motion.span>
      )}
      {right && (
        <motion.span
          className="mizu-triage-stamp"
          data-side="right"
          data-tone={right.tone}
          style={{ opacity: rightStamp }}
          aria-hidden="true"
        >
          {right.label}
        </motion.span>
      )}
      {up && (
        <motion.span
          className="mizu-triage-stamp"
          data-side="up"
          data-tone={up.tone}
          style={{ opacity: upStamp }}
          aria-hidden="true"
        >
          {up.label}
        </motion.span>
      )}
      {children}
    </motion.div>
  );
}

function offscreen(direction: TriageDirection) {
  const w = typeof window === "undefined" ? 1200 : window.innerWidth;
  return direction === "up"
    ? { x: 0, y: -(typeof window === "undefined" ? 900 : window.innerHeight) }
    : { x: (direction === "left" ? -1 : 1) * (w + 200), y: 0 };
}
