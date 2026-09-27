"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import {
  DataTable,
  DescriptionList,
  Stat,
  BarChart,
  Sparkline,
  Heatmap,
  Timeline,
  ActivityFeed,
  DiffView,
  DataInspector,
  TreeView,
  ComparisonTable,
} from "@/mizu";

export function DataTableDemo() {
  const rows = [
    { id: "a", name: "WaveText", size: 4.2 },
    { id: "b", name: "Button", size: 1.8 },
    { id: "c", name: "Signal", size: 3.1 },
  ];
  return (
    <DataTable
      label="Illustrative module records"
      rows={rows}
      getRowId={(r) => r.id}
      columns={[
        {
          id: "name",
          header: "Name",
          render: (r) => r.name,
          sortValue: (r) => r.name,
        },
        {
          id: "size",
          header: "Example KiB",
          render: (r) => r.size,
          sortValue: (r) => r.size,
          align: "right",
        },
      ]}
    />
  );
}

export function DescriptionListDemo() {
  return (
    <DescriptionList
      items={[
        { label: "Package", value: "mizu-ui" },
        { label: "License", value: "MIT" },
        { label: "Format", value: "ES modules" },
      ]}
    />
  );
}

export function StatDemo() {
  return (
    <Stat
      label="Illustrative build duration"
      value="1.2s"
      change={{
        value: "18% example decrease",
        direction: "down",
        favorable: true,
      }}
      detail="Synthetic readings, not a Mizu performance measurement."
    />
  );
}

export function BarChartDemo() {
  return (
    <BarChart
      label="Example counts by family"
      data={[
        { label: "Forms", value: 16 },
        { label: "Status", value: 12 },
        { label: "Motion", value: 9 },
      ]}
    />
  );
}

export function SparklineDemo() {
  return (
    <Sparkline
      label="Illustrative build duration in seconds"
      values={[4, 3, 3.6, 2.2, 2.8, 1.5, 1.2]}
    />
  );
}

export function HeatmapDemo() {
  const data = Array.from({ length: 70 }, (_, i) => ({
    date: `2026-${String(Math.floor(i / 28) + 7).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    value: (i * 7) % 11,
  }));
  return <Heatmap label="Illustrative workshop activity" data={data} />;
}

export function TimelineDemo() {
  return (
    <Timeline
      label="Illustrative release timeline"
      items={[
        {
          id: "a",
          title: "Foundations repaired",
          time: "Monday",
          state: "complete",
          body: "Keyboard and motion contracts checked.",
        },
        {
          id: "b",
          title: "Package validated",
          time: "Tuesday",
          state: "current",
          body: "Fresh tarball installation passed.",
        },
        {
          id: "c",
          title: "Release review",
          time: "Wednesday",
          state: "upcoming",
        },
      ]}
    />
  );
}

export function ActivityFeedDemo() {
  return (
    <ActivityFeed
      label="Illustrative event stream"
      items={[
        {
          id: "a",
          actor: "You",
          action: "created WaveText",
          time: "10:24",
          type: "Created",
        },
        {
          id: "b",
          actor: "Mizu",
          action: "validated the package",
          time: "10:31",
          type: "Validated",
        },
        {
          id: "c",
          actor: "You",
          action: "created Signal",
          time: "11:02",
          type: "Created",
        },
      ]}
    />
  );
}

export function DiffViewDemo() {
  return (
    <DiffView
      before={"surface: ink\nfocus: muted\nmotion: always"}
      after={"surface: ink\nfocus: accent\nmotion: reduced-safe"}
    />
  );
}

export function DataInspectorDemo() {
  return (
    <DataInspector
      label="Example release payload"
      value={{
        name: "mizu-ui",
        version: "0.2.0",
        checks: { types: true, lint: true },
        files: ["styles.css", "fonts.css"],
      }}
    />
  );
}

export function TreeViewDemo() {
  const [selected, setSelected] = useState("button");
  return (
    <TreeView
      selected={selected}
      onSelect={setSelected}
      nodes={[
        {
          id: "ui",
          label: "Foundation",
          children: [
            { id: "button", label: "Button.tsx" },
            { id: "badge", label: "Badge.tsx" },
          ],
        },
        { id: "styles", label: "styles.css" },
      ]}
    />
  );
}

export function ComparisonTableDemo() {
  return (
    <ComparisonTable
      label="Release formats"
      columns={["Source", "Package"]}
      rows={[
        { label: "Typed declarations", values: [false, true] },
        { label: "Inspectable source", values: [true, true] },
        { label: "Setup", values: ["Copy files", "Install once"] },
      ]}
    />
  );
}
