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
      className={className}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: 0,
        fontFamily: "var(--mizu-font-mono)",
        fontSize: 11,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: `var(--mizu-${tone})`,
      }}
    >
      {diamond && <Mark size={5} tone={tone === "accent" ? "accent" : "line"} />}
      {children}
    </p>
  );
}
