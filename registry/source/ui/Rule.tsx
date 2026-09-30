import { Mark } from "./Mark";

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
  const line = <span aria-hidden className="mizu-rule-line" />;

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="horizontal"
      className={`mizu-rule mizu-rule--${tone} ${className}`}
      style={style}
    >
      {line}
      {node && <Mark size={5} tone={tone === "accent" ? "accent" : "line"} />}
      {label && <span className="mizu-rule-label">{label}</span>}
      {label && line}
    </div>
  );
}
