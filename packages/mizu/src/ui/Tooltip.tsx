import type { CSSProperties, ReactNode } from "react";

export function Tooltip({
  label,
  children,
  side = "top",
  className = "",
  style,
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`mizu-tooltip mizu-tooltip--${side} ${className}`} style={style}>
      {children}
      <span role="tooltip" className="mizu-tooltip-bubble">
        {label}
      </span>
    </span>
  );
}
