"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ButtonLink, Magnetic } from "@/mizu";
import { Rise, RiseMask } from "@/components/ui/Rise";
import { COMMISSIONS, usd } from "@/app/work/brief";
import { Stage } from "./Stage";

const FLOOR = usd(Math.min(...COMMISSIONS.map((c) => c.from)));

const STEPS: { key: string; title: ReactNode; body: string }[] = [
  {
    key: "brief",
    title: (
      <>
        First, what it has to <em>do.</em>
      </>
    ),
    body: "Before anything is drawn, we write down what the component holds, which states it can be in and which keys it answers to. You read it before I build anything.",
  },
  {
    key: "surface",
    title: (
      <>
        Then, its <em>surface.</em>
      </>
    ),
    body: "Ink, type, rules and spacing, taken from your brand or built with you. Anything decorative goes. Everything left has a job to do.",
  },
  {
    key: "states",
    title: (
      <>
        Every state, <em>designed.</em>
      </>
    ),
    body: "Loading, empty, error, ready. Most products design one of these and ship all four. I design all four, because the other three are where people get stuck.",
  },
  {
    key: "motion",
    title: (
      <>
        Motion that tells you <em>something.</em>
      </>
    ),
    body: "The playhead follows your hand, the readout settles, the selection travels to what you are looking at. Drag it, or use the arrow keys. It moves to show what changed, never to decorate.",
  },
  {
    key: "handoff",
    title: (
      <>
        Then it’s <em>yours.</em>
      </>
    ),
    body: "Typed React in your repository, documented, with the keymap written down. Nothing to license and nothing to renew. Your team can extend it the day I leave.",
  },
];

/** The opening of /work: the pitch, then one component built step by step as the copy scrolls past. */
export function Build() {
  const [stage, setStage] = useState(1);
  const marks = useRef<(HTMLElement | null)[]>([]);

  // The step crossing a line sets the stage: just below the middle of the
  // screen beside the stage, lower on a phone, where the stage sits on top.
  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 899px)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            setStage(Number((e.target as HTMLElement).dataset.stage));
      },
      { rootMargin: narrow ? "-74% 0px -24% 0px" : "-56% 0px -42% 0px" },
    );
    for (const el of marks.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="work-build">
      <header
        ref={(el) => {
          marks.current[0] = el;
        }}
        data-stage="1"
        data-chapter="Commission"
        className="work-hero"
      >
        <h1>
          <RiseMask delay={0.05}>Have it</RiseMask>
          <RiseMask delay={0.16}>
            <em>made.</em>
          </RiseMask>
        </h1>
        <Rise delay={0.3}>
          <p className="work-hero-lede">
            <strong>Mizu Studio is one person: me.</strong> I design and build
            the parts of a product people remember, to the standard of this
            archive, from <strong>{FLOOR}</strong>.
          </p>
        </Rise>
        <Rise delay={0.42}>
          <div className="work-hero-actions">
            <Magnetic>
              <ButtonLink href="#brief">Start a brief</ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="#rates" variant="ghost">
                See the rates
              </ButtonLink>
            </Magnetic>
          </div>
          <p className="work-hero-floor">Scroll to watch one get made</p>
        </Rise>
      </header>

      <div className="work-stage-col">
        <div>
          <Rise delay={0.2} time={1}>
            <Stage stage={stage} />
          </Rise>
        </div>
      </div>

      <ol className="work-steps" data-chapter="Process">
        {STEPS.map((s, i) => (
          <li
            key={s.key}
            ref={(el) => {
              marks.current[i + 1] = el;
            }}
            data-stage={i + 1}
            data-now={stage === i + 1 || undefined}
          >
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
