import type { ReactNode } from "react";
import { Mark } from "./Mark.tsx";

export type SectionTagTone = "muted" | "faint" | "paper" | "accent";

export function SectionTag({
  children,
  tone = "muted",
  diamond = true,
  as: Tag = "p",
  className = "",
  style,
}: {
  children: ReactNode;
  tone?: SectionTagTone;
  diamond?: boolean;
  as?: "p" | "h2" | "h3" | "h4";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Tag
      className={`mizu-section-tag mizu-section-tag--${tone} ${className}`}
      style={style}
    >
      {diamond && (
        <Mark size={5} tone={tone === "accent" ? "accent" : "line"} />
      )}
      {children}
    </Tag>
  );
}
