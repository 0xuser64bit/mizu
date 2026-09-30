import type { ReactNode } from "react";

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return (
    <span
      aria-hidden
      className={`mizu-frame-corner mizu-frame-corner--${pos}`}
    />
  );
}

export function Frame({
  label,
  children,
  className = "",
  style,
  tone = "line",
}: {
  label?: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tone?: "line" | "line-bright";
}) {
  return (
    <figure
      className={`mizu-frame mizu-frame--${tone} ${className}`}
      style={style}
    >
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
      {children}
      {label && <figcaption className="mizu-frame-label">{label}</figcaption>}
    </figure>
  );
}
