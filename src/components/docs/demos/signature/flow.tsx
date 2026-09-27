"use client";

import { useEffect, useRef, useState } from "react";
import {
  FlowGraph,
  tidyFlow,
  type FlowEdge,
  type FlowNode,
  type FlowStatus,
} from "@/mizu";
import { Scenarios } from "./shared";

// An illustrative onboarding automation, deliberately arranged by hand so Tidy has work to do.
const AUTOMATION: FlowNode[] = [
  {
    id: "signup",
    x: 0,
    y: 40,
    kind: "Trigger",
    label: "New sign-up",
    description: "From the web form",
    inputs: [],
  },
  {
    id: "enrich",
    x: 300,
    y: -40,
    kind: "Action",
    label: "Enrich profile",
    description: "Company size, region",
  },
  {
    id: "branch",
    x: 620,
    y: 60,
    kind: "Condition",
    label: "Enterprise domain?",
    outputs: ["yes", "no"],
  },
  {
    id: "sales",
    x: 940,
    y: -120,
    kind: "Action",
    label: "Notify sales",
    description: "#pipeline channel",
  },
  {
    id: "demo",
    x: 1240,
    y: -80,
    kind: "Action",
    label: "Offer a demo",
    description: "Calendar link, 3 slots",
    outputs: [],
  },
  {
    id: "welcome",
    x: 960,
    y: 200,
    kind: "Email",
    label: "Send welcome",
    description: "Template: first-steps",
  },
  { id: "wait", x: 1260, y: 260, kind: "Delay", label: "Wait 2 days" },
  {
    id: "check",
    x: 1560,
    y: 150,
    kind: "Condition",
    label: "Activated?",
    outputs: ["active", "inactive"],
  },
  {
    id: "nudge",
    x: 1880,
    y: 260,
    kind: "Email",
    label: "Send a nudge",
    description: "Template: getting-unstuck",
    outputs: [],
  },
];
const WIRES: FlowEdge[] = [
  { id: "1", source: "signup", target: "enrich" },
  { id: "2", source: "enrich", target: "branch" },
  { id: "3", source: "branch", sourcePort: "yes", target: "sales" },
  { id: "4", source: "sales", target: "demo" },
  { id: "5", source: "branch", sourcePort: "no", target: "welcome" },
  { id: "6", source: "welcome", target: "wait" },
  { id: "7", source: "wait", target: "check" },
  { id: "8", source: "check", sourcePort: "inactive", target: "nudge" },
];
const RUN: [string, FlowStatus][] = [
  ["signup", "success"],
  ["enrich", "success"],
  ["branch", "success"],
  ["welcome", "success"],
  ["wait", "success"],
  ["check", "error"],
];

const PIPELINE: FlowNode[] = [
  {
    id: "commit",
    x: 0,
    y: 0,
    kind: "Source",
    label: "main @ 8aeed39",
    inputs: [],
    status: "success",
  },
  {
    id: "build",
    x: 0,
    y: 0,
    kind: "Build",
    label: "Compile packages",
    status: "success",
  },
  {
    id: "unit",
    x: 0,
    y: 0,
    kind: "Test",
    label: "Unit — 99 checks",
    status: "success",
  },
  {
    id: "browser",
    x: 0,
    y: 0,
    kind: "Test",
    label: "Browser matrix",
    status: "running",
  },
  {
    id: "consumer",
    x: 0,
    y: 0,
    kind: "Test",
    label: "Packed consumer",
    status: "success",
  },
  {
    id: "deploy",
    x: 0,
    y: 0,
    kind: "Release",
    label: "Deploy docs",
    outputs: [],
    status: "idle",
  },
];
const PIPELINE_WIRES: FlowEdge[] = [
  { id: "a", source: "commit", target: "build" },
  { id: "b", source: "build", target: "unit" },
  { id: "c", source: "build", target: "browser" },
  { id: "d", source: "build", target: "consumer" },
  { id: "e", source: "unit", target: "deploy" },
  { id: "f", source: "browser", target: "deploy" },
  { id: "g", source: "consumer", target: "deploy" },
];

/** Refuse a wire that would let the automation loop back on itself. */
function wouldLoop(edges: readonly FlowEdge[], candidate: FlowEdge) {
  const next = new Map<string, string[]>();
  for (const e of [...edges, candidate])
    next.set(e.source, [...(next.get(e.source) ?? []), e.target]);
  const seen = new Set<string>();
  const walk = (id: string): boolean =>
    id === candidate.source ||
    (!seen.has(id) && (seen.add(id), (next.get(id) ?? []).some(walk)));
  return (next.get(candidate.target) ?? []).some(walk);
}

type Scenario = "automation" | "pipeline" | "empty";

export function FlowGraphShowcase() {
  const [scenario, setScenario] = useState<Scenario>("automation");
  const [nodes, setNodes] = useState(AUTOMATION);
  const [edges, setEdges] = useState(WIRES);
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(-1);
  const timer = useRef(0);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const run = () => {
    window.clearInterval(timer.current);
    setStep(0);
    timer.current = window.setInterval(() => {
      setStep((s) => {
        if (s >= RUN.length) window.clearInterval(timer.current);
        return Math.min(s + 1, RUN.length);
      });
    }, 900);
  };
  const statusOf = (id: string): FlowStatus => {
    if (step < 0) return "idle";
    const i = RUN.findIndex(([n]) => n === id);
    if (i === -1) return step >= RUN.length ? "skipped" : "idle";
    return i < step ? RUN[i]![1] : i === step ? "running" : "idle";
  };
  const shownNodes =
    scenario === "automation"
      ? nodes.map((n) => ({ ...n, status: statusOf(n.id) }))
      : nodes;
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Scenario"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setSelected(null);
          setStep(-1);
          window.clearInterval(timer.current);
          setNodes(
            v === "automation"
              ? AUTOMATION
              : v === "pipeline"
                ? tidyFlow(PIPELINE, PIPELINE_WIRES)
                : [],
          );
          setEdges(
            v === "automation" ? WIRES : v === "pipeline" ? PIPELINE_WIRES : [],
          );
        }}
        options={[
          { value: "automation", label: "Onboarding automation" },
          { value: "pipeline", label: "Release pipeline" },
          { value: "empty", label: "Empty" },
        ]}
        note="Drag nodes; drag from an output diamond to an input to wire (or press Enter on an output, then on an input). Delete removes the selection. Loops are refused."
      />
      <FlowGraph
        key={scenario}
        label={
          scenario === "pipeline" ? "Release pipeline" : "Onboarding automation"
        }
        nodes={shownNodes}
        edges={edges}
        onNodesChange={(next) =>
          setNodes(
            next.map(({ status, ...n }) => ({
              ...n,
              status: scenario === "pipeline" ? status : undefined,
            })),
          )
        }
        onEdgesChange={setEdges}
        selected={selected}
        onSelectedChange={setSelected}
        validateConnection={(edge) =>
          !wouldLoop(edges, edge) || "That would create a loop."
        }
        tools={
          scenario === "automation" && (
            <button type="button" onClick={run}>
              {step >= 0 && step < RUN.length ? "Running…" : "Run"}
            </button>
          )
        }
      />
      {scenario === "automation" && step >= RUN.length && (
        <p className="mizu-showcase-readout" role="status">
          <span>Run finished</span>
          The activation check failed; the nudge was skipped. Select a node to
          inspect it, or press Run again.
        </p>
      )}
      {scenario === "pipeline" && (
        <p className="mizu-showcase-readout">
          <span>Positions computed</span>
          These stages were stored without coordinates and laid out by
          tidyFlow() — the same layered layout behind Tidy.
        </p>
      )}
    </div>
  );
}
