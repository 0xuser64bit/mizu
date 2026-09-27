"use client";
// Generated from catalog usage by bun run examples:sync.
import { Chronicle, TrendChart, Waveform } from "@/mizu";

export function ChronicleDemo() {
  const at = (h: number, m: number) => Date.UTC(2026, 8, 27, h, m);
  return (
    <Chronicle
      label="Checkout incident"
      utc
      lanes={[
        { id: "deploys", label: "Deploys" },
        { id: "api", label: "API" },
        { id: "alerts", label: "Alerts" },
      ]}
      events={[
        {
          id: "deploy",
          lane: "deploys",
          start: at(14, 2),
          label: "Deploy v2.41",
          tone: "accent",
          detail: "Canary promoted to every region.",
        },
        {
          id: "latency",
          lane: "api",
          start: at(14, 6),
          end: at(14, 31),
          label: "p95 above 2s",
          tone: "danger",
        },
        {
          id: "page",
          lane: "alerts",
          start: at(14, 9),
          label: "On-call paged",
          tone: "warning",
        },
        {
          id: "rollback",
          lane: "deploys",
          start: at(14, 24),
          label: "Rollback",
          tone: "success",
        },
      ]}
    />
  );
}

export function TrendChartDemo() {
  const day = (d: number) => Date.UTC(2026, 8, d);
  return (
    <TrendChart
      label="Weekly active teams"
      utc
      series={[
        {
          id: "teams",
          label: "Teams",
          area: true,
          data: [
            { x: day(1), y: 412 },
            { x: day(2), y: 436 },
            { x: day(3), y: 431 },
            { x: day(4), y: 478 },
            { x: day(5), y: 502 },
            { x: day(6), y: 497 },
            { x: day(7), y: 540 },
          ],
        },
      ]}
    />
  );
}

export function WaveformDemo() {
  return (
    <Waveform src="/audio/calibration.wav" label="Calibration tone, 440 Hz" />
  );
}
