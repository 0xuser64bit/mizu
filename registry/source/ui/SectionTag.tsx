import type { ReactNode } from "react";
import { Mark } from "./Mark";

export type SectionTagTone = "muted" | "faint" | "paper" | "accent";

export function SectionTag({
  children,
  tone = "muted",
  diamond = true,
  className = "",
  style,
}: {
  children: ReactNode;
  tone?: SectionTagTone;
  diamond?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <p
      className={`mizu-section-tag mizu-section-tag--${tone} ${className}`}
      style={style}
    >
      {diamond && (
        <Mark size={5} tone={tone === "accent" ? "accent" : "line"} />
      )}
      {children}
    </p>
  );
}
