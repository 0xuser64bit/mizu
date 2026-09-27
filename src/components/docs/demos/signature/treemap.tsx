"use client";

import { useState } from "react";
import { Treemap, type TreemapNode } from "@/mizu";
import { Scenarios } from "./shared";

const kb = (n: number) => n * 1024;
const leaf = (
  id: string,
  label: string,
  size: number,
  growth = 0,
  detail?: string,
): TreemapNode & { growth: number } => ({
  id,
  label,
  value: kb(size),
  growth,
  detail,
});

// Illustrative production bundle; growth is the change since the previous release.
const BUNDLE: TreemapNode = {
  id: "bundle",
  label: "app.js",
  children: [
    {
      id: "react-dom",
      label: "react-dom",
      tone: "muted",
      children: [
        leaf("reconciler", "reconciler", 88),
        leaf("events", "events", 21),
        leaf("server", "server helpers", 14),
        leaf("scheduler", "scheduler", 6),
      ],
    },
    {
      id: "motion",
      label: "motion",
      tone: "muted",
      children: [
        leaf("animation", "animation", 34, 0.2),
        leaf("projection", "layout projection", 29, 0.1),
        leaf("gestures", "gestures", 12),
      ],
    },
    {
      id: "mizu",
      label: "mizu-ui",
      tone: "accent",
      children: [
        {
          id: "signature",
          label: "signature",
          children: [
            leaf(
              "chronicle",
              "Chronicle",
              9.8,
              0.6,
              "New this release: lanes, playhead and overview.",
            ),
            leaf(
              "trend",
              "TrendChart",
              8.9,
              0.6,
              "New this release: measuring and linked views.",
            ),
            leaf("flow", "FlowGraph", 8.1, 0.6),
            leaf("plane", "Plane", 6.2, 0.6),
            leaf("treemap", "Treemap", 5.4, 0.6),
            leaf("waveform", "Waveform", 5.1, 0.6),
          ],
        },
        {
          id: "forms",
          label: "forms",
          children: [
            leaf("fields", "Fields", 4.1),
            leaf("selection", "Selection", 4.4),
            leaf("dropzone", "FileDropzone", 2.2),
          ],
        },
        {
          id: "data",
          label: "data",
          children: [
            leaf("table", "DataTable", 2.9),
            leaf("charts", "Charts", 2.4),
            leaf("inspection", "Inspection", 5.1),
          ],
        },
        leaf("core", "core styles", 11.2, 0.15),
      ],
    },
    {
      id: "app",
      label: "application",
      tone: "success",
      children: [
        {
          id: "routes",
          label: "routes",
          children: [
            leaf("dashboard", "dashboard", 24, 0.3),
            leaf("settings", "settings", 12),
            leaf(
              "billing",
              "billing",
              16,
              0.8,
              "Grew 80%: the invoice PDF renderer now ships in the main chunk.",
            ),
            leaf("onboarding", "onboarding", 9),
          ],
        },
        leaf("shared", "shared components", 22, 0.1),
        leaf("state", "state & queries", 13),
      ],
    },
    {
      id: "dates",
      label: "date-fns",
      tone: "warning",
      children: [
        leaf(
          "locale",
          "all locales",
          41,
          1,
          "Every locale is bundled; import only the ones you ship.",
        ),
        leaf("format", "format", 7),
      ],
    },
    leaf("zod", "zod", 13),
  ],
};

const usd = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const SPEND: TreemapNode = {
  id: "spend",
  label: "September",
  children: [
    {
      id: "compute",
      label: "Compute",
      children: [
        { id: "api", label: "API fleet", value: 18400 },
        { id: "workers", label: "Workers", value: 9100 },
        {
          id: "batch",
          label: "Batch jobs",
          value: 5200,
          detail: "Nightly exports moved to spot capacity on the 12th.",
        },
      ],
    },
    {
      id: "storage",
      label: "Storage",
      children: [
        { id: "objects", label: "Objects", value: 7300 },
        { id: "db", label: "Databases", value: 12100 },
        { id: "backup", label: "Backups", value: 2600 },
      ],
    },
    {
      id: "network",
      label: "Network",
      children: [
        { id: "egress", label: "Egress", value: 6900 },
        { id: "cdn", label: "CDN", value: 3100 },
      ],
    },
    {
      id: "observability",
      label: "Observability",
      children: [
        { id: "logs", label: "Logs", value: 4800 },
        { id: "traces", label: "Traces", value: 2200 },
        { id: "metrics", label: "Metrics", value: 1400 },
      ],
    },
  ],
};

/** Size-weighted growth, so branches glow by what changed inside them. */
function growth(node: TreemapNode): { size: number; grown: number } {
  if (!node.children?.length) {
    const size = node.value ?? 0;
    return { size, grown: size * ((node as { growth?: number }).growth ?? 0) };
  }
  return node.children
    .map(growth)
    .reduce((a, b) => ({ size: a.size + b.size, grown: a.grown + b.grown }));
}

type Scenario = "bundle" | "spend" | "empty";

export function TreemapShowcase() {
  const [scenario, setScenario] = useState<Scenario>("bundle");
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Scenario"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setPicked(null);
        }}
        options={[
          { value: "bundle", label: "Bundle composition" },
          { value: "spend", label: "Cloud spend" },
          { value: "empty", label: "Empty" },
        ]}
        note="Illustrative data. Open a block to move inside it; the path leads back. Arrow keys travel between neighbouring blocks. Heat shows growth since the last release."
      />
      <Treemap
        key={scenario}
        label={
          scenario === "spend"
            ? "Cloud spend"
            : scenario === "empty"
              ? "Empty report"
              : "Production bundle"
        }
        data={
          scenario === "spend"
            ? SPEND
            : scenario === "empty"
              ? { id: "none", label: "Nothing" }
              : BUNDLE
        }
        format={
          scenario === "spend"
            ? (v) => usd.format(v)
            : (v) => `${(v / 1024).toFixed(v < 10240 ? 1 : 0)} KB`
        }
        heat={
          scenario === "bundle"
            ? (n) => {
                const { size, grown } = growth(n);
                return size ? grown / size : 0;
              }
            : undefined
        }
        onSelect={(node, path) =>
          setPicked(
            path
              .slice(1)
              .map((n) => n.label)
              .join(" / "),
          )
        }
      />
      {picked && (
        <p className="mizu-showcase-readout" role="status">
          <span>onSelect</span>
          {picked}
        </p>
      )}
    </div>
  );
}
