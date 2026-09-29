"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../motion/Preferences.tsx";
import { useLatest, type SignatureTone } from "./internal.ts";
import { FLAP_CHARACTERS, flapPath } from "./flap.ts";

export { FLAP_CHARACTERS, flapPath } from "./flap.ts";

/** Pads or trims `text` to exactly `length` cells, in capitals when the drum has no others. */
function fit(
  text: string,
  length: number,
  align: "left" | "right",
  characters: string,
) {
  const caseless = characters === characters.toUpperCase();
  const chars = [...(caseless ? text.toUpperCase() : text)].slice(0, length);
  const room = Array<string>(length - chars.length).fill(" ");
  return align === "right" ? [...room, ...chars] : [...chars, ...room];
}

const FALL = [
  { transform: "rotateX(0deg)", filter: "brightness(1)" },
  { transform: "rotateX(-90deg)", filter: "brightness(0.55)" },
];
const LAND = [
  { transform: "rotateX(90deg)", filter: "brightness(0.55)" },
  { transform: "rotateX(0deg)", filter: "brightness(1)" },
];

/**
 * A split-flap display. Each character falls through the drum to its new
 * value, cell after cell, and settles with a slap; the text itself is
 * always available to assistive technology.
 */
export function SplitFlap({
  value,
  length,
  align = "left",
  characters = FLAP_CHARACTERS,
  flip = 70,
  stagger = 35,
  label,
  live = false,
  tone,
  onSettle,
  className = "",
  style,
}: {
  value: string;
  /** Cells to show; the value is padded or trimmed to fit. Defaults to its length. */
  length?: number;
  align?: "left" | "right";
  /** The drum, in the order the flaps fall. Other characters arrive in one flip. */
  characters?: string;
  /** Milliseconds for one flap to fall. */
  flip?: number;
  /** Milliseconds between neighbouring cells starting. */
  stagger?: number;
  /** Read before the value, e.g. "Platform". */
  label?: string;
  /** Announce new values politely. */
  live?: boolean;
  tone?: SignatureTone;
  /** Called when every cell has arrived. */
  onSettle?: (value: string) => void;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const cells = length ?? [...value].length;
  // The text React renders never changes after mount; flips write to the DOM directly.
  const [initial] = useState(() => fit(value, cells, align, characters));
  const cellsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const shownRef = useRef<string[]>(initial);
  const settleRef = useLatest(onSettle);

  useEffect(() => {
    const target = fit(value, cells, align, characters);
    // Updated in place as flaps land, so the cleanup sees the latest.
    const shown = shownRef.current;
    const glyphs = (i: number) =>
      cellsRef.current[i]?.querySelectorAll<HTMLElement>(".mizu-flap-glyph");
    const show = (i: number, ch: string) => {
      shown[i] = ch;
      glyphs(i)?.forEach((g) => (g.textContent = ch));
    };
    const animating =
      !reduce &&
      typeof Element !== "undefined" &&
      "animate" in Element.prototype;
    if (!animating) {
      target.forEach((ch, i) => show(i, ch));
      settleRef.current?.(value);
      return;
    }
    let stopped = false;
    const running = new Set<Animation>();
    const run = async (i: number) => {
      await new Promise((r) => setTimeout(r, i * stagger));
      for (const next of flapPath(shown[i] ?? " ", target[i]!, characters)) {
        const nodes = glyphs(i);
        if (stopped || !nodes) return;
        const [top, bottom, fall, land] = [...nodes];
        const from = shown[i] ?? " ";
        top!.textContent = next;
        bottom!.textContent = from;
        fall!.textContent = from;
        land!.textContent = next;
        const falling = fall!.parentElement!.animate(FALL, {
          duration: flip / 2,
          easing: "cubic-bezier(0.55, 0, 1, 0.45)",
          fill: "forwards",
        });
        const landing = land!.parentElement!.animate(LAND, {
          duration: flip / 2,
          delay: flip / 2,
          easing: "cubic-bezier(0.2, 1.6, 0.5, 1)",
          fill: "both",
        });
        running.add(falling).add(landing);
        try {
          await landing.finished;
        } catch {
          return;
        } finally {
          running.delete(falling);
          running.delete(landing);
          falling.cancel();
          landing.cancel();
        }
        show(i, next);
      }
    };
    void Promise.all(target.map((_, i) => run(i))).then(() => {
      if (!stopped) settleRef.current?.(value);
    });
    return () => {
      stopped = true;
      running.forEach((a) => a.cancel());
      // Leave every cell showing a whole character for the next value to start from.
      shown.forEach((ch, i) => show(i, ch));
    };
  }, [value, cells, align, characters, flip, stagger, reduce, settleRef]);

  const text = [...value].slice(0, cells).join("").trim();
  return (
    <span className={`mizu-flap ${className}`} style={style} data-tone={tone}>
      <span
        className="mizu-sr-only"
        role={live ? "status" : undefined}
        aria-live={live ? "polite" : undefined}
      >
        {label ? `${label}: ${text}` : text}
      </span>
      <span className="mizu-flap-cells" aria-hidden="true">
        {Array.from({ length: cells }, (_, i) => {
          const ch = initial[i] ?? " ";
          return (
            <span
              key={i}
              ref={(el) => {
                cellsRef.current[i] = el;
              }}
              className="mizu-flap-cell"
            >
              <span className="mizu-flap-half" data-half="top">
                <span className="mizu-flap-glyph">{ch}</span>
              </span>
              <span className="mizu-flap-half" data-half="bottom">
                <span className="mizu-flap-glyph">{ch}</span>
              </span>
              <span className="mizu-flap-half mizu-flap-leaf" data-half="top">
                <span className="mizu-flap-glyph">{ch}</span>
              </span>
              <span
                className="mizu-flap-half mizu-flap-leaf"
                data-half="bottom"
              >
                <span className="mizu-flap-glyph">{ch}</span>
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
