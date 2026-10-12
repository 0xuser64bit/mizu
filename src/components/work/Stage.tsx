"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import { Frame } from "@/mizu";

export const STAGES = [
  "Sketch",
  "Surface",
  "States",
  "Motion",
  "Handoff",
] as const;
const STATES = ["Loading", "Empty", "Error", "Ready"] as const;
type State = (typeof STATES)[number];

// Illustrative data: a day of p95 latency in half hours, one bad deploy and
// its rollback. Rounded so the server and every browser draw the same path.
const N = 48;
const W = 480;
const H = 140;
const VALUES = Array.from({ length: N }, (_, i) =>
  Math.round(
    118 +
      14 * Math.sin(i / 3.1) +
      6 * Math.sin(i * 1.7) +
      (i >= 29 && i < 40 ? 64 + 18 * Math.sin((i - 29) / 2.2) : 0) +
      (i >= 40 && i < 43 ? (22 * (43 - i)) / 3 : 0),
  ),
);
const EVENTS = [
  { at: 9, service: "worker", what: "Queue limits raised" },
  { at: 21, service: "web", what: "Checkout hotfix" },
  { at: 29, service: "api", what: "v2.14.0 rolled out" },
  { at: 40, service: "api", what: "Rolled back to v2.13.2" },
];
const px = (i: number) => Math.round((i / (N - 1)) * W * 10) / 10;
const py = (v: number) =>
  Math.round((H - 10 - ((v - 80) / 180) * (H - 20)) * 10) / 10;
const LINE = VALUES.map((v, i) => `${i ? "L" : "M"}${px(i)} ${py(v)}`).join("");
const AREA = `${LINE}L${W} ${H}L0 ${H}Z`;
/** Where the playhead rests before it moves: just after the bad deploy. */
const REST = 30 / (N - 1);

const clock = (i: number) => {
  const m = Math.round(i * 30);
  return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

function sample(p: number) {
  const i = p * (N - 1);
  const a = Math.floor(i);
  const b = Math.min(a + 1, N - 1);
  const v = Math.round(VALUES[a]! + (VALUES[b]! - VALUES[a]!) * (i - a));
  const row = EVENTS.findLastIndex((e) => e.at <= i + 1e-6);
  return { i, v, row };
}
const rest = sample(REST);

const Note = ({ children }: { children: ReactNode }) => (
  <span className="work-note" aria-hidden>
    {children}
  </span>
);

/**
 * One component, built in five stages: the sketch, its surface, its states,
 * its motion and the handoff. The stages share one DOM so each step is the
 * same thing changing, not a slide swapped for another.
 */
export function Stage({ stage }: { stage: number }) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const value = useRef<HTMLElement>(null);
  const p = useRef(REST);
  const retryTimer = useRef(0);
  const [row, setRow] = useState(rest.row);
  // Undefined until the visitor decides: then it plays unless they asked for less motion.
  const [playing, setPlaying] = useState<boolean>();
  const [state, setState] = useState<State>("Loading");
  const [pinned, setPinned] = useState(false);
  const live = stage >= 4;
  const moving = live && (playing ?? !reduce);
  const shown: State = stage === 3 ? state : "Ready";

  // The playhead changes every frame, so it is written to the DOM, not state.
  const place = useCallback((next: number) => {
    p.current = Math.min(1, Math.max(0, next));
    const s = sample(p.current);
    root.current?.style.setProperty("--p", String(p.current));
    if (time.current) time.current.textContent = clock(s.i);
    if (value.current) value.current.textContent = `${s.v} ms`;
    slider.current?.setAttribute("aria-valuenow", String(Math.round(s.i)));
    slider.current?.setAttribute(
      "aria-valuetext",
      `${clock(s.i)}, p95 ${s.v} milliseconds`,
    );
    setRow(s.row);
  }, []);

  // Leaving the motion stage hands the playhead back to its resting place.
  const [wasLive, setWasLive] = useState(live);
  if (wasLive !== live) {
    setWasLive(live);
    if (!live) setPlaying(undefined);
  }
  useEffect(() => {
    if (!live) place(REST);
  }, [live, place]);

  useEffect(() => {
    if (!moving) return;
    const el = root.current!;
    let seen = true;
    let raf = 0;
    let last = performance.now();
    const io = new IntersectionObserver(([e]) => (seen = !!e?.isIntersecting));
    io.observe(el);
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      if (seen && !document.hidden) place((p.current + dt / 9000) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [moving, place]);

  useEffect(() => {
    if (stage !== 3 || pinned || reduce) return;
    const id = window.setInterval(
      () => setState((s) => STATES[(STATES.indexOf(s) + 1) % STATES.length]!),
      1700,
    );
    return () => window.clearInterval(id);
  }, [stage, pinned, reduce]);
  useEffect(() => () => window.clearTimeout(retryTimer.current), []);

  const pick = (s: State) => {
    window.clearTimeout(retryTimer.current);
    setPinned(true);
    setState(s);
  };
  const retry = () => {
    pick("Loading");
    retryTimer.current = window.setTimeout(() => setState("Ready"), 1100);
  };

  const scrub = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    place((e.clientX - r.left) / r.width);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!live) return;
    if (e.key === " ") {
      e.preventDefault();
      setPlaying(!moving);
      return;
    }
    const step = (e.shiftKey ? 6 : 1) / (N - 1);
    const to = {
      ArrowLeft: p.current - step,
      ArrowRight: p.current + step,
      Home: 0,
      End: 1,
    }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    setPlaying(false);
    place(to);
  };

  return (
    <div className="work-stage-wrap">
      <Frame
        label={`Fig. ${stage} — ${STAGES[stage - 1]}`}
        tone="line-bright"
        className="work-frame"
      >
        <div
          ref={root}
          className="work-stage"
          data-stage={stage}
          data-state={shown.toLowerCase()}
          style={{ "--p": REST } as CSSProperties}
        >
          <div
            className="work-r work-head"
            style={{ "--i": 0 } as CSSProperties}
          >
            <Note>Title — what this is</Note>
            <div className="work-fill">
              <p>
                <strong>Deploys</strong>
                <span>Last 24 hours · api, web, worker</span>
              </p>
              <span className="work-live">Live</span>
            </div>
          </div>

          <div
            className="work-r work-readout"
            style={{ "--i": 1 } as CSSProperties}
          >
            <Note>Readout — a fixed line, never a tooltip</Note>
            <p className="work-fill">
              <span ref={time}>{clock(rest.i)}</span>
              <span>
                p95 <b ref={value}>{rest.v} ms</b>
              </span>
              <span className="work-readout-event">
                {row >= 0
                  ? `after ${EVENTS[row]!.service} · ${EVENTS[row]!.what}`
                  : "before the first deploy"}
              </span>
            </p>
          </div>

          <div className="work-body">
            <div
              ref={slider}
              className="work-r work-chart"
              style={{ "--i": 2 } as CSSProperties}
              role="slider"
              tabIndex={live ? 0 : -1}
              aria-label="Playhead"
              aria-disabled={!live}
              aria-valuemin={0}
              aria-valuemax={N - 1}
              aria-valuenow={Math.round(rest.i)}
              aria-valuetext={`${clock(rest.i)}, p95 ${rest.v} milliseconds`}
              onKeyDown={onKey}
              onFocus={() => live && setPlaying(false)}
              onPointerDown={(e) => {
                if (!live) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                setPlaying(false);
                scrub(e);
              }}
              onPointerMove={(e) => {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) scrub(e);
              }}
            >
              <Note>Chart — drag to scrub</Note>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="work-pencil"
                aria-hidden
              >
                <path d={LINE} />
              </svg>
              <div className="work-fill work-plot">
                <svg viewBox={`0 0 ${W} ${H}`} aria-hidden>
                  {[0.25, 0.5, 0.75].map((g) => (
                    <line
                      key={g}
                      className="work-grid"
                      x1={0}
                      x2={W}
                      y1={H * g}
                      y2={H * g}
                    />
                  ))}
                  <path className="work-area" d={AREA} />
                  <path className="work-line" d={LINE} pathLength={1} />
                </svg>
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="work-played"
                  aria-hidden
                >
                  <path className="work-line" d={LINE} />
                </svg>
                <span className="work-marks" aria-hidden>
                  {EVENTS.map((e) => (
                    <i
                      key={e.at}
                      style={{ "--at": e.at / (N - 1) } as CSSProperties}
                    />
                  ))}
                </span>
                <span className="work-playhead" aria-hidden />
              </div>
              <div className="work-fill work-axis" aria-hidden>
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>

            <div
              className="work-r work-rows"
              style={{ "--i": 3 } as CSSProperties}
            >
              <Note>Rows — the selection travels</Note>
              <ol
                className="work-fill"
                style={{ "--row": Math.max(row, 0) } as CSSProperties}
                data-none={row < 0 || undefined}
              >
                {EVENTS.map((e, k) => (
                  <li key={e.at} aria-current={k === row || undefined}>
                    <i aria-hidden />
                    <b>{e.service}</b>
                    <span>{e.what}</span>
                    <time>{clock(e.at)}</time>
                  </li>
                ))}
              </ol>
              <div className="work-code" inert={stage !== 5}>
                <p>
                  <span>src/components/DeployTimeline.tsx</span>
                  <span className="work-code-seal">Yours</span>
                </p>
                <pre>
                  <code>
                    {"<"}
                    <b>DeployTimeline</b>
                    {"\n  "}
                    <i>label</i>=<em>&quot;Deploys&quot;</em>
                    {"\n  "}
                    <i>events</i>={"{deploys}"}
                    {"\n  "}
                    <i>cursor</i>={"{cursor}"}
                    {"\n  "}
                    <i>onCursorChange</i>={"{setCursor}"}
                    {"\n/>"}
                  </code>
                </pre>
              </div>
            </div>

            <div
              className="work-overlay"
              data-for="loading"
              inert={shown !== "Loading"}
            >
              <span className="work-skeleton" aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
              <p className="work-overlay-label">Loading deploys…</p>
            </div>
            <div
              className="work-overlay"
              data-for="empty"
              inert={shown !== "Empty"}
            >
              <p>Nothing deployed in this window.</p>
              <span>Widen the range, or clear the service filter.</span>
            </div>
            <div
              className="work-overlay"
              data-for="error"
              inert={shown !== "Error"}
            >
              <p>Couldn’t reach the deploy log.</p>
              <span>Your last view is kept.</span>
              <button type="button" onClick={retry}>
                Retry
              </button>
            </div>
          </div>

          <div
            className="work-r work-bar"
            style={{ "--i": 4 } as CSSProperties}
          >
            <Note>Controls — states, then the transport</Note>
            <p className="work-legend" aria-hidden>
              <span>p95 latency</span>
              <span>Deploy</span>
            </p>
            <div role="group" aria-label="Component state" inert={stage !== 3}>
              {STATES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={shown === s}
                  onClick={() => pick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div inert={!live}>
              <button type="button" onClick={() => setPlaying(!moving)}>
                {moving ? "Pause" : "Play"}
              </button>
              <span>Drag the chart · ← → · Space</span>
            </div>
          </div>
        </div>
      </Frame>
      <ol className="work-ruler" aria-hidden>
        {STAGES.map((s, i) => (
          <li
            key={s}
            data-on={i < stage || undefined}
            data-now={i === stage - 1 || undefined}
          >
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
