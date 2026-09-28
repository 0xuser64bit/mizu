"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Chronicle,
  LogStream,
  SplitFlap,
  Stat,
  TrendChart,
  type ChronicleEvent,
  type ChronicleLane,
  type Interval,
  type LogLine,
  type TrendAnnotation,
} from "@/mizu";
import {
  HARBOUR_START,
  harbourMetrics,
  harbourReplay,
} from "@/components/docs/demos/signature/harbour";

// An invented incident, told by the same invented service's own logs.
const LINES = harbourReplay();
const METRICS = harbourMetrics(LINES);
const at = (minute: number, second = 0) =>
  HARBOUR_START + minute * 60_000 + second * 1000;
const LANES: ChronicleLane[] = [
  { id: "deploys", label: "Deploys" },
  { id: "alerts", label: "Alerts" },
  { id: "people", label: "Response" },
  { id: "status", label: "Status page" },
];
const EVENTS: ChronicleEvent[] = [
  {
    id: "deploy",
    lane: "deploys",
    start: at(24, 40),
    end: at(26, 10),
    label: "Deploy api v2.14",
    tone: "accent",
    detail:
      "Rolled out to all three regions. Among other changes, it lowered the tide-db connection pool from 40 to 8.",
  },
  {
    id: "rollback",
    lane: "deploys",
    start: at(33, 30),
    end: at(34, 50),
    label: "Roll back to v2.13",
    tone: "success",
    detail: "Pool restored to 40. Error rate began to fall within a minute.",
  },
  {
    id: "errors",
    lane: "alerts",
    start: at(27, 5),
    end: at(36, 20),
    label: "Error rate above 5%",
    tone: "danger",
  },
  {
    id: "latency",
    lane: "alerts",
    start: at(28, 10),
    end: at(35, 40),
    label: "p95 latency above 1 s",
    tone: "warning",
  },
  {
    id: "paged",
    lane: "people",
    start: at(27, 30),
    label: "Mei paged",
    tone: "neutral",
    detail: "On call for harbour-api.",
  },
  {
    id: "declared",
    lane: "people",
    start: at(29, 50),
    label: "SEV-2 declared",
    tone: "danger",
  },
  {
    id: "suspect",
    lane: "people",
    start: at(31, 20),
    label: "Kofi suspects the pool",
    tone: "neutral",
    detail:
      "Connection resets from tide-db began seconds after the deploy finished.",
  },
  {
    id: "decision",
    lane: "people",
    start: at(33, 10),
    label: "Decision: roll back",
    tone: "accent",
  },
  {
    id: "clear",
    lane: "people",
    start: at(40),
    label: "All clear",
    tone: "success",
  },
  {
    id: "degraded",
    lane: "status",
    start: at(30, 30),
    end: at(41),
    label: "Degraded: berth schedules",
    tone: "warning",
  },
];
const MARKS: TrendAnnotation[] = [
  { id: "deploy", x: at(24, 40), label: "v2.14 out" },
  { id: "rollback", x: at(33, 30), label: "Rolled back" },
];
const peak = Math.max(...METRICS.errors.map((p) => p.y ?? 0));
const failed = LINES.filter(
  (l) => l.level === "error" && l.time >= at(24, 40) && l.time <= at(40),
).length;

const clock = (t: number) => new Date(t).toISOString().slice(11, 19);
const nearest = (t: number, lines: readonly LogLine[]) => {
  let best: LogLine | undefined;
  for (const l of lines)
    if (!best || Math.abs(l.time - t) < Math.abs(best.time - t)) best = l;
  return best;
};
const eventTime = (e: ChronicleEvent) => Number(e.start);
const MOMENTS = [...EVENTS].sort((a, b) => eventTime(a) - eventTime(b));

export function IncidentReview() {
  const [range, setRange] = useState<Interval>([at(18), at(46)]);
  const [focus, setFocus] = useState(at(31, 20));
  const [hover, setHover] = useState<number | null>(null);
  const [event, setEvent] = useState<string | null>("suspect");
  const visible = useMemo(
    () => LINES.filter((l) => l.time >= range[0] && l.time <= range[1]),
    [range],
  );
  const [line, setLine] = useState<LogLine["id"] | null>(
    () => nearest(at(31, 20), LINES)?.id ?? null,
  );

  // One moment under investigation, set from any of the three views.
  const moveTo = (t: number, from?: "log") => {
    setFocus(t);
    if (from !== "log") setLine(nearest(t, visible)?.id ?? null);
  };
  const happening = EVENTS.filter((e) => {
    const start = eventTime(e),
      end = e.end === undefined ? start + 90_000 : Number(e.end);
    return focus >= start - 30_000 && focus <= end;
  });
  const minute = Math.floor(focus / 60_000) * 60_000;
  const rate = METRICS.errors.find((p) => p.x === minute)?.y;
  const p95 = METRICS.p95.find((p) => p.x === minute)?.y;
  const step = (direction: 1 | -1) => {
    const next =
      direction > 0
        ? MOMENTS.find((e) => eventTime(e) > focus + 1000)
        : [...MOMENTS].reverse().find((e) => eventTime(e) < focus - 1000);
    if (!next) return;
    setEvent(next.id);
    moveTo(eventTime(next));
  };

  return (
    <div className="mizu-incident">
      <div className="mizu-incident-stats">
        <Stat label="Impact" value="10 min" detail="Declared to all clear" />
        <Stat
          label="Peak error rate"
          value={`${peak}%`}
          detail="Per minute, from the logs"
        />
        <Stat
          label="Failed requests"
          value={failed.toLocaleString("en-GB")}
          detail="Deploy to all clear"
        />
        <Stat
          label="Lines in view"
          value={visible.length.toLocaleString("en-GB")}
          detail="Follows the zoom"
        />
      </div>

      <Chronicle
        label="Incident timeline"
        events={EVENTS}
        lanes={LANES}
        range={range}
        onRangeChange={setRange}
        cursor={focus}
        onCursorChange={(t) => moveTo(t)}
        selected={event}
        onSelectedChange={(id) => {
          setEvent(id);
          const e = EVENTS.find((x) => x.id === id);
          if (e) moveTo(eventTime(e));
        }}
        utc
        minSpan={120_000}
      />

      <div className="mizu-incident-grid">
        <div className="mizu-incident-charts">
          <TrendChart
            label="Error rate"
            series={[
              {
                id: "errors",
                label: "Error rate",
                data: METRICS.errors,
                tone: "danger",
                area: true,
              },
            ]}
            format={(v) => `${v}%`}
            annotations={MARKS}
            thresholds={[{ y: 5, label: "Alert at 5%", tone: "danger" }]}
            range={range}
            onRangeChange={setRange}
            cursor={hover ?? focus}
            onCursorChange={setHover}
            utc
            height={150}
          />
          <TrendChart
            label="p95 latency"
            series={[
              {
                id: "p95",
                label: "p95 latency",
                data: METRICS.p95,
                tone: "warning",
              },
            ]}
            format={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`
            }
            thresholds={[{ y: 1000, label: "Alert at 1 s", tone: "warning" }]}
            range={range}
            onRangeChange={setRange}
            cursor={hover ?? focus}
            onCursorChange={setHover}
            utc
            height={150}
          />
        </div>
        <aside className="mizu-incident-focus" aria-label="The moment in focus">
          <p className="mizu-incident-label">In focus · UTC</p>
          <SplitFlap
            value={clock(focus)}
            label="Time in focus"
            stagger={18}
            style={{ ["--mizu-flap-size" as string]: "30px" }}
          />
          <dl className="mizu-incident-now">
            <div>
              <dt>Error rate</dt>
              <dd>{rate === undefined || rate === null ? "—" : `${rate}%`}</dd>
            </div>
            <div>
              <dt>p95 latency</dt>
              <dd>{p95 === undefined || p95 === null ? "—" : `${p95} ms`}</dd>
            </div>
          </dl>
          <ul className="mizu-incident-happening" aria-label="Happening then">
            {happening.length ? (
              happening.map((e) => (
                <li key={e.id} data-tone={e.tone}>
                  <Badge tone="line">
                    {LANES.find((l) => l.id === e.lane)?.label}
                  </Badge>
                  {e.label}
                </li>
              ))
            ) : (
              <li>Nothing else was happening.</li>
            )}
          </ul>
          <div className="mizu-showcase-actions">
            <Button
              variant="ghost"
              size="sm"
              arrow={false}
              onClick={() => step(-1)}
            >
              ← Previous moment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              arrow={false}
              onClick={() => step(1)}
            >
              Next moment →
            </Button>
          </div>
        </aside>
      </div>

      <LogStream
        label="harbour-api logs in view"
        lines={visible}
        utc
        selected={line}
        onSelectedChange={(id) => {
          setLine(id);
          const l = visible.find((x) => x.id === id);
          if (l) moveTo(l.time, "log");
        }}
        style={{ ["--mizu-log-height" as string]: "300px" }}
      />
    </div>
  );
}
