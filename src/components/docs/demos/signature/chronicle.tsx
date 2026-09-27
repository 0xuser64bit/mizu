"use client";

import { useState } from "react";
import { Chronicle, type ChronicleEvent, type ChronicleLane } from "@/mizu";
import { Scenarios, seeded } from "./shared";

const at = (h: number, m: number, s = 0) => Date.UTC(2026, 8, 27, h, m, s);

const INCIDENT_LANES: ChronicleLane[] = [
  { id: "deploys", label: "Deploys" },
  { id: "api", label: "Checkout API" },
  { id: "db", label: "Database" },
  { id: "alerts", label: "Alerts" },
  { id: "people", label: "Responders" },
];
const INCIDENT: ChronicleEvent[] = [
  {
    id: "canary",
    lane: "deploys",
    start: at(13, 40),
    end: at(13, 58),
    label: "Canary 10%",
  },
  {
    id: "deploy",
    lane: "deploys",
    start: at(13, 58),
    label: "Deploy v2.41",
    tone: "accent",
    detail:
      "Promoted the payment-retry change from canary to every region after 18 quiet minutes.",
  },
  {
    id: "pool",
    lane: "db",
    start: at(14, 4),
    end: at(14, 22),
    label: "Connection pool saturated",
    tone: "warning",
  },
  {
    id: "errors",
    lane: "api",
    start: at(14, 3),
    end: at(14, 29),
    label: "5xx rate 4.2%",
    tone: "danger",
  },
  {
    id: "p95",
    lane: "api",
    start: at(14, 5),
    end: at(14, 34),
    label: "p95 above 2s",
    tone: "danger",
    detail:
      "Retries doubled the load on the primary database; checkout requests queued behind them.",
  },
  {
    id: "slo",
    lane: "alerts",
    start: at(14, 7),
    label: "SLO burn alert",
    tone: "danger",
  },
  {
    id: "page",
    lane: "alerts",
    start: at(14, 8),
    label: "On-call paged",
    tone: "warning",
  },
  { id: "ack", lane: "people", start: at(14, 10), label: "Acknowledged — Rin" },
  {
    id: "bridge",
    lane: "people",
    start: at(14, 12),
    end: at(14, 48),
    label: "Incident bridge",
  },
  {
    id: "status",
    lane: "people",
    start: at(14, 15),
    label: "Status: investigating",
    tone: "accent",
  },
  {
    id: "failover",
    lane: "db",
    start: at(14, 22),
    end: at(14, 26),
    label: "Replica failover",
    tone: "warning",
    detail:
      "Promoted replica b to primary while the pool drained. Twelve seconds of read-only mode.",
  },
  {
    id: "rollback",
    lane: "deploys",
    start: at(14, 24),
    label: "Rollback to v2.40",
    tone: "success",
    detail:
      "Rolled back in two waves. Error rate fell within four minutes of the first wave.",
  },
  {
    id: "recovery",
    lane: "api",
    start: at(14, 34),
    end: at(14, 52),
    label: "Budget recovering",
    tone: "success",
  },
  {
    id: "resolved",
    lane: "alerts",
    start: at(14, 52),
    label: "Resolved",
    tone: "success",
  },
  {
    id: "review",
    lane: "people",
    start: at(15, 30),
    label: "Review scheduled",
  },
];

const RELEASE_LANES: ChronicleLane[] = [
  { id: "web", label: "Web" },
  { id: "api", label: "API" },
  { id: "worker", label: "Workers" },
  { id: "policy", label: "Policy" },
];
const RELEASES: ChronicleEvent[] = (() => {
  const random = seeded(41);
  const day = 864e5,
    start = Date.UTC(2026, 7, 28);
  const events: ChronicleEvent[] = [
    {
      id: "freeze",
      lane: "policy",
      start: start + 12 * day,
      end: start + 16 * day,
      label: "Change freeze",
      tone: "warning",
    },
    {
      id: "audit",
      lane: "policy",
      start: start + 22 * day,
      end: start + 23.5 * day,
      label: "Security audit",
    },
  ];
  const versions: Record<string, number> = { web: 180, api: 38, worker: 12 };
  for (let d = 0; d < 30; d++) {
    if (d >= 12 && d < 16) continue;
    for (const lane of ["web", "api", "worker"]) {
      if (random() > (lane === "web" ? 0.62 : 0.38)) continue;
      const v = ++versions[lane]!;
      const rolledBack = random() > 0.9;
      events.push({
        id: `${lane}-${v}`,
        lane,
        start: start + d * day + (9 + random() * 8) * 36e5,
        label: `${lane === "web" ? "web" : lane} ${Math.floor(v / 10)}.${v % 10}`,
        tone: rolledBack ? "danger" : lane === "api" ? "accent" : "neutral",
        detail: rolledBack
          ? "Rolled back within the hour after a failed health check."
          : "Shipped through the standard pipeline: build, canary, promote.",
      });
    }
  }
  return events;
})();

type Scenario = "incident" | "releases" | "empty" | "loading";

export function ChronicleShowcase() {
  const [scenario, setScenario] = useState<Scenario>("incident");
  const [cursor, setCursor] = useState(at(14, 18));
  const [selected, setSelected] = useState<string | null>("p95");
  const events =
    scenario === "incident"
      ? INCIDENT
      : scenario === "releases"
        ? RELEASES
        : [];
  const active = INCIDENT.filter(
    (e) =>
      typeof e.end === "number" &&
      (e.start as number) <= cursor &&
      e.end >= cursor,
  );
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Scenario"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setSelected(v === "incident" ? "p95" : null);
        }}
        options={[
          { value: "incident", label: "Incident" },
          { value: "releases", label: "30 days of releases" },
          { value: "empty", label: "Empty" },
          { value: "loading", label: "Loading" },
        ]}
        note="Illustrative data. Drag to pan, pinch or Ctrl-scroll to zoom, and drag the diamond playhead."
      />
      <Chronicle
        key={scenario}
        label={
          scenario === "releases"
            ? "Release history"
            : "INC-4127 checkout latency"
        }
        lanes={scenario === "releases" ? RELEASE_LANES : INCIDENT_LANES}
        events={events}
        utc
        loading={scenario === "loading"}
        now={scenario === "releases" ? Date.UTC(2026, 8, 26, 12) : undefined}
        cursor={scenario === "incident" ? cursor : undefined}
        onCursorChange={setCursor}
        selected={selected}
        onSelectedChange={setSelected}
      />
      {scenario === "incident" && (
        <p className="mizu-showcase-readout" aria-live="polite">
          <span>Playhead drives this readout</span>
          {active.length
            ? active.map((e) => e.label).join(" · ")
            : "No ongoing spans at this moment"}
        </p>
      )}
    </div>
  );
}
