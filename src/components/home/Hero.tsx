"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { HeroField } from "./HeroField";
import { MaskLine, Reveal, Magnetic, ButtonLink } from "@/mizu";
import { useNavigator } from "@/components/shell/Navigator";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { navigate } = useNavigator();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} data-chapter="Mizu" className="relative h-[100svh] overflow-hidden">
      <HeroField progress={scrollYProgress} />

      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className="relative z-10 flex h-full flex-col justify-between px-5 pb-8 pt-24 md:px-10 md:pt-28"
      >
        <div className="flex items-start justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          <MaskLine delay={0.1}>
            <span>An archive of interface craft</span>
          </MaskLine>
          <MaskLine delay={0.2}>
            <span className="hidden sm:inline">Vol. 01 — MMXXVI</span>
          </MaskLine>
        </div>

        <div>
          <h1 className="font-display font-black font-wide leading-[0.82] tracking-[-0.03em]">
            {"MIZU".split("").map((ch, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <MaskLine delay={0.25 + i * 0.09}>
                  <span className="inline-block text-[clamp(4.2rem,16vw,13.5rem)]">{ch}</span>
                </MaskLine>
              </span>
            ))}
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <MaskLine delay={0.68}>
                <span className="inline-block text-[clamp(4.2rem,16vw,13.5rem)] text-accent">.</span>
              </MaskLine>
            </span>
          </h1>

          <div className="mt-10 flex flex-col gap-10 md:mt-14 md:flex-row md:items-end md:justify-between">
            <Reveal delay={0.95} className="max-w-md">
              <p className="text-base leading-relaxed text-muted md:text-lg">
                Surfaces, motion and systems —{" "}
                <span className="font-serif italic text-paper">made slowly</span>, finished properly, released
                when ready.
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Magnetic>
                  <ButtonLink
                    href="/lab"
                    label="The lab"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/lab", "The lab");
                    }}
                  >
                    Enter the lab
                  </ButtonLink>
                </Magnetic>
                <Magnetic>
                  <ButtonLink
                    href="/studio"
                    label="The standpoint"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/studio", "The standpoint");
                    }}
                  >
                    The standpoint
                  </ButtonLink>
                </Magnetic>
              </div>
            </Reveal>
            <Reveal delay={1.1} className="hidden md:block">
              <p className="text-right font-mono text-[10px] uppercase leading-loose tracking-[0.25em] text-faint">
                Surfaces — Motion
                <br />
                Type — Systems
                <br />
                Scroll to begin ↓
              </p>
            </Reveal>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
