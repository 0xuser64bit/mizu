import type { CSSProperties } from "react";

export function GhostWord({
  text,
  fill = "accent",
  size = "clamp(4rem, 12vw, 9rem)",
  className = "",
  style,
}: {
  text: string;
  fill?: "accent" | "paper";
  /** Any CSS font size; `inherit` takes the surrounding text's. */
  size?: string | number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`mizu-ghost mizu-ghost--${fill} ${className}`}
      style={{ fontSize: size, ...style }}
    >
      {text}
    </span>
  );
}
