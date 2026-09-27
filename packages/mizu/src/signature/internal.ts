"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type SetStateAction,
} from "react";

export const clamp = (n: number, low: number, high: number) =>
  Math.min(high, Math.max(low, n));

export const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The latest render's value, readable from events and effects without re-subscribing. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useIsoLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** Controlled when `value` is defined, otherwise owns the state; `onChange` fires either way. */
export function useControllable<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
) {
  const [inner, setInner] = useState(initial);
  const current = value === undefined ? inner : value;
  const latest = useRef(current);
  const change = useLatest(onChange);
  useIsoLayoutEffect(() => {
    latest.current = current;
  });
  const set = useCallback(
    (next: SetStateAction<T>) => {
      const resolved =
        typeof next === "function"
          ? (next as (previous: T) => T)(latest.current)
          : next;
      if (Object.is(resolved, latest.current)) return;
      latest.current = resolved;
      setInner(resolved);
      change.current?.(resolved);
    },
    [change],
  );
  return [current, set] as const;
}

/** Border-box size from a ResizeObserver; 0 × 0 until the element is measured. */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useIsoLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect();
      setSize((s) =>
        s.width === width && s.height === height ? s : { width, height },
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

/** Polite announcements for operations that have no other visible text change. */
export function useAnnouncer() {
  const [message, setMessage] = useState("");
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const announce = useCallback((text: string) => {
    setMessage("");
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setMessage(text));
  }, []);
  return [message, announce] as const;
}

/** Runs `step(t)` for eased t in 0..1 over `duration`; a new run or `cancel` stops the last one. */
export function useTween() {
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const cancel = useCallback(() => cancelAnimationFrame(frame.current), []);
  const run = useCallback(
    (duration: number, step: (t: number) => void, done?: () => void) => {
      cancelAnimationFrame(frame.current);
      if (duration <= 0) {
        step(1);
        done?.();
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = clamp((now - start) / duration, 0, 1);
        step(1 - Math.pow(1 - t, 4));
        if (t < 1) frame.current = requestAnimationFrame(tick);
        else done?.();
      };
      frame.current = requestAnimationFrame(tick);
    },
    [],
  );
  return [run, cancel] as const;
}

export const toTime = (value: number | Date) =>
  typeof value === "number" ? value : value.getTime();
