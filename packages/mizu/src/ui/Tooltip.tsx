import type { ReactNode } from "react";

export function Tooltip({
  label,
  children,
  side = "top",
  className = "",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  return (
    <span className={`mizu-tooltip mizu-tooltip--${side} ${className}`}>
      {children}
      <span role="tooltip" className="mizu-tooltip-bubble">
        {label}
      </span>
    </span>
  );
}
