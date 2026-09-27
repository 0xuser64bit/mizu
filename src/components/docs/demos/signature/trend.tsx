"use client";

import { useState } from "react";
import { TrendChart, type TrendDomain, type TrendSeries } from "@/mizu";
import { Scenarios, seeded } from "./shared";

const MIN = 6e4;
const START = Date.UTC(2026, 8, 27, 12, 0);
const at = (h: number, m: number) => Date.UTC(2026, 8, 27, h, m);

// Illustrative readings: a quiet afternoon, then retries swamp the database from 14:03 to 14:34.
const INCIDENT = (() => {
  const random = seeded(7);
  const p50: { x: number; y: number }[] = [],
    p95: { x: number; y: number }[] = [],
    lastWeek: { x: number; y: number }[] = [],
    errors: { x: number; y: number }[] = [];
  for (let i = 0; i <= 240; i++) {
    const x = START + i * MIN;
    const t = (x - at(14, 3)) / (31 * MIN);
    const surge =
      t > 0 && t < 1
        ? Math.sin(Math.PI * Math.min(1, t * 1.6)) *
          (t < 0.7 ? 1 : (1 - t) / 0.3)
        : 0;
    const wobble = Math.sin(i / 9) * 0.08 + (random() - 0.5) * 0.12;
    p50.push({ x, y: Math.round(118 * (1 + wobble) + surge * 480) });
    p95.push({ x, y: Math.round(340 * (1 + wobble * 1.4) + surge * 2050) });
    lastWeek.push({
      x,
      y: Math.round(
        355 * (1 + Math.sin(i / 11) * 0.09 + (random() - 0.5) * 0.1),
      ),
    });
    errors.push({
      x,
      y: Math.max(0, +(0.18 + (random() - 0.5) * 0.1 + surge * 4).toFixed(2)),
    });
  }
  return { p50, p95, lastWeek, errors };
})();

const LATENCY: TrendSeries[] = [
  { id: "p95", label: "p95", data: INCIDENT.p95, tone: "accent", area: true },
  { id: "p50", label: "p50", data: INCIDENT.p50, tone: "paper" },
  {
    id: "week",
    label: "p95 last week",
    data: INCIDENT.lastWeek,
    tone: "muted",
    dashed: true,
  },
];
const ERRORS: TrendSeries[] = [
  {
    id: "5xx",
    label: "5xx rate",
    data: INCIDENT.errors,
    tone: "danger",
    area: true,
  },
];

const TRAFFIC: TrendSeries[] = (() => {
  const random = seeded(90);
  const day = 864e5,
    start = Date.UTC(2026, 5, 30);
  const visits: { x: number; y: number | null }[] = [],
    previous: { x: number; y: number }[] = [];
  for (let d = 0; d < 90; d++) {
    const x = start + d * day;
    const weekend = [0, 6].includes(new Date(x).getUTCDay());
    const base = weekend ? 21000 : 34000;
    visits.push({
      x,
      y:
        d === 61
          ? null
          : Math.round(base * (1 + d / 140) * (0.92 + random() * 0.16)),
    });
    previous.push({
      x,
      y: Math.round(base * 0.82 * (1 + d / 260) * (0.93 + random() * 0.14)),
    });
  }
  return [
    { id: "visits", label: "Visits", data: visits, tone: "accent", area: true },
    {
      id: "previous",
      label: "Previous 90 days",
      data: previous,
      tone: "muted",
      dashed: true,
    },
  ];
})();

const DENSE: TrendSeries[] = (() => {
  const random = seeded(3);
  const points: { x: number; y: number }[] = [];
  let v = 50;
  for (let i = 0; i < 20000; i++) {
    v += (random() - 0.5) * 2.4 + (50 - v) * 0.002;
    points.push({ x: START + i * 1000, y: +v.toFixed(2) });
  }
  return [{ id: "sensor", label: "Sensor", data: points, tone: "accent" }];
})();

type Scenario = "incident" | "traffic" | "dense" | "loading" | "empty";

export function TrendChartShowcase() {
  const [scenario, setScenario] = useState<Scenario>("incident");
  const [cursor, setCursor] = useState<number | null>(null);
  const [domain, setDomain] = useState<TrendDomain | undefined>(undefined);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Scenario"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setCursor(null);
          setDomain(undefined);
        }}
        options={[
          { value: "incident", label: "Linked incident" },
          { value: "traffic", label: "90 days" },
          { value: "dense", label: "20,000 readings" },
          { value: "loading", label: "Loading" },
          { value: "empty", label: "Empty" },
        ]}
        note="Illustrative data. Hover or use arrow keys to read; drag to measure a period; Ctrl-scroll to zoom."
      />
      {scenario === "incident" ? (
        <>
          <TrendChart
            label="Checkout latency"
            series={LATENCY}
            utc
            format={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${Math.round(v)}ms`
            }
            thresholds={[{ y: 800, label: "SLO 800ms", tone: "warning" }]}
            annotations={[
              {
                id: "deploy",
                x: at(13, 58),
                label: "Deploy v2.41 reached every region",
                detail:
                  "Payment retries were enabled without a jittered backoff.",
              },
              {
                id: "rollback",
                x: at(14, 24),
                label: "Rollback to v2.40 began",
                detail: "Two waves; latency recovered within ten minutes.",
              },
            ]}
            cursor={cursor}
            onCursorChange={setCursor}
            domain={domain}
            onDomainChange={setDomain}
          />
          <TrendChart
            label="Error rate"
            series={ERRORS}
            utc
            height={180}
            format={(v) => `${v.toFixed(1)}%`}
            cursor={cursor}
            onCursorChange={setCursor}
            domain={domain}
            onDomainChange={setDomain}
          />
        </>
      ) : scenario === "traffic" ? (
        <TrendChart
          key="traffic"
          label="Daily visits"
          series={TRAFFIC}
          utc
          annotations={[
            {
              id: "outage",
              x: Date.UTC(2026, 7, 30),
              label: "Analytics outage — no data recorded",
            },
          ]}
        />
      ) : scenario === "dense" ? (
        <TrendChart
          key="dense"
          label="Sensor, one reading per second"
          series={DENSE}
          utc
          format={(v) => v.toFixed(1)}
        />
      ) : (
        <TrendChart
          key={scenario}
          label="Queue depth"
          series={
            scenario === "loading"
              ? []
              : [{ id: "q", label: "Depth", data: [] }]
          }
          loading={scenario === "loading"}
        />
      )}
    </div>
  );
}
