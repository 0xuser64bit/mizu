import { Mark } from "./Mark.tsx";

export function Rule({
  label,
  node = true,
  tone = "line",
  className = "",
  style,
}: {
  label?: string;
  node?: boolean;
  tone?: "line" | "line-bright" | "accent";
  className?: string;
  style?: React.CSSProperties;
}) {
  const line = (
    <span
      aria-hidden
      style={{
        flex: 1,
        height: 1,
        background:
          tone === "accent"
            ? "var(--mizu-accent)"
            : tone === "line-bright"
              ? "var(--mizu-line-bright)"
              : "var(--mizu-line)",
      }}
    />
  );

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="horizontal"
      className={className}
      style={{ ...style, display: "flex", alignItems: "center", gap: 12, width: "100%" }}
    >
      {line}
      {node && <Mark size={5} tone={tone === "accent" ? "accent" : "line"} />}
      {label && (
        <span
          style={{
            fontFamily: "var(--mizu-font-mono)",
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--mizu-faint)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      )}
      {label && line}
    </div>
  );
}
