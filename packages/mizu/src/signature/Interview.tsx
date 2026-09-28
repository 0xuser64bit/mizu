"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useReducedMotion } from "../motion/Preferences.tsx";
import { EASE_EXPO } from "../motion/easings.ts";
import { Button } from "../ui/Button.tsx";
import { useAnnouncer, useControllable } from "./internal.ts";

export type InterviewAnswer =
  string | number | boolean | readonly string[] | undefined;
export type InterviewAnswers = Readonly<Record<string, InterviewAnswer>>;
export type InterviewQuestion = {
  id: string;
  title: string;
  description?: ReactNode;
  type:
    | "text"
    | "long"
    | "email"
    | "number"
    | "choice"
    | "multi"
    | "scale"
    | "yesno";
  options?: readonly { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  /** Scale and number bounds. */
  min?: number;
  max?: number;
  /** Return a message to keep the question open. */
  validate?: (
    value: InterviewAnswer,
    answers: InterviewAnswers,
  ) => string | undefined;
  /** Branching: the next question's id, or "review" to finish early. Defaults to the following question. */
  next?: (answers: InterviewAnswers) => string | undefined;
};

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const empty = (v: InterviewAnswer) =>
  v === undefined ||
  v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "number" && !Number.isFinite(v));

function display(q: InterviewQuestion, v: InterviewAnswer) {
  if (empty(v)) return "—";
  if (q.type === "yesno") return v ? "Yes" : "No";
  const label = (value: string) =>
    q.options?.find((o) => o.value === value)?.label ?? value;
  if (Array.isArray(v)) return v.map(label).join(", ");
  if (q.type === "choice") return label(String(v));
  return String(v);
}

/**
 * A conversation instead of a form: one question at a time, letter keys for
 * choices, branching, a review before sending and an honest submit.
 */
export function Interview({
  label,
  questions,
  answers: answersProp,
  defaultAnswers = {},
  onAnswersChange,
  onSubmit,
  intro,
  done = "Thank you — your answers are in.",
  submitLabel = "Send answers",
  className = "",
  style,
}: {
  label: string;
  questions: readonly InterviewQuestion[];
  answers?: InterviewAnswers;
  defaultAnswers?: InterviewAnswers;
  onAnswersChange?: (answers: InterviewAnswers) => void;
  /** Resolve to finish; throw to offer a retry. */
  onSubmit: (answers: InterviewAnswers) => void | Promise<unknown>;
  /** An optional welcome screen before the first question. */
  intro?: { title: string; body?: ReactNode; start?: string };
  done?: ReactNode;
  submitLabel?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const [message, announce] = useAnnouncer();
  const [answers, setAnswers] = useControllable<InterviewAnswers>(
    answersProp,
    defaultAnswers,
    onAnswersChange,
  );
  const [path, setPath] = useState<string[]>(
    intro || !questions.length ? [] : [questions[0]!.id],
  );
  const [screen, setScreen] = useState<
    "intro" | "question" | "review" | "sending" | "failed" | "done"
  >(intro ? "intro" : "question");
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [scope, animate] = useAnimate();
  const advanceTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const current = questions.find((q) => q.id === path[path.length - 1]);
  const index = current ? questions.indexOf(current) : -1;
  const remaining = index === -1 ? 0 : questions.length - index - 1;
  const progress =
    screen === "done" ||
    screen === "review" ||
    screen === "sending" ||
    screen === "failed"
      ? 1
      : path.length
        ? (path.length - 1) / (path.length + remaining)
        : 0;
  const value = current ? answers[current.id] : undefined;

  const set = (v: InterviewAnswer) => {
    if (!current) return;
    setError(null);
    setAnswers({ ...answers, [current.id]: v });
  };
  const reject = (text: string) => {
    setError(text);
    announce(text);
    if (!reduce && scope.current)
      void animate(
        scope.current,
        { x: [0, -8, 7, -4, 2, 0] },
        { duration: 0.42 },
      );
  };
  const forward = (withValue: InterviewAnswer = value) => {
    if (!current) return;
    if (current.required && empty(withValue))
      return reject("This one needs an answer to continue.");
    if (
      current.type === "email" &&
      !empty(withValue) &&
      !/^\S+@\S+\.\S+$/.test(String(withValue))
    )
      return reject("That doesn’t look like an email address.");
    if (
      current.type === "number" &&
      typeof withValue === "number" &&
      ((current.min !== undefined && withValue < current.min) ||
        (current.max !== undefined && withValue > current.max))
    )
      return reject(
        current.min !== undefined && current.max !== undefined
          ? `Choose a number from ${current.min} to ${current.max}.`
          : current.min !== undefined
            ? `Choose ${current.min} or more.`
            : `Choose ${current.max} or less.`,
      );
    const problem = current.validate?.(withValue, {
      ...answers,
      [current.id]: withValue,
    });
    if (problem) return reject(problem);
    const after = { ...answers, [current.id]: withValue };
    const target =
      current.next?.(after) ?? questions[index + 1]?.id ?? "review";
    setDirection(1);
    setError(null);
    if (target === "review" || !questions.some((q) => q.id === target)) {
      setScreen("review");
      announce("Review your answers.");
    } else {
      setPath([...path, target]);
      announce(
        `Question ${path.length + 1}: ${questions.find((q) => q.id === target)!.title}`,
      );
    }
  };
  const back = () => {
    setDirection(-1);
    setError(null);
    if (screen === "review") setScreen("question");
    else if (path.length > 1) setPath(path.slice(0, -1));
    else if (intro) setScreen("intro");
  };
  const choose = (option: string) => {
    if (!current) return;
    if (current.type === "multi") {
      const list = Array.isArray(value) ? (value as string[]) : [];
      set(
        list.includes(option)
          ? list.filter((v) => v !== option)
          : [...list, option],
      );
      return;
    }
    set(option);
    setConfirming(option);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(
      () => {
        setConfirming(null);
        forward(option);
      },
      reduce ? 0 : 420,
    );
  };
  const submit = async () => {
    setScreen("sending");
    try {
      await onSubmit(answers);
      setScreen("done");
      announce("Answers sent.");
    } catch {
      setScreen("failed");
      announce("Sending failed. Your answers are still here.");
    }
  };

  // Shortcuts: letters pick choices, digits pick a scale, Y and N answer yes/no, Enter continues.
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (screen !== "question" || !current || e.metaKey || e.altKey) return;
    const typing = (e.target as HTMLElement).matches(
      "input:not([type=radio]):not([type=checkbox]), textarea",
    );
    if (
      e.key === "Enter" &&
      (!typing || current.type !== "long" || e.ctrlKey)
    ) {
      e.preventDefault();
      if (!e.repeat) forward();
      return;
    }
    if (typing || e.ctrlKey) return;
    const k = e.key.toUpperCase();
    if (
      (current.type === "choice" || current.type === "multi") &&
      current.options
    ) {
      const option = current.options[KEYS.indexOf(k)];
      if (option && k.length === 1) {
        e.preventDefault();
        choose(option.value);
      }
    } else if (current.type === "yesno" && (k === "Y" || k === "N")) {
      e.preventDefault();
      set(k === "Y");
      setConfirming(k);
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(
        () => {
          setConfirming(null);
          forward(k === "Y");
        },
        reduce ? 0 : 420,
      );
    } else if (current.type === "scale" && /^[0-9]$/.test(e.key)) {
      const n = e.key === "0" ? 10 : Number(e.key);
      if (n >= (current.min ?? 1) && n <= (current.max ?? 10)) {
        e.preventDefault();
        set(n);
      }
    }
  };

  const slide = reduce
    ? {
        initial: false as const,
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0 } },
      }
    : {
        initial: { opacity: 0, y: 40 * direction },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -28 * direction },
      };
  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.5, ease: EASE_EXPO };
  const view =
    screen === "question"
      ? (current?.id ?? "question")
      : screen === "sending" || screen === "failed"
        ? "review"
        : screen;

  return (
    <section
      className={`mizu-interview ${className}`}
      style={style}
      aria-label={label}
      onKeyDown={onKey}
    >
      <div
        className="mizu-interview-progress"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <motion.span
          animate={{ scaleX: progress }}
          initial={false}
          transition={transition}
        />
      </div>
      <div className="mizu-interview-stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            className="mizu-interview-screen"
            {...slide}
            transition={transition}
          >
            {screen === "intro" && intro && (
              <div className="mizu-interview-intro">
                <h3>{intro.title}</h3>
                {intro.body && (
                  <div className="mizu-interview-description">{intro.body}</div>
                )}
                <Button
                  onClick={() => {
                    setDirection(1);
                    setScreen("question");
                    if (!path.length && questions[0])
                      setPath([questions[0].id]);
                  }}
                  disabled={!questions.length}
                >
                  {intro.start ?? "Begin"}
                </Button>
                <p className="mizu-interview-hint">
                  {questions.length} questions · <kbd>Enter ↵</kbd> to continue
                </p>
              </div>
            )}

            {screen === "question" && current && (
              <form
                className="mizu-interview-question"
                aria-labelledby={`${id}-${current.id}-title`}
                onSubmit={(e) => {
                  e.preventDefault();
                  forward();
                }}
              >
                <p className="mizu-interview-number" aria-hidden="true">
                  {String(path.length).padStart(2, "0")} <span>→</span>
                </p>
                <h3 id={`${id}-${current.id}-title`}>
                  {current.title}
                  {current.required && (
                    <span className="mizu-interview-required"> *</span>
                  )}
                </h3>
                {current.description && (
                  <div
                    id={`${id}-${current.id}-description`}
                    className="mizu-interview-description"
                  >
                    {current.description}
                  </div>
                )}
                <div ref={scope} className="mizu-interview-answer">
                  <Field
                    question={current}
                    value={value}
                    confirming={confirming}
                    labelledBy={`${id}-${current.id}-title`}
                    describedBy={
                      [
                        current.description &&
                          `${id}-${current.id}-description`,
                        error && `${id}-error`,
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    invalid={!!error}
                    onChange={set}
                    onChoose={choose}
                  />
                </div>
                <p
                  id={`${id}-error`}
                  className="mizu-interview-error"
                  role="alert"
                >
                  {error ?? ""}
                </p>
                <div className="mizu-interview-nav">
                  {(path.length > 1 || intro) && (
                    <button
                      type="button"
                      className="mizu-text-button"
                      onClick={back}
                    >
                      ← Back
                    </button>
                  )}
                  <span className="mizu-interview-hint">
                    {current.type === "long" ? (
                      <>
                        <kbd>Ctrl ↵</kbd> to continue
                      </>
                    ) : current.type === "choice" ||
                      current.type === "multi" ? (
                      <>
                        Press <kbd>A</kbd>–
                        <kbd>{KEYS[(current.options?.length ?? 1) - 1]}</kbd>
                        {current.type === "multi" && (
                          <>
                            {" "}
                            then <kbd>Enter ↵</kbd>
                          </>
                        )}
                      </>
                    ) : current.type === "yesno" ? (
                      <>
                        Press <kbd>Y</kbd> or <kbd>N</kbd>
                      </>
                    ) : (
                      <>
                        <kbd>Enter ↵</kbd> to continue
                      </>
                    )}
                  </span>
                  <Button type="submit" size="sm">
                    {remaining === 0 && !current.next ? "Review" : "Next"}
                  </Button>
                </div>
              </form>
            )}

            {(screen === "review" ||
              screen === "sending" ||
              screen === "failed") && (
              <div className="mizu-interview-review">
                <h3>Before you send</h3>
                <dl>
                  {path.map((qid) => {
                    const q = questions.find((x) => x.id === qid)!;
                    return (
                      <div key={qid}>
                        <dt>{q.title}</dt>
                        <dd>
                          <span>{display(q, answers[qid])}</span>
                          <button
                            type="button"
                            className="mizu-text-button"
                            disabled={screen === "sending"}
                            aria-label={`Edit: ${q.title}`}
                            onClick={() => {
                              setDirection(-1);
                              setPath(path.slice(0, path.indexOf(qid) + 1));
                              setScreen("question");
                            }}
                          >
                            Edit
                          </button>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                {screen === "failed" && (
                  <p className="mizu-interview-error" role="alert">
                    Sending didn’t work. Nothing is lost — try again.
                  </p>
                )}
                <div className="mizu-interview-nav">
                  <button
                    type="button"
                    className="mizu-text-button"
                    onClick={back}
                    disabled={screen === "sending"}
                  >
                    ← Back
                  </button>
                  <Button onClick={submit} loading={screen === "sending"}>
                    {screen === "failed" ? "Try again" : submitLabel}
                  </Button>
                </div>
              </div>
            )}

            {screen === "done" && (
              <div className="mizu-interview-done" role="status">
                <span className="mizu-interview-seal" aria-hidden="true" />
                <div>{done}</div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </section>
  );
}

function Field({
  question: q,
  value,
  confirming,
  labelledBy,
  describedBy,
  invalid,
  onChange,
  onChoose,
}: {
  question: InterviewQuestion;
  value: InterviewAnswer;
  confirming: string | null;
  labelledBy: string;
  describedBy?: string;
  invalid: boolean;
  onChange: (value: InterviewAnswer) => void;
  onChoose: (value: string) => void;
}) {
  const first = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      first.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [q.id]);
  const common = {
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
    "aria-invalid": invalid || undefined,
  };
  const setFirst = (el: HTMLElement | null) => {
    if (el && !first.current) first.current = el;
  };

  if (q.type === "choice" || q.type === "multi")
    return (
      <div
        role={q.type === "choice" ? "radiogroup" : "group"}
        {...common}
        className="mizu-interview-choices"
      >
        {q.options?.map((o, i) => {
          const on = Array.isArray(value)
            ? value.includes(o.value)
            : value === o.value;
          return (
            <label
              key={o.value}
              data-on={on || undefined}
              data-confirming={confirming === o.value || undefined}
            >
              <input
                ref={i === 0 ? setFirst : undefined}
                type={q.type === "choice" ? "radio" : "checkbox"}
                name={q.id}
                checked={on}
                onChange={() => onChoose(o.value)}
              />
              <kbd aria-hidden="true">{KEYS[i]}</kbd>
              <span>{o.label}</span>
              <i aria-hidden="true" />
            </label>
          );
        })}
      </div>
    );
  if (q.type === "yesno")
    return (
      <div
        role="radiogroup"
        {...common}
        className="mizu-interview-choices"
        data-inline=""
      >
        {[
          [true, "Yes", "Y"],
          [false, "No", "N"],
        ].map(([v, text, key], i) => (
          <label
            key={text as string}
            data-on={value === v || undefined}
            data-confirming={confirming === key || undefined}
          >
            <input
              ref={i === 0 ? setFirst : undefined}
              type="radio"
              name={q.id}
              checked={value === v}
              onChange={() => onChange(v as boolean)}
            />
            <kbd aria-hidden="true">{key as string}</kbd>
            <span>{text as string}</span>
            <i aria-hidden="true" />
          </label>
        ))}
      </div>
    );
  if (q.type === "scale") {
    const lo = q.min ?? 1,
      hi = q.max ?? 10;
    return (
      <div role="radiogroup" {...common} className="mizu-interview-scale">
        {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((n) => (
          <label key={n} data-on={value === n || undefined}>
            <input
              ref={n === lo ? setFirst : undefined}
              type="radio"
              name={q.id}
              checked={value === n}
              onChange={() => onChange(n)}
            />
            <span>{n}</span>
          </label>
        ))}
      </div>
    );
  }
  if (q.type === "long")
    return (
      <textarea
        ref={setFirst}
        {...common}
        className="mizu-interview-input"
        rows={3}
        placeholder={q.placeholder ?? "Type your answer…"}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  return (
    <input
      ref={setFirst}
      {...common}
      className="mizu-interview-input"
      type={
        q.type === "email" ? "email" : q.type === "number" ? "number" : "text"
      }
      inputMode={q.type === "number" ? "decimal" : undefined}
      min={q.min}
      max={q.max}
      placeholder={q.placeholder ?? "Type your answer…"}
      value={
        typeof value === "number"
          ? Number.isFinite(value)
            ? value
            : ""
          : typeof value === "string"
            ? value
            : ""
      }
      onChange={(e) =>
        onChange(
          q.type === "number"
            ? e.target.value === ""
              ? undefined
              : Number(e.target.value)
            : e.target.value,
        )
      }
    />
  );
}
