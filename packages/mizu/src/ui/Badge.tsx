import type { ReactNode } from "react";
import { Mark } from "./Mark.tsx";

export type BadgeTone = "paper" | "muted" | "accent" | "line";

export function Badge({
  children,
  tone = "muted",
  diamond = true,
  className = "",
  style,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  diamond?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`mizu-badge mizu-badge--${tone} ${className}`}
      style={style}
    >
      {diamond && (
        <Mark size={4} tone={tone === "accent" ? "accent" : "line"} />
      )}
      {children}
    </span>
  );
}
