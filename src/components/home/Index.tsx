"use client";

import { useState, type ComponentType } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { Bloom, SignalDrift, SoftType, TransitionStudy } from "./previews";
import { EASE_EXPO } from "@/lib/motion";

type Piece = {
  id: string;
  title: string;
  cat: string;
  year: string;
  Preview: ComponentType;
};

const PIECES: Piece[] = [
  { id: "MZX—01", title: "Signal Drift", cat: "Ambient motion study", year: "2026", Preview: SignalDrift },
  { id: "MZX—02", title: "Soft Type", cat: "Kinetic typography engine", year: "2026", Preview: SoftType },
  { id: "MZX—03", title: "Transition Study №4", cat: "Page choreography", year: "2025", Preview: TransitionStudy },
  { id: "MZX—04", title: "Bloom", cat: "Generative surface", year: "2025", Preview: Bloom },
];

export function Index() {
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 120, damping: 20, mass: 0.5 });
  const py = useSpring(my, { stiffness: 120, damping: 20, mass: 0.5 });

  return (
    <section id="index" data-chapter="Index" className="relative px-5 py-28 md:px-10 md:py-40">
      <div className="mb-16 flex items-end justify-between gap-6 md:mb-24">
        <div>
          <SectionTag>02 — Selected pieces</SectionTag>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl font-black font-wide tracking-tight md:text-6xl">
              Work in the open
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-faint md:block">
          (04) — 2025/26
        </Reveal>
      </div>

      <div
        className="border-b border-line"
        onMouseMove={(e) => {
          mx.set(Math.min(e.clientX, window.innerWidth - 320));
          my.set(e.clientY);
        }}
        onMouseLeave={() => setActive(null)}
      >
        {PIECES.map((piece, i) => (
          <Reveal key={piece.id} delay={i * 0.06} x={56}>
            <article
              data-cursor="View"
              onMouseEnter={() => setActive(i)}
              onClick={() => setOpen(open === i ? null : i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(open === i ? null : i);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={open === i}
              aria-label={`${piece.title} — toggle preview`}
              className="group relative cursor-pointer border-t border-line"
            >
              <div
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-accent-fill transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
              />
              <div className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-3 px-1 py-7 md:grid md:grid-cols-12 md:gap-4 md:py-9">
                <span className="font-mono text-[11px] tracking-[0.2em] text-faint transition-colors duration-300 group-hover:text-ink/70 md:col-span-2">
                  {piece.id}
                </span>
                <h3 className="flex-1 font-display text-2xl font-bold font-wide tracking-tight transition-colors duration-300 group-hover:text-ink md:col-span-6 md:flex-none md:text-4xl">
                  {piece.title}
                </h3>
                <div className="ml-auto md:col-span-3 md:ml-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint transition-colors duration-300 group-hover:text-paper/85">
                    {piece.cat}
                  </p>
                  <p className="mt-1.5 font-mono text-[10px] tracking-[0.2em] text-faint/60 transition-colors duration-300 group-hover:text-paper/60">
                    {piece.year}
                  </p>
                </div>
                <span className="flex justify-end md:col-span-1">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-faint transition-all duration-300 group-hover:rotate-45 group-hover:text-ink"
                    aria-hidden
                  >
                    <path d="M1.5 10.5L10.5 1.5M10.5 1.5H4M10.5 1.5V8" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </span>
              </div>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE_EXPO }}
                    className="relative z-10 overflow-hidden"
                  >
                    <div className="mb-7 ml-10 h-44 w-72 max-w-full border border-line-bright bg-ink md:ml-[16.67%] md:h-52">
                      <piece.Preview />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <p className="mt-10 font-mono text-[10px] uppercase leading-loose tracking-[0.25em] text-faint">
          Hover to preview — click to expand. More pieces are in the workshop.
        </p>
      </Reveal>

      <AnimatePresence>
        {active !== null && !reduce && (
          <motion.div
            key={active}
            className="pointer-events-none fixed left-0 top-0 z-[60] hidden md:block"
            style={{ x: px, y: py }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: EASE_EXPO }}
          >
            <div className="ml-7 mt-7 h-36 w-60 overflow-hidden border border-line-bright bg-ink-2">
              {(() => {
                const P = PIECES[active].Preview;
                return <P />;
              })()}
            </div>
            <p className="ml-7 mt-2.5 font-mono text-[9px] uppercase tracking-[0.25em] text-faint">
              {PIECES[active].id} — Live preview
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
