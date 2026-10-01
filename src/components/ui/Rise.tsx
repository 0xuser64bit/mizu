import type { CSSProperties, ReactNode } from "react";

/**
 * Reveal for what is on screen at load: the same rise, started by CSS (see
 * .rise-in). Pass `fade={false}` for the largest text of the screen, which
 * should be visible from the first paint and only move.
 */
export function Rise({
  delay = 0,
  time = 0.8,
  fade = true,
  className = "",
  children,
}: {
  delay?: number;
  time?: number;
  fade?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${fade ? "rise-in" : "rise-up"} ${className}`}
      style={
        {
          "--rise-delay": `${delay}s`,
          "--rise-time": `${time}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/** MaskLine for what is on screen at load: the line rises from inside its mask, started by CSS. */
export function RiseMask({
  delay = 0,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) {
  return (
    <span className="mizu-maskline">
      <span
        className="rise-mask"
        style={{ "--rise-delay": `${delay}s` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}
