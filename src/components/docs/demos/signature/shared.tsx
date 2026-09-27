"use client";

import type { ReactNode } from "react";
import { SegmentedControl } from "@/mizu";

/** Scenario switch shared by the signature showcases. */
export function Scenarios<T extends string>({
  label,
  value,
  options,
  onChange,
  note,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  note?: ReactNode;
}) {
  return (
    <div className="mizu-showcase-scenarios">
      <SegmentedControl
        label={label}
        value={value}
        options={options}
        onValueChange={(v) => onChange(v as T)}
      />
      {note && <p>{note}</p>}
    </div>
  );
}

/** Deterministic pseudo-random numbers so demos render identically on server and client. */
export function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
