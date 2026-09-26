export function GhostWord({
  text,
  fill = "accent",
  className = "",
}: {
  text: string;
  fill?: "accent" | "paper";
  className?: string;
}) {
  return (
    <span aria-hidden className={`mizu-ghost mizu-ghost--${fill} ${className}`}>
      {text}
    </span>
  );
}
