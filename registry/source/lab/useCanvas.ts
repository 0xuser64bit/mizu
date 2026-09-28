"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "../motion/Preferences";

export type CanvasColors = { paper: string; accent: string; line: string };

/** One observer and one cancellable loop. Sleeping canvases schedule no frames. */
export function useCanvasLoop(
  draw: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    colors: CanvasColors,
  ) => void,
): RefObject<HTMLCanvasElement | null> {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  const redraw = useRef<() => void>(() => {});
  const reduce = useReducedMotion();
  useEffect(() => {
    drawRef.current = draw;
    if (reduce) redraw.current();
  });
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0,
      w = 0,
      h = 0,
      pixelRatio = 0,
      visible = true;
    let colors: CanvasColors = {
      paper: "#f4f0e8",
      accent: "#ff4d1c",
      line: "#29241d",
    };
    const start = performance.now();
    const paint = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      drawRef.current(ctx, w, h, reduce ? 1400 : now - start, colors);
    };
    const frame = (now: number) => {
      paint(now);
      raf = requestAnimationFrame(frame);
    };
    const resume = () => {
      cancelAnimationFrame(raf);
      if (!visible || document.hidden) return;
      if (reduce) paint(start + 1400);
      else raf = requestAnimationFrame(frame);
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (w !== r.width || h !== r.height || pixelRatio !== dpr) {
        w = r.width;
        h = r.height;
        pixelRatio = dpr;
        canvas.width = Math.max(1, Math.round(w * dpr));
        canvas.height = Math.max(1, Math.round(h * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const css = getComputedStyle(canvas);
      colors = {
        paper: css.getPropertyValue("--mizu-paper").trim() || colors.paper,
        accent: css.getPropertyValue("--mizu-accent").trim() || colors.accent,
        line: css.getPropertyValue("--mizu-line-bright").trim() || colors.line,
      };
      paint(performance.now());
    };
    const ro = new ResizeObserver(resize);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      resume();
    });
    const tokens = (style: string | null) =>
      (style?.match(/--mizu-[^;]+/g) ?? []).join(";");
    const mo = new MutationObserver((records) => {
      if (
        records.some(
          (r) =>
            r.attributeName !== "style" ||
            tokens(r.oldValue) !==
              tokens((r.target as HTMLElement).getAttribute("style")),
        )
      )
        resize();
    });
    ro.observe(canvas);
    io.observe(canvas);
    for (
      let parent: HTMLElement | null = canvas;
      parent;
      parent = parent.parentElement
    )
      mo.observe(parent, {
        attributes: true,
        attributeFilter: ["data-theme", "class", "style"],
        attributeOldValue: true,
      });
    document.addEventListener("visibilitychange", resume);
    redraw.current = () => paint(performance.now());
    resize();
    resume();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", resume);
      redraw.current = () => {};
    };
  }, [reduce]);
  return ref;
}
