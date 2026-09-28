"use client";

import {
  cloneElement,
  useId,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";

export function Tooltip({
  label,
  children,
  side = "top",
  className = "",
  style,
}: {
  label: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  return (
    <span
      className={`mizu-tooltip mizu-tooltip--${side} ${className}`}
      style={style}
      data-dismissed={dismissed || undefined}
      onMouseEnter={() => setDismissed(false)}
      onFocus={() => setDismissed(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setDismissed(true);
      }}
    >
      {cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], id]
          .filter(Boolean)
          .join(" "),
      })}
      <span id={id} role="tooltip" className="mizu-tooltip-bubble">
        {label}
      </span>
    </span>
  );
}
