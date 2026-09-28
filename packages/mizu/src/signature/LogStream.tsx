"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { DescriptionList } from "../data/Records.tsx";
import { useReducedMotion } from "../motion/Preferences.tsx";
import {
  clamp,
  useAnnouncer,
  useControllable,
  useElementSize,
  useIsoLayoutEffect,
  useLatest,
} from "./internal.ts";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogLine = {
  id: string | number;
  /** Epoch milliseconds. */
  time: number;
  level: LogLevel;
  message: string;
  source?: string;
  fields?: Record<string, string | number | boolean | null>;
};
type LineId = LogLine["id"];

const LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];
const ROW = 24;
const OVERSCAN = 8;
const BINS = 72;
const pad = (n: number, width = 2) => String(n).padStart(width, "0");

function stamp(time: number, utc: boolean) {
  const d = new Date(time);
  const [h, m, s, ms] = utc
    ? [
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds(),
        d.getUTCMilliseconds(),
      ]
    : [d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()];
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

/** Splits `text` around case-insensitive matches of `query`, for highlighting. */
function marked(text: string, query: string): ReactNode {
  if (!query) return text;
  const out: ReactNode[] = [];
  const lower = text.toLowerCase(),
    q = query.toLowerCase();
  let at = 0;
  for (let i = lower.indexOf(q); i >= 0; i = lower.indexOf(q, i + q.length)) {
    if (i > at) out.push(text.slice(at, i));
    out.push(<mark key={i}>{text.slice(i, i + q.length)}</mark>);
    at = i + q.length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

/**
 * A live log tail that only renders the lines in view. It follows new lines
 * until you scroll away, then counts what you missed; filter by level,
 * search with highlighted matches, and read any line in full.
 */
export function LogStream({
  label,
  lines,
  selected,
  defaultSelected = null,
  onSelectedChange,
  loading = false,
  empty = "No log lines yet.",
  utc = false,
  className = "",
  style,
}: {
  label: string;
  /** Oldest first. Append to it as lines arrive; trim it to bound memory. */
  lines: readonly LogLine[];
  selected?: LineId | null;
  defaultSelected?: LineId | null;
  onSelectedChange?: (id: LineId | null) => void;
  loading?: boolean;
  empty?: ReactNode;
  /** Show times in UTC rather than local time. */
  utc?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const [scrollerRef, { height }] = useElementSize<HTMLDivElement>();
  const [current, setCurrent] = useControllable<LineId | null>(
    selected,
    defaultSelected,
    onSelectedChange,
  );
  const [levels, setLevels] = useState<ReadonlySet<LogLevel>>(
    () => new Set(LEVELS),
  );
  const [query, setQuery] = useState("");
  const [match, setMatch] = useState(0);
  const [top, setTop] = useState(0);
  const [following, setFollowing] = useState(true);
  // Positions are kept as line ids, so trimming old lines never skews the counts.
  const lastId = lines.length ? lines[lines.length - 1]!.id : null;
  const [pausedAfter, setPausedAfter] = useState<LineId | null>(null);
  const [freshAfter, setFreshAfter] = useState<LineId | null>(lastId);
  const [message, announce] = useAnnouncer();

  const shown = useMemo(
    () => lines.filter((l) => levels.has(l.level)),
    [lines, levels],
  );
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: number[] = [];
    shown.forEach((l, i) => {
      if (
        l.message.toLowerCase().includes(q) ||
        l.source?.toLowerCase().includes(q)
      )
        out.push(i);
    });
    return out;
  }, [shown, query]);
  const counts = useMemo(() => {
    const c: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    };
    for (const l of lines) c[l.level]++;
    return c;
  }, [lines]);

  // Overview: lines over time, stacked by level so a spike of errors stands out.
  const overview = useMemo(() => {
    if (lines.length < 2) return null;
    const start = lines[0]!.time,
      span = Math.max(1, lines[lines.length - 1]!.time - start);
    const bins = Array.from({ length: BINS }, () => ({
      total: 0,
      warn: 0,
      error: 0,
    }));
    for (const l of lines) {
      const bin =
        bins[Math.min(BINS - 1, Math.floor(((l.time - start) / span) * BINS))]!;
      bin.total++;
      if (l.level === "warn" || l.level === "error") bin[l.level]++;
    }
    return { start, span, bins, most: Math.max(...bins.map((b) => b.total)) };
  }, [lines]);

  const index =
    current === null ? -1 : shown.findIndex((l) => l.id === current);
  const first = Math.max(0, Math.floor(top / ROW) - OVERSCAN);
  const last = Math.min(
    shown.length,
    Math.ceil((top + height) / ROW) + OVERSCAN,
  );
  const after = (lineId: LineId | null) => {
    if (lineId === null) return lines.length;
    for (let i = lines.length - 1; i >= 0; i--)
      if (lines[i]!.id === lineId) return lines.length - 1 - i;
    return lines.length;
  };
  const unseen = following ? 0 : after(pausedAfter);
  const fresh = new Set(
    lines.slice(lines.length - after(freshAfter)).map((l) => l.id),
  );
  const unseenRef = useLatest(unseen);

  // Follow the tail: new lines keep the newest in view.
  useIsoLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el && following) el.scrollTop = el.scrollHeight;
  }, [shown.length, following, height]);

  // New lines glow briefly as they arrive.
  useEffect(() => {
    if (lastId === freshAfter) return;
    const settle = setTimeout(() => setFreshAfter(lastId), 1200);
    return () => clearTimeout(settle);
  }, [lastId, freshAfter]);

  // While paused, missed lines are announced at most every five seconds.
  useEffect(() => {
    if (following) return;
    let said = 0;
    const every = setInterval(() => {
      const n = unseenRef.current;
      if (n && n !== said) {
        said = n;
        announce(`${n} new ${n === 1 ? "line" : "lines"}`);
      }
    }, 5000);
    return () => clearInterval(every);
  }, [following, announce, unseenRef]);

  const pause = () => {
    if (!following) return;
    setFollowing(false);
    setPausedAfter(lastId);
  };
  const resume = () => {
    setFollowing(true);
    setFreshAfter(lastId);
  };
  const reveal = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const y = i * ROW;
    if (y < el.scrollTop) el.scrollTop = y;
    else if (y + ROW > el.scrollTop + el.clientHeight)
      el.scrollTop = y + ROW - el.clientHeight;
  };
  const choose = (i: number) => {
    const line = shown[clamp(i, 0, shown.length - 1)];
    if (!line) return;
    setCurrent(line.id);
    pause();
    reveal(shown.indexOf(line));
  };
  const jumpToMatch = (step: number) => {
    if (!matches.length) return;
    const next = (match + step + matches.length) % matches.length;
    setMatch(next);
    choose(matches[next]!);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const page = Math.max(1, Math.floor(height / ROW) - 1);
    const keys: Record<string, () => void> = {
      ArrowDown: () => choose(index + 1),
      ArrowUp: () => choose(index < 0 ? shown.length - 1 : index - 1),
      PageDown: () => choose(index + page),
      PageUp: () => choose(Math.max(0, index - page)),
      Home: () => choose(0),
      End: () => {
        setCurrent(null);
        resume();
      },
      Escape: () => setCurrent(null),
    };
    const action = keys[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  const line = index >= 0 ? shown[index] : undefined;
  const matchAt = matches.length
    ? matches[Math.min(match, matches.length - 1)]
    : -1;
  const rowId = (i: number) => `${id}-row-${i}`;
  const rendered = index >= first && index < last;

  return (
    <section
      className={`mizu-log ${className}`}
      style={style}
      aria-label={label}
    >
      <div className="mizu-log-bar">
        <div className="mizu-log-levels" role="group" aria-label="Levels">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              data-level={level}
              aria-pressed={levels.has(level)}
              onClick={() =>
                setLevels((s) => {
                  const next = new Set(s);
                  if (next.has(level)) next.delete(level);
                  else next.add(level);
                  return next;
                })
              }
            >
              <i aria-hidden="true" />
              {level}
              <b>{counts[level]}</b>
            </button>
          ))}
        </div>
        <label className="mizu-log-search">
          <span className="mizu-sr-only">Search lines</span>
          <input
            type="search"
            value={query}
            placeholder="Search"
            onChange={(e) => {
              setQuery(e.target.value);
              setMatch(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                jumpToMatch(
                  e.shiftKey
                    ? -1
                    : matches.length && index === matches[match]
                      ? 1
                      : 0,
                );
              } else if (e.key === "Escape" && query) {
                e.preventDefault();
                setQuery("");
              }
            }}
          />
          {query.trim() && (
            <output aria-live="polite">
              {matches.length
                ? `${Math.min(match, matches.length - 1) + 1} / ${matches.length}`
                : "No matches"}
            </output>
          )}
        </label>
        <button
          type="button"
          className="mizu-log-follow"
          aria-pressed={following}
          onClick={() => (following ? pause() : resume())}
        >
          <i aria-hidden="true" />
          Follow
        </button>
      </div>

      {overview && (
        <svg
          className="mizu-log-overview"
          viewBox={`0 0 ${BINS} 10`}
          preserveAspectRatio="none"
          aria-hidden="true"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const t =
              overview.start + ((e.clientX - r.left) / r.width) * overview.span;
            const i = shown.findIndex((l) => l.time >= t);
            if (i >= 0) choose(i);
          }}
        >
          {overview.bins.map((bin, i) => {
            if (!bin.total) return null;
            // Errors sit on the baseline, warnings above them, the rest on top.
            const h = (bin.total / overview.most) * 9 + 1;
            const parts = [
              ["error", (bin.error / bin.total) * h],
              ["warn", (bin.warn / bin.total) * h],
              ["info", ((bin.total - bin.error - bin.warn) / bin.total) * h],
            ] as const;
            let y = 10;
            return parts.map(([level, part]) => {
              if (!part) return null;
              y -= part;
              return (
                <rect
                  key={`${i}-${level}`}
                  data-bin=""
                  data-level={level}
                  x={i + 0.1}
                  width={0.8}
                  y={y}
                  height={part}
                />
              );
            });
          })}
          {shown.length > 0 && last > first && (
            <rect
              className="mizu-log-window"
              x={
                ((shown[Math.min(first + OVERSCAN, shown.length - 1)]!.time -
                  overview.start) /
                  overview.span) *
                BINS
              }
              width={Math.max(
                0.6,
                ((shown[Math.max(0, last - OVERSCAN - 1)]!.time -
                  shown[Math.min(first + OVERSCAN, shown.length - 1)]!.time) /
                  overview.span) *
                  BINS,
              )}
              y={0.5}
              height={9}
            />
          )}
        </svg>
      )}

      <div className="mizu-log-body">
        <div
          ref={scrollerRef}
          className="mizu-log-scroller"
          role="listbox"
          tabIndex={0}
          aria-label={`${label}: ${shown.length} lines`}
          aria-busy={loading || undefined}
          aria-activedescendant={rendered ? rowId(index) : undefined}
          onKeyDown={onKey}
          onScroll={(e) => {
            const el = e.currentTarget;
            setTop(el.scrollTop);
            const bottom =
              el.scrollTop + el.clientHeight >= el.scrollHeight - ROW / 2;
            if (bottom && !following && current === null) resume();
            else if (!bottom) pause();
          }}
        >
          {loading ? (
            <div className="mizu-log-skeleton" aria-hidden="true">
              {[62, 80, 45, 70, 58, 76, 40, 66].map((w, i) => (
                <span key={i} style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : !lines.length ? (
            <p className="mizu-log-note">{empty}</p>
          ) : !shown.length ? (
            <p className="mizu-log-note">No lines at these levels.</p>
          ) : (
            <div style={{ height: shown.length * ROW, position: "relative" }}>
              {height > 0 &&
                shown.slice(first, last).map((l, k) => {
                  const i = first + k;
                  return (
                    <div
                      key={l.id}
                      id={rowId(i)}
                      role="option"
                      aria-selected={i === index}
                      aria-setsize={shown.length}
                      aria-posinset={i + 1}
                      className="mizu-log-row"
                      data-level={l.level}
                      data-fresh={fresh.has(l.id) || undefined}
                      data-current-match={i === matchAt || undefined}
                      style={{ top: i * ROW }}
                      onClick={() => {
                        setCurrent(l.id === current ? null : l.id);
                        pause();
                      }}
                    >
                      <time dateTime={new Date(l.time).toISOString()}>
                        {stamp(l.time, utc)}
                      </time>
                      <b>{l.level}</b>
                      <span className="mizu-log-source">
                        {marked(l.source ?? "", query.trim())}
                      </span>
                      <span>{marked(l.message, query.trim())}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        <AnimatePresence>
          {unseen > 0 && (
            <motion.button
              type="button"
              className="mizu-log-pill"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              onClick={() => {
                setCurrent(null);
                resume();
              }}
            >
              ↓ {unseen} new {unseen === 1 ? "line" : "lines"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {line && height > 0 && (
        <div className="mizu-log-detail" data-level={line.level}>
          <p className="mizu-log-detail-head">
            <b>{line.level}</b>
            <time dateTime={new Date(line.time).toISOString()}>
              {stamp(line.time, utc)}
            </time>
            {line.source && <span>{line.source}</span>}
            <span>
              line {index + 1} of {shown.length}
            </span>
            <button type="button" onClick={() => setCurrent(null)}>
              Close
            </button>
          </p>
          <pre>{marked(line.message, query.trim())}</pre>
          {line.fields && Object.keys(line.fields).length > 0 && (
            <DescriptionList
              items={Object.entries(line.fields).map(([k, v]) => ({
                label: k,
                value: String(v),
              }))}
            />
          )}
        </div>
      )}
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </section>
  );
}
