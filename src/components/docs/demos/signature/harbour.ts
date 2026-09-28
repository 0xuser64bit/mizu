import type { LogLine, TrendPoint } from "@/mizu";
import { seeded } from "./shared";

/*
 * An invented harbour service shared by the LogStream showcase and the
 * incident review: requests, jobs and the occasional bad minute.
 */
const ROUTES = [
  "/berths",
  "/tides/today",
  "/vessels/:id",
  "/auth/session",
  "/radio/log",
];
const USERS = ["harbourmaster", "pilot-7", "crane-ops", "visitor"];

/** One log line; `trouble` from 0 to 1 raises the share of errors and the latency. */
export function harbourLine(
  rand: () => number,
  id: number,
  time: number,
  trouble: number,
): LogLine {
  const pick = <T>(list: readonly T[]) =>
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

/** 09:00 UTC on 14 September 2026, when the replayed hour begins. */
export const HARBOUR_START = Date.UTC(2026, 8, 14, 9, 0, 0);

/** A fixed hour of history, with a bad ten minutes from 09:26. */
export function harbourReplay(): LogLine[] {
  const rand = seeded(42),
    start = HARBOUR_START,
    out: LogLine[] = [];
  let t = start;
  for (let id = 0; id < 2400; id++) {
    const minute = (t - start) / 60000;
    const trouble =
      minute > 26 && minute < 36 ? 1 - Math.abs(minute - 31) / 5 : 0;
    t += 400 + rand() * 2400 * (1 - trouble * 0.7);
    out.push(harbourLine(rand, id, Math.round(t), trouble));
  }
  return out;
}

/** Per-minute error rate (%) and p95 latency (ms), derived from the lines themselves. */
export function harbourMetrics(lines: readonly LogLine[]) {
  const minutes = new Map<
    number,
    { total: number; errors: number; ms: number[] }
  >();
  for (const l of lines) {
    const m = Math.floor(l.time / 60000) * 60000;
    const bucket = minutes.get(m) ?? { total: 0, errors: 0, ms: [] };
    bucket.total++;
    if (l.level === "error") bucket.errors++;
    const ms = l.fields?.duration_ms;
    if (typeof ms === "number") bucket.ms.push(ms);
    minutes.set(m, bucket);
  }
  const errors: TrendPoint[] = [],
    p95: TrendPoint[] = [];
  for (const [x, b] of [...minutes].sort((a, b) => a[0] - b[0])) {
    errors.push({ x, y: Math.round((b.errors / b.total) * 1000) / 10 });
    const sorted = b.ms.sort((a, c) => a - c);
    p95.push({
      x,
      y: sorted.length ? sorted[Math.floor(sorted.length * 0.95)]! : null,
    });
  }
  return { errors, p95 };
}
