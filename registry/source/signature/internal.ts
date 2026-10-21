"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type SetStateAction,
} from "react";

/** A visible interval on a numeric or time axis: [start, end]. */
export type Interval = readonly [number, number];
export type SignatureTone =
  "neutral" | "accent" | "paper" | "muted" | "success" | "warning" | "danger";

export const clamp = (n: number, low: number, high: number) =>
  Math.min(high, Math.max(low, n));

export const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useIsoLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

export function useControllable<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
) {
  const [inner, setInner] = useState(initial);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const latestRef = useRef(current);
  const ownerRef = useRef(controlled);
  const changeRef = useLatest(onChange);
  useIsoLayoutEffect(() => {
    latestRef.current = current;
    ownerRef.current = controlled;
  });
  const set = useCallback(
    (next: SetStateAction<T>) => {
      const resolved =
        typeof next === "function"
          ? (next as (previous: T) => T)(latestRef.current)
          : next;
      if (Object.is(resolved, latestRef.current)) return;
      latestRef.current = resolved;
      if (!ownerRef.current) setInner(resolved);
      changeRef.current?.(resolved);
    },
    [changeRef],
  );
  return [current, set] as const;
}

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
