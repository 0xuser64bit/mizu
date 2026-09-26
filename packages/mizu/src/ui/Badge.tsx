import type { ReactNode } from "react";
import { Mark } from "./Mark";

export type BadgeTone = "paper" | "muted" | "accent" | "line";

const TONES: Record<BadgeTone, { color: string; border: string }> = {
  paper: { color: "var(--mizu-paper)", border: "var(--mizu-line-bright)" },
  muted: { color: "var(--mizu-muted)", border: "var(--mizu-line)" },
  accent: { color: "var(--mizu-accent)", border: "var(--mizu-accent)" },
  line: { color: "var(--mizu-faint)", border: "var(--mizu-line)" },
};

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
  const t = TONES[tone];
  return (
    <span
      className={className}
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 10px",
        border: `1px solid ${t.border}`,
        fontFamily: "var(--mizu-font-mono)",
        fontSize: 10,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: t.color,
        whiteSpace: "nowrap",
      }}
    >
      {diamond && <Mark size={4} tone={tone === "accent" ? "accent" : "line"} />}
      {children}
    </span>
  );
}
