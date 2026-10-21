"use client";

import { useRef, useState } from "react";
import {
  Interview,
  Reveal,
  type InterviewAnswers,
  type InterviewQuestion,
} from "@/mizu";
import { sendGAEvent } from "@next/third-parties/google";
import { sendBrief } from "@/app/work/actions";
import { Arrow } from "./Arrow";
import { BUDGETS, COMMISSIONS, KINDS, TIMELINES, usd } from "@/app/work/brief";

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

const QUESTIONS: InterviewQuestion[] = [
  {
    id: "kind",
    title: "What should I make?",
    type: "choice",
    options: KINDS,
    required: true,
  },
  {
    id: "about",
    title: "Tell me about it.",
    description:
      "What it is, who uses it, and what has to be true when it’s done.",
    type: "long",
    required: true,
    placeholder: "A timeline editor for our audio app…",
    validate: (v) => {
      const text = String(v ?? "").trim();
      if (text.length < 10) return "A sentence or two, please.";
      if (text.length > 4000) return "Keep it under 4,000 characters.";
    },
  },
  {
    id: "link",
    title: "Where can I see it?",
    description: "A product, a Figma file or a repository. Optional.",
    type: "text",
    placeholder: "https://",
  },
  {
    id: "budget",
    title: "What’s the budget?",
    description: "A range is fine. It helps me suggest the right scope.",
    type: "choice",
    options: BUDGETS,
    required: true,
  },
  {
    id: "timeline",
    title: "When do you need it?",
    type: "choice",
    options: TIMELINES,
    required: true,
  },
  {
    id: "name",
    title: "And you are?",
    type: "text",
    required: true,
    placeholder: "Your name",
  },
  {
    id: "email",
    title: "Where should I reply?",
    type: "email",
    required: true,
    placeholder: "you@company.com",
  },
];

const track = (event: string, params: Record<string, string | number> = {}) =>
  sendGAEvent("event", event, params);

export function Commission() {
  const [answers, setAnswers] = useState<InterviewAnswers>({});
  const [failure, setFailure] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const reached = useRef(new Set<string>());

  const answer = (next: InterviewAnswers) => {
    QUESTIONS.forEach((q, i) => {
      if (next[q.id] === answers[q.id] || reached.current.has(q.id)) return;
      if (reached.current.size === 0) track("brief_start");
      reached.current.add(q.id);
      track("brief_answer", { question: q.id, step: i + 1 });
    });
    setAnswers(next);
  };

  const brief = (kind: string) => {
    track("brief_prefill", { commission: kind });
    setAnswers((a) => ({ ...a, kind }));
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    heading.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    heading.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <section
        id="rates"
        data-chapter="Rates"
        className="work-section work-rates"
      >
        <header className="work-section-head">
          <Reveal>
            <h2>
              What it <em>costs.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              Starting points, not quotes. After a first conversation you get a
              written scope and one price for the whole job.
            </p>
          </Reveal>
        </header>

        <ol className="work-rate-list">
          {COMMISSIONS.map((c, i) => (
            <li key={c.id} id={`rate-${c.id}`}>
              <Reveal delay={i * 0.06} className="work-rate">
                <div className="work-rate-name">
                  <h3>{c.name}</h3>
                  <p>{c.line}</p>
                </div>
                <ul className="work-rate-includes">
                  {c.includes.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <p className="work-rate-weeks">{c.weeks}</p>
                <p className="work-rate-price">
                  <span>from</span>
                  {usd(c.from)}
                </p>
                <button
                  type="button"
                  className="work-rate-cta"
                  onClick={() => brief(c.id)}
                  aria-label={`Brief a ${c.name.toLowerCase()}`}
                >
                  Brief this <Arrow />
                </button>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal>
          <p className="work-outside">
            <span>Outside what I take on</span>
            Brand identity and logos · Native mobile apps · Backend and
            infrastructure
          </p>
        </Reveal>
      </section>

      <section
        id="brief"
        data-chapter="Brief"
        className="work-section work-brief"
      >
        <div className="work-brief-copy">
          <h2 ref={heading} tabIndex={-1}>
            Start a <em>brief.</em>
          </h2>
          <p>
            Seven questions, about two minutes. Letter keys pick an answer and
            Enter moves on.
          </p>
          <p>It comes straight to my inbox. Nobody else reads it.</p>
          {failure && (
            <p className="work-brief-failure" role="alert">
              {failure} Your answers are still here.
              {CONTACT && (
                <>
                  {" "}
                  You can also write to{" "}
                  <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
                </>
              )}
            </p>
          )}
          {CONTACT && !failure && (
            <p className="work-brief-mail">
              Prefer email? <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
            </p>
          )}
          <p className="work-sign">
            Talk soon.
            <span>Mizu Studio</span>
          </p>
        </div>
        <div className="mizu-frame mizu-frame--line-bright work-interview-frame">
          {(["tl", "tr", "bl", "br"] as const).map((c) => (
            <span
              key={c}
              aria-hidden
              className={`mizu-frame-corner mizu-frame-corner--${c}`}
            />
          ))}
          <Interview
            label="Commission brief"
            className="work-interview"
            questions={QUESTIONS}
            answers={answers}
            onAnswersChange={answer}
            submitLabel="Send the brief"
            done={
              <p>
                <strong>It’s in.</strong> I read every brief myself, and I’ll
                write back to {String(answers.email ?? "you")}.
              </p>
            }
            onSubmit={async (a) => {
              setFailure("");
              const reason = await sendBrief(a).catch(
                () => "The brief didn’t send.",
              );
              if (reason) {
                track("brief_failed", { reason });
                setFailure(reason);
                throw new Error(reason);
              }
              track("brief_sent", {
                commission: String(a.kind),
                budget: String(a.budget),
                timeline: String(a.timeline),
              });
            }}
          />
        </div>
      </section>
    </>
  );
}
