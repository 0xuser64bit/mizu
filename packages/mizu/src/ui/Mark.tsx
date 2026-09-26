import type { CSSProperties } from "react";

export type MarkTone = "accent" | "paper" | "muted" | "line";

const TONES: Record<MarkTone, string> = {
  accent: "var(--mizu-accent)",
  paper: "var(--mizu-paper)",
  muted: "var(--mizu-muted)",
  line: "var(--mizu-line-bright)",
};

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
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        background: TONES[tone],
        transform: "rotate(45deg)",
        ...style,
      }}
    />
  );
}
