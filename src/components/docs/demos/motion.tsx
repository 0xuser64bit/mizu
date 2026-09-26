"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Magnetic, MaskLine, Marquee, Reveal, Slider, usePageWipe } from "@/mizu";
import { DemoLabel } from "./shared";

export function MaskLineDemo() {
  const [play, setPlay] = useState(0);
  return (
    <div>
      <button
        onClick={() => setPlay((p) => p + 1)}
        className="mb-8 font-mono text-[10px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-paper"
      >
        ↻ Replay
      </button>
      <h3
        key={play}
        className="font-display text-4xl font-black font-wide leading-[0.95] tracking-tight md:text-5xl"
      >
        <MaskLine>
          Movement
          <br />
          travels<span className="text-accent">.</span>
        </MaskLine>
      </h3>
    </div>
  );
}

export function RevealDemo() {
  const [delay, setDelay] = useState(200);
  return (
    <div>
      <div className="mb-8 flex items-center gap-6">
        <DemoLabel>Delay — {delay}ms</DemoLabel>
        <div className="w-48">
          <Slider label="" value={delay} min={0} max={800} step={50} onChange={setDelay} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {["Surfaces", "Motion", "Systems"].map((t, i) => (
          <Reveal key={t} delay={delay / 1000 + i * 0.12} y={24}>
            <div className="border border-line bg-ink-2 p-6">
              <p className="font-mono text-[10px] tracking-[0.25em] text-faint">0{i + 1}</p>
              <p className="mt-3 font-display text-xl font-bold tracking-tight">{t}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function MagneticDemo() {
  return (
    <div className="flex flex-col items-start gap-8">
      <div className="flex flex-wrap gap-6">
        <Magnetic>
          <span className="border border-line-bright px-8 py-6 font-mono text-[11px] uppercase tracking-[0.22em] text-paper">
            Pull
          </span>
        </Magnetic>
        <Magnetic strength={0.55}>
          <span className="border border-line-bright px-8 py-6 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Stronger
          </span>
        </Magnetic>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        Move your cursor close — the surface answers
      </p>
    </div>
  );
}

export function MarqueeDemo() {
  const [duration, setDuration] = useState(12);
  return (
    <div>
      <div className="mb-8 flex items-center gap-6">
        <DemoLabel>Cycle — {duration}s</DemoLabel>
        <div className="w-48">
          <Slider label="" value={duration} min={4} max={40} onChange={setDuration} />
        </div>
      </div>
      <Marquee duration={duration} label="Mizu disciplines">
        {["Surfaces", "Motion", "Typography", "Systems", "Themes", "Patterns"].map((item) => (
          <span
            key={item}
            className="px-7 font-mono text-[11px] uppercase tracking-[0.35em] text-muted"
          >
            {item}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

export function PageWipeDemo() {
  const { wipe } = usePageWipe();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const go = async (href: string, label: string) => {
    setBusy(true);
    await wipe(label);
    router.push(href);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        onClick={() => go("/lab", "The lab")}
        disabled={busy}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent disabled:opacity-40"
      >
        Wipe to the lab →
      </button>
      <button
        onClick={() => go("/studio", "The standpoint")}
        disabled={busy}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-paper disabled:opacity-40"
      >
        Wipe to the standpoint →
      </button>
      <p className="w-full font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        Full-screen sweep — navigate at the midpoint
      </p>
    </div>
  );
}
