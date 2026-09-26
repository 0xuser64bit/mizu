"use client";

import { RippleSurface, SectionTag, Reveal, Magnetic, ButtonLink } from "@/mizu";
import { useNavigator } from "@/components/shell/Navigator";

export function Invite() {
  const { navigate } = useNavigator();

  return (
    <section id="lab" data-chapter="Lab" className="relative flex min-h-[92svh] items-center justify-center overflow-hidden">
      <div data-cursor="Play" className="absolute inset-0">
        <RippleSurface className="h-full w-full" />
      </div>

      <div className="relative z-10 px-5 py-32 text-center">
        <Reveal>
          <SectionTag className="justify-center">03 — The lab</SectionTag>
        </Reveal>
        <Reveal delay={0.12}>
          <h2 className="mt-8 font-display text-[clamp(3rem,9vw,7.5rem)] font-black font-wide leading-[0.9] tracking-[-0.02em]">
            Step <span className="font-serif font-normal italic text-accent">inside.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="mx-auto mt-8 max-w-md leading-relaxed text-muted">
            Instruments, experiments and unfinished ideas — the working surface of Mizu, open to touch.
          </p>
        </Reveal>
        <Reveal delay={0.36}>
          <div className="mt-10 flex justify-center">
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
          </div>
        </Reveal>
        <Reveal delay={0.48}>
          <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
            Click the surface — it answers
          </p>
        </Reveal>
      </div>
    </section>
  );
}
