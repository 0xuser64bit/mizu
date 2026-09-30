import type { CSSProperties } from "react";
// Blocks, as Tailwind's preflight makes every svg: inline, an icon sits on the text
// baseline and its line box adds height, so it drifts off center without Tailwind.
export function ArrowIcon({
  direction = "right",
  className = "",
  style,
}: {
  direction?: "up" | "down" | "left" | "right" | "diagonal";
  className?: string;
  style?: CSSProperties;
}) {
  const angle = { up: -90, down: 90, left: 180, right: 0, diagonal: -45 }[
    direction
  ];
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={className}
      style={{
        display: "block",
        flexShrink: 0,
        transform: `rotate(${angle}deg)`,
        ...style,
      }}
    >
      <path d="M2 8h11M8 3l5 5-5 5" />
    </svg>
  );
}
export function GripIcon() {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      aria-hidden="true"
      fill="currentColor"
      style={{ display: "block" }}
    >
      {[4, 10, 16].flatMap((y) =>
        [5, 11].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" />),
      )}
    </svg>
  );
}
export function CompareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      style={{ display: "block" }}
    >
      <path d="M2 8h12M5 4L1 8l4 4M11 4l4 4-4 4" />
    </svg>
  );
}
