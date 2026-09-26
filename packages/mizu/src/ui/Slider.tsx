export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  format,
  className = "",
  style,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  format?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <label
      className={className}
      style={{
        ...style,
        display: "grid",
        gridTemplateColumns: "104px 1fr 52px",
        alignItems: "center",
        gap: 16,
        fontFamily: "var(--mizu-font-mono)",
        fontSize: 10,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: disabled ? "var(--mizu-faint)" : "var(--mizu-faint)",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{ width: "100%", margin: 0 }}
        className="mizu-slider-input"
      />
      <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--mizu-muted)" }}>
        {format ? format(value) : value}
      </span>
    </label>
  );
}
