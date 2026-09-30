import type { CSSProperties } from "react";

export type MarkTone = "accent" | "paper" | "muted" | "line";

export function Mark({
  size = 6,
  tone = "accent",
  className = "",
  style,
}: {
  size?: number;
  tone?: MarkTone;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`mizu-mark mizu-mark--${tone} ${className}`}
      style={{ width: size, height: size, ...style }}
    />
  );
}
