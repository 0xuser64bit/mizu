type Unit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";
type Step = { unit: Unit; n: number; ms: number };
export type Tick = { t: number; label: string; major: boolean };

const S = 1e3,
  M = 6e4,
  H = 36e5,
  D = 864e5;
const MONDAY = Date.UTC(1970, 0, 5);
const UNIT_MS: Record<Unit, number> = {
  second: S,
  minute: M,
  hour: H,
  day: D,
  week: 7 * D,
  month: 30.44 * D,
  year: 365.25 * D,
};
const STEPS: Step[] = (
  [
    ["second", [1, 2, 5, 10, 15, 30]],
    ["minute", [1, 2, 5, 10, 15, 30]],
    ["hour", [1, 2, 3, 6, 12]],
    ["day", [1, 2]],
    ["week", [1, 2]],
    ["month", [1, 3, 6]],
    ["year", [1, 2, 5, 10, 25, 50, 100]],
  ] as const
).flatMap(([unit, ns]) => ns.map((n) => ({ unit, n, ms: n * UNIT_MS[unit] })));

function floor(t: number, { unit, n }: Step, utc: boolean) {
  const d = new Date(t);
  const get = (
    part:
      "FullYear" | "Month" | "Date" | "Day" | "Hours" | "Minutes" | "Seconds",
  ) => d[`get${utc ? "UTC" : ""}${part}`]();
  const set = (
    part:
      | "FullYear"
      | "Month"
      | "Date"
      | "Hours"
      | "Minutes"
      | "Seconds"
      | "Milliseconds",
    v: number,
  ) => d[`set${utc ? "UTC" : ""}${part}`](v);
  set("Milliseconds", 0);
  if (unit === "second")
    return set("Seconds", Math.floor(get("Seconds") / n) * n);
  set("Seconds", 0);
  if (unit === "minute")
    return set("Minutes", Math.floor(get("Minutes") / n) * n);
  set("Minutes", 0);
  if (unit === "hour") return set("Hours", Math.floor(get("Hours") / n) * n);
  set("Hours", 0);
  if (unit === "day" || unit === "week") {
    // Count whole days from a Monday epoch so multi-day steps stay put while panning.
    if (unit === "week") set("Date", get("Date") - ((get("Day") + 6) % 7));
    const days = Math.round(
      (d.getTime() - (utc ? MONDAY : MONDAY + d.getTimezoneOffset() * M)) / D,
    );
    const size = unit === "week" ? 7 * n : n;
    return set("Date", get("Date") - (((days % size) + size) % size));
  }
  set("Date", 1);
  if (unit === "month") return set("Month", Math.floor(get("Month") / n) * n);
  set("Month", 0);
  return set("FullYear", Math.floor(get("FullYear") / n) * n);
}

function add(t: number, { unit, n }: Step, utc: boolean) {
  if (unit !== "month" && unit !== "year" && unit !== "day" && unit !== "week")
    return t + n * UNIT_MS[unit];
  const d = new Date(t);
  const p = utc ? "UTC" : "";
  if (unit === "day" || unit === "week")
    d[`set${p}Date`](d[`get${p}Date`]() + n * (unit === "week" ? 7 : 1));
  else if (unit === "month") d[`set${p}Month`](d[`get${p}Month`]() + n);
  else d[`set${p}FullYear`](d[`get${p}FullYear`]() + n);
  return d.getTime();
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function format(t: number, options: Intl.DateTimeFormatOptions, utc: boolean) {
  const key = JSON.stringify(options) + utc;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", {
      ...options,
      timeZone: utc ? "UTC" : undefined,
    });
    formatters.set(key, f);
  }
  return f.format(t);
}

const isMidnight = (t: number, utc: boolean) => {
  const d = new Date(t);
  return utc
    ? d.getUTCHours() + d.getUTCMinutes() + d.getUTCSeconds() === 0
    : d.getHours() + d.getMinutes() + d.getSeconds() === 0;
};

function label(t: number, unit: Unit, utc: boolean) {
  if ((unit === "hour" || unit === "minute") && isMidnight(t, utc))
    return format(t, { weekday: "short", day: "numeric" }, utc);
  switch (unit) {
    case "second":
      return format(
        t,
        { hour: "2-digit", minute: "2-digit", second: "2-digit" },
        utc,
      );
    case "minute":
    case "hour":
      return format(t, { hour: "2-digit", minute: "2-digit" }, utc);
    case "day":
      return format(t, { weekday: "short", day: "numeric" }, utc);
    case "week":
      return format(t, { day: "numeric", month: "short" }, utc);
    case "month":
      return new Date(t)[utc ? "getUTCMonth" : "getMonth"]() === 0
        ? format(t, { year: "numeric" }, utc)
        : format(t, { month: "short" }, utc);
    default:
      return format(t, { year: "numeric" }, utc);
  }
}

/**
 * Calendar-aligned ticks for a visible interval. Majors keep at least
 * `spacing` pixels apart; minors subdivide them when there is room.
 */
export function timeTicks(
  start: number,
  end: number,
  width: number,
  { spacing = 88, utc = false } = {},
): { ticks: Tick[]; context: string } {
  const span = end - start;
  if (!(span > 0) || !(width > 0)) return { ticks: [], context: "" };
  const need = (spacing / width) * span;
  const index = STEPS.findIndex((s) => s.ms >= need);
  const step = STEPS[index === -1 ? STEPS.length - 1 : index]!;
  const minor = STEPS.slice(0, Math.max(0, STEPS.indexOf(step)))
    .reverse()
    .find(
      (s) =>
        (s.ms / span) * width >= 10 &&
        (step.unit === s.unit
          ? step.n % s.n === 0
          : s.unit !== "week" || step.unit === "month"),
    );
  const ticks: Tick[] = [];
  const guard = 400;
  for (
    let t = floor(start, step, utc), i = 0;
    t <= end && i < guard;
    t = add(t, step, utc), i++
  )
    if (t >= start)
      ticks.push({ t, label: label(t, step.unit, utc), major: true });
  if (minor && ticks.length < 60) {
    const majors = new Set(ticks.map((k) => k.t));
    for (
      let t = floor(start, minor, utc), i = 0;
      t <= end && i < guard;
      t = add(t, minor, utc), i++
    )
      if (t >= start && !majors.has(t))
        ticks.push({ t, label: "", major: false });
  }
  const context =
    step.ms < D
      ? format(start, { day: "numeric", month: "short", year: "numeric" }, utc)
      : step.ms < UNIT_MS.month
        ? format(start, { month: "long", year: "numeric" }, utc)
        : "";
  return { ticks, context };
}

/** Round, readable numeric ticks covering [min, max]. */
export function numberTicks(min: number, max: number, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
  if (min === max) {
    const pad = Math.abs(min) || 1;
    min -= pad;
    max += pad;
  }
  const raw = (max - min) / Math.max(1, count);
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * power >= raw) ?? 10) * power;
  const ticks: number[] = [];
  for (let v = Math.floor(min / step) * step; v <= max + step * 1e-9; v += step)
    ticks.push(Number(v.toPrecision(12)));
  if (ticks[ticks.length - 1]! < max)
    ticks.push(Number((ticks[ticks.length - 1]! + step).toPrecision(12)));
  return ticks;
}

export function formatDuration(ms: number) {
  if (!Number.isFinite(ms)) return "—";
  const abs = Math.abs(ms),
    sign = ms < 0 ? "−" : "";
  if (abs < S) return `${sign}${Math.round(abs)}ms`;
  if (abs < M) return `${sign}${(abs / S).toFixed(abs < 10 * S ? 1 : 0)}s`;
  if (abs < H)
    return `${sign}${Math.floor(abs / M)}m ${String(Math.floor((abs % M) / S)).padStart(2, "0")}s`;
  if (abs < D)
    return `${sign}${Math.floor(abs / H)}h ${String(Math.floor((abs % H) / M)).padStart(2, "0")}m`;
  return `${sign}${Math.floor(abs / D)}d ${Math.floor((abs % D) / H)}h`;
}

/** Media clock: m:ss, or h:mm:ss past an hour. */
export function formatClock(seconds: number) {
  const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

/** A precise stamp for readouts and announcements. */
export function formatStamp(t: number, span: number, utc = false) {
  return span < 2 * M
    ? format(t, { hour: "2-digit", minute: "2-digit", second: "2-digit" }, utc)
    : span < 2 * D
      ? format(t, { hour: "2-digit", minute: "2-digit" }, utc)
      : span < 400 * D
        ? format(
            t,
            {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            },
            utc,
          )
        : format(t, { day: "numeric", month: "short", year: "numeric" }, utc);
}
