"use client";

import { useEffect, useRef, useState } from "react";
import { LogStream, SegmentedControl, type LogLine } from "@/mizu";
import { Scenarios, seeded } from "./shared";

type Scenario = "live" | "replay" | "loading" | "empty";
type Rate = "calm" | "busy" | "incident";

const ROUTES = [
  "/berths",
  "/tides/today",
  "/vessels/:id",
  "/auth/session",
  "/radio/log",
];
const USERS = ["harbourmaster", "pilot-7", "crane-ops", "visitor"];

/** An invented harbour service: requests, jobs and the occasional bad minute. */
function line(
  rand: () => number,
  id: number,
  time: number,
  trouble: number,
): LogLine {
  const pick = <T,>(list: readonly T[]) =>
    list[Math.floor(rand() * list.length)]!;
  const route = pick(ROUTES),
    ms = Math.round(20 + rand() ** 3 * 900 * (1 + trouble * 3));
  const roll = rand();
  const request = `req_${(id * 7919).toString(36).slice(-6)}`;
  if (roll < 0.02 + trouble * 0.18)
    return {
      id,
      time,
      level: "error",
      source: pick(["api", "db", "worker"]),
      message:
        rand() < 0.5
          ? `GET ${route} → 503 upstream timed out after ${ms * 4} ms`
          : `berth-sync job failed: connection reset by tide-db (attempt ${1 + Math.floor(rand() * 3)} of 3)`,
      fields: { request_id: request, route, status: 503, duration_ms: ms * 4 },
    };
  if (roll < 0.09 + trouble * 0.25)
    return {
      id,
      time,
      level: "warn",
      source: pick(["db", "cache", "api"]),
      message:
        rand() < 0.5
          ? `slow query on vessels (${ms} ms) — consider an index on eta`
          : `cache miss storm on ${route}: ${Math.round(40 + rand() * 60)}% misses`,
      fields: { request_id: request, route, duration_ms: ms },
    };
  if (roll < 0.25)
    return {
      id,
      time,
      level: "debug",
      source: pick(["cache", "auth", "worker"]),
      message: `cache ${rand() < 0.7 ? "hit" : "miss"} tides:${new Date(time).toISOString().slice(0, 10)}`,
    };
  return {
    id,
    time,
    level: "info",
    source: pick(["api", "api", "auth", "worker"]),
    message: `GET ${route} → 200 in ${ms} ms (${pick(USERS)})`,
    fields: {
      request_id: request,
      route,
      status: 200,
      duration_ms: ms,
      user: pick(USERS),
    },
  };
}

// A fixed hour of history with a bad ten minutes in the middle.
function replay(): LogLine[] {
  const rand = seeded(42),
    start = Date.UTC(2026, 8, 14, 9, 0, 0),
    out: LogLine[] = [];
  let t = start;
  for (let id = 0; id < 2400; id++) {
    const minute = (t - start) / 60000;
    const trouble =
      minute > 26 && minute < 36 ? 1 - Math.abs(minute - 31) / 5 : 0;
    t += 400 + rand() * 2400 * (1 - trouble * 0.7);
    out.push(line(rand, id, Math.round(t), trouble));
  }
  return out;
}
const REPLAY = replay();
const KEEP = 2000;
const TROUBLE: Record<Rate, number> = { calm: 0, busy: 0.15, incident: 0.8 };
const EVERY: Record<Rate, number> = { calm: 700, busy: 180, incident: 90 };

function Live() {
  const [rate, setRate] = useState<Rate>("calm");
  const [lines, setLines] = useState<LogLine[]>([]);
  const nextRef = useRef(0);
  const randRef = useRef(seeded(7));
  useEffect(() => {
    const tick = setInterval(() => {
      const burst =
        1 + Math.floor(randRef.current() * (rate === "calm" ? 1.4 : 3));
      const fresh = Array.from({ length: burst }, () =>
        line(randRef.current, nextRef.current++, Date.now(), TROUBLE[rate]),
      );
      // Keep a bounded window, as a real tail would.
      setLines((l) => [...l, ...fresh].slice(-KEEP));
    }, EVERY[rate]);
    return () => clearInterval(tick);
  }, [rate]);
  return (
    <>
      <LogStream
        label="harbour-api"
        lines={lines}
        empty="Waiting for the first line…"
      />
      <div className="mizu-showcase-readout">
        <span>Source rate · keeps the last {KEEP} lines</span>
        <SegmentedControl
          label="Rate"
          value={rate}
          onValueChange={(v) => setRate(v as Rate)}
          options={[
            { value: "calm", label: "Calm" },
            { value: "busy", label: "Busy" },
            { value: "incident", label: "Incident" },
          ]}
        />
        <output>{lines.length} lines</output>
      </div>
    </>
  );
}

export function LogStreamShowcase() {
  const [scenario, setScenario] = useState<Scenario>("live");
  const [picked, setPicked] = useState<LogLine["id"] | null>(null);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Source"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setPicked(null);
        }}
        options={[
          { value: "live", label: "Live tail" },
          { value: "replay", label: "Incident replay" },
          { value: "loading", label: "Loading" },
          { value: "empty", label: "Empty" },
        ]}
        note="It follows new lines until you scroll up, then counts what you missed. Filter by level, search with Enter to step through matches, and pick a line to read it whole. The overview above the lines is clickable. The service is invented."
      />
      {scenario === "live" ? (
        <Live />
      ) : scenario === "replay" ? (
        <>
          <LogStream
            label="harbour-api, 14 Sep 09:00–10:00 UTC"
            lines={REPLAY}
            utc
            selected={picked}
            onSelectedChange={setPicked}
          />
          <p className="mizu-showcase-readout">
            <span>selected · onSelectedChange</span>
            {picked === null ? "No line selected" : `Line ${picked}`}
          </p>
        </>
      ) : (
        <LogStream
          key={scenario}
          label="harbour-api"
          lines={[]}
          loading={scenario === "loading"}
          empty="No lines in this window."
        />
      )}
    </div>
  );
}
