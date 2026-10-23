import type { CSSProperties } from "react";
export function Spinner({
  size = 14,
  tone = "accent",
  label = "Loading",
  className = "",
  style,
}: {
  size?: number;
  tone?: "accent" | "paper" | "muted" | "current";
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`mizu-spinner ${className}`}
      style={style}
    >
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          background:
            tone === "current" ? "currentColor" : `var(--mizu-${tone})`,
        }}
      />
      <span className="mizu-sr-only">{label}</span>
    </span>
  );
}
