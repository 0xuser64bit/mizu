import type { CSSProperties, ReactNode } from "react";

export function Rise({
  delay = 0,
  time = 0.8,
  fade = true,
  className = "",
  children,
}: {
  delay?: number;
  time?: number;
  fade?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${fade ? "rise-in" : "rise-up"} ${className}`}
      style={
        {
          "--rise-delay": `${delay}s`,
          "--rise-time": `${time}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

export function RiseMask({
  delay = 0,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) {
  return (
    <span className="mizu-maskline">
      <span
        className="rise-mask"
        style={{ "--rise-delay": `${delay}s` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}
