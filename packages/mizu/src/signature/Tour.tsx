"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "../motion/Preferences.tsx";
import { Button } from "../ui/Button.tsx";
import { clamp, useAnnouncer, useControllable, useLatest } from "./internal.ts";

export type TourStep = {
  /** A CSS selector or a function returning the element to highlight. */
  target: string | (() => Element | null);
  title: string;
  body?: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  /** Space between the element and the spotlight's edge. */
  padding?: number;
};
type Frame = { x: number; y: number; w: number; h: number };

const GAP = 16;
const resolve = (target: TourStep["target"]) =>
  typeof target === "function"
    ? target()
    : typeof document === "undefined"
      ? null
      : document.querySelector(target);

/**
 * A guided tour: a spotlight that travels between elements and a card that
 * explains each one, with keyboard steps and a graceful fallback when an
 * element is missing.
 */
export function Tour({
  steps,
  open,
  onOpenChange,
  step,
  defaultStep = 0,
  onStepChange,
  onFinish,
  label = "Product tour",
  className = "",
  style,
}: {
  steps: readonly TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Called when the last step is completed, not when the tour is skipped. */
  onFinish?: () => void;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const [message, announce] = useAnnouncer();
  const [index, setIndex] = useControllable(step, defaultStep, onStepChange);
  const current = steps[clamp(index, 0, Math.max(0, steps.length - 1))];
  const [frame, setFrame] = useState<Frame | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [cardSize, setCardSize] = useState({ w: 320, h: 180 });
  const frameRef = useLatest(frame);
  const change = useLatest(onOpenChange);
  const glideUntil = useRef(0);

  // Native modality: top layer, inert page, focus containment and restoration.
  useEffect(() => {
    const el = dialog.current;
    if (!el || !open) return;
    // Captured before anything inside the tour takes focus.
    const restore = document.activeElement as HTMLElement | null;
    el.showModal();
    primary.current?.focus();
    return () => {
      el.close();
      if (restore?.isConnected) restore.focus();
    };
  }, [open]);

  // When the step changes, bring its element into view and glide the spotlight there.
  useEffect(() => {
    if (!open || !current) return;
    const target = resolve(current.target);
    target?.scrollIntoView?.({
      block: "center",
      inline: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
    glideUntil.current = performance.now() + 900;
    announce(`Step ${index + 1} of ${steps.length}: ${current.title}`);
    primary.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  // Follow the element every frame while open, so scrolling and layout shifts never detach it.
  useEffect(() => {
    if (!open || !current) return;
    let raf = 0;
    const measure = () => {
      raf = requestAnimationFrame(measure);
      const pad = current.padding ?? 8;
      const el = resolve(current.target);
      const vw = window.innerWidth,
        vh = window.innerHeight;
      setViewport((v) => (v.w === vw && v.h === vh ? v : { w: vw, h: vh }));
      if (card.current) {
        const r = card.current.getBoundingClientRect();
        setCardSize((c) =>
          Math.abs(c.w - r.width) < 1 && Math.abs(c.h - r.height) < 1
            ? c
            : { w: r.width, h: r.height },
        );
      }
      const r = el?.getBoundingClientRect();
      const next =
        r && r.width + r.height > 0
          ? {
              x: r.left - pad,
              y: r.top - pad,
              w: r.width + pad * 2,
              h: r.height + pad * 2,
            }
          : null;
      const now = frameRef.current;
      if (!next) {
        if (now) setFrame(null);
        return;
      }
      const distance = now
        ? Math.abs(now.x - next.x) +
          Math.abs(now.y - next.y) +
          Math.abs(now.w - next.w) +
          Math.abs(now.h - next.h)
        : Infinity;
      if (distance < 0.5) return;
      // After a step change the spotlight pursues the element, even while it scrolls into view.
      if (
        now &&
        !reduce &&
        performance.now() < glideUntil.current &&
        distance > 2
      ) {
        const k = 0.2;
        setFrame({
          x: now.x + (next.x - now.x) * k,
          y: now.y + (next.y - now.y) * k,
          w: now.w + (next.w - now.w) * k,
          h: now.h + (next.h - now.h) * k,
        });
        return;
      }
      setFrame(next);
    };
    raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, reduce]);

  const go = (to: number) => {
    if (to >= steps.length) {
      change.current(false);
      onFinish?.();
      return;
    }
    setIndex(clamp(to, 0, steps.length - 1));
  };

  // Card placement: the preferred side if it fits, otherwise the side with the most room.
  const sheet = viewport.w > 0 && viewport.w < 560;
  let place: CSSProperties = {};
  let side: "top" | "bottom" | "left" | "right" | "center" | "sheet" = "center";
  let pointer = 0;
  if (sheet) side = "sheet";
  else if (frame && viewport.w) {
    const room = {
      bottom: viewport.h - (frame.y + frame.h),
      top: frame.y,
      right: viewport.w - (frame.x + frame.w),
      left: frame.x,
    };
    const fits = (s: keyof typeof room) =>
      room[s] >=
      (s === "top" || s === "bottom" ? cardSize.h : cardSize.w) + GAP + 12;
    const order = [current?.placement, "bottom", "top", "right", "left"].filter(
      Boolean,
    ) as (keyof typeof room)[];
    side =
      order.find(fits) ??
      (Object.entries(room).sort(
        (a, b) => b[1] - a[1],
      )[0]![0] as keyof typeof room);
    const cx = frame.x + frame.w / 2,
      cy = frame.y + frame.h / 2;
    if (side === "bottom" || side === "top") {
      const left = clamp(cx - cardSize.w / 2, 12, viewport.w - cardSize.w - 12);
      place = {
        left,
        top:
          side === "bottom"
            ? frame.y + frame.h + GAP
            : frame.y - GAP - cardSize.h,
      };
      pointer = clamp(cx - left, 18, cardSize.w - 18);
    } else {
      const top = clamp(cy - cardSize.h / 2, 12, viewport.h - cardSize.h - 12);
      place = {
        top,
        left:
          side === "right"
            ? frame.x + frame.w + GAP
            : frame.x - GAP - cardSize.w,
      };
      pointer = clamp(cy - top, 18, cardSize.h - 18);
    }
  }

  const last = index >= steps.length - 1;
  return (
    <dialog
      ref={dialog}
      className={`mizu-tour ${className}`}
      style={style}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-body`}
      onCancel={(e) => {
        e.preventDefault();
        change.current(false);
      }}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest("input, textarea, select"))
          return;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
        }
      }}
    >
      {open && current && (
        <>
          <svg
            className="mizu-tour-veil"
            aria-hidden="true"
            width="100%"
            height="100%"
          >
            <defs>
              <mask id={`${id}-hole`}>
                <rect width="100%" height="100%" fill="white" />
                {frame && (
                  <rect
                    x={frame.x}
                    y={frame.y}
                    width={frame.w}
                    height={frame.h}
                    rx="2"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              mask={`url(#${id}-hole)`}
              className="mizu-tour-shade"
            />
            {frame && (
              <g className="mizu-tour-brackets">
                {[
                  [frame.x, frame.y, 1, 1],
                  [frame.x + frame.w, frame.y, -1, 1],
                  [frame.x, frame.y + frame.h, 1, -1],
                  [frame.x + frame.w, frame.y + frame.h, -1, -1],
                ].map(([x, y, dx, dy], i) => (
                  <path
                    key={i}
                    d={`M${x! + dx! * 14},${y}H${x}V${y! + dy! * 14}`}
                  />
                ))}
              </g>
            )}
          </svg>
          <p className="mizu-sr-only">{label}</p>
          <div
            ref={card}
            tabIndex={-1}
            className="mizu-tour-card"
            data-side={side}
            style={
              { ...place, "--mizu-pointer": `${pointer}px` } as CSSProperties
            }
          >
            <div className="mizu-tour-progress" aria-hidden="true">
              {steps.map((_, i) => (
                <i
                  key={i}
                  data-state={
                    i < index ? "done" : i === index ? "current" : undefined
                  }
                />
              ))}
              <span>
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(steps.length).padStart(2, "0")}
              </span>
            </div>
            <div key={index} className="mizu-tour-copy">
              <h2 id={`${id}-title`}>{current.title}</h2>
              <div id={`${id}-body`} className="mizu-tour-body">
                {current.body}
                {!frame && (
                  <p className="mizu-tour-missing">
                    The part of the page this step describes isn’t showing right
                    now.
                  </p>
                )}
              </div>
            </div>
            <div className="mizu-tour-actions">
              <button
                type="button"
                className="mizu-text-button"
                onClick={() => change.current(false)}
              >
                {last ? "Close" : "Skip tour"}
              </button>
              <span>
                {index > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    arrow={false}
                    onClick={() => go(index - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button ref={primary} size="sm" onClick={() => go(index + 1)}>
                  {last ? "Finish" : "Next"}
                </Button>
              </span>
            </div>
          </div>
          <span className="mizu-sr-only" role="status" aria-live="polite">
            {message}
          </span>
        </>
      )}
    </dialog>
  );
}
