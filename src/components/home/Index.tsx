"use client";

import { useState, type ComponentType } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "../../../packages/mizu/src/motion/Preferences";
import { SectionTag, Reveal, EASE_EXPO } from "@/mizu";
import { NavigatorLink } from "@/components/shell/Navigator";
import { Bloom, SignalDrift, SoftType, TransitionStudy } from "./previews";

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
              className="group relative border-t border-line"
            >
              <div
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-accent-fill transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
              />
              <div className="relative z-10 grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-1 py-7 md:grid-cols-12 md:gap-4 md:py-9">
                <span className="font-mono text-[11px] tracking-[0.2em] text-faint transition-colors duration-300 group-hover:text-on-fill md:col-span-2">
                  {piece.id}
                </span>
                <h3 className="font-display text-2xl font-bold font-wide tracking-tight transition-colors duration-300 group-hover:text-on-fill md:col-span-6 md:text-4xl">
                  <button
                    type="button"
                    aria-expanded={open === i}
                    aria-controls={`piece-${i}`}
                    onClick={() => setOpen(open === i ? null : i)}
                    className="cursor-pointer text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
                  >
                    {piece.title}
                  </button>
                </h3>
                <div className="col-start-2 md:col-span-3 md:col-start-auto">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint transition-colors duration-300 group-hover:text-on-fill">
                    {piece.cat}
                  </p>
                  <p className="mt-1.5 font-mono text-[10px] tracking-[0.2em] text-faint transition-colors duration-300 group-hover:text-on-fill">
                    {piece.year}
                  </p>
                </div>
                <span className="col-start-3 row-span-2 row-start-1 flex justify-end md:col-span-1 md:col-start-auto md:row-span-1 md:row-start-auto">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`text-faint transition-all duration-300 group-hover:text-on-fill ${open === i ? "rotate-90" : "group-hover:rotate-45"}`}
                    aria-hidden
                  >
                    <path d="M1.5 10.5L10.5 1.5M10.5 1.5H4M10.5 1.5V8" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </span>
              </div>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    id={`piece-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.5, ease: EASE_EXPO }}
                    className="relative z-10 overflow-hidden"
                  >
                    <div className="mb-7 ml-[5.5rem] h-44 w-72 max-w-[calc(100%-5.5rem)] border border-line-bright bg-ink md:ml-[16.67%] md:h-52">
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
          Open a piece to see it running. More live work is in{" "}
          <NavigatorLink
            href="/lab"
            label="The lab"
            className="text-paper underline underline-offset-4"
          >
            the lab
          </NavigatorLink>
          .
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
