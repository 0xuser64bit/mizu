export function GhostWord({
  text,
  fill = "accent",
  className = "",
  style,
}: {
  text: string;
  fill?: "accent" | "paper";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span aria-hidden className={`mizu-ghost mizu-ghost--${fill} ${className}`} style={style}>
      {text}
    </span>
  );
}
