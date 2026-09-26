import type { ReactNode } from "react";

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 9,
    height: 9,
    borderColor: "var(--mizu-accent)",
  };
  const posStyle: Record<string, React.CSSProperties> = {
    tl: { top: -1, left: -1, borderTop: "1px solid", borderLeft: "1px solid" },
    tr: { top: -1, right: -1, borderTop: "1px solid", borderRight: "1px solid" },
    bl: { bottom: -1, left: -1, borderBottom: "1px solid", borderLeft: "1px solid" },
    br: { bottom: -1, right: -1, borderBottom: "1px solid", borderRight: "1px solid" },
  };
  return <span aria-hidden style={{ ...base, ...posStyle[pos] }} />;
}

export function Frame({
  label,
  children,
  className = "",
  tone = "line",
}: {
  label?: string;
  children: ReactNode;
  className?: string;
  tone?: "line" | "line-bright";
}) {
  return (
    <figure
      className={className}
      style={{
        position: "relative",
        margin: 0,
        border: `1px solid ${tone === "line-bright" ? "var(--mizu-line-bright)" : "var(--mizu-line)"}`,
      }}
    >
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
      {children}
      {label && (
        <figcaption
          aria-hidden
          style={{
            position: "absolute",
            top: -7,
            left: 14,
            padding: "0 6px",
            background: "var(--mizu-ink)",
            fontFamily: "var(--mizu-font-mono)",
            fontSize: 9,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--mizu-faint)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </figcaption>
      )}
    </figure>
  );
}
