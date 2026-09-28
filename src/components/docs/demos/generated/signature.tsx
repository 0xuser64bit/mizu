"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import {
  Chronicle,
  TrendChart,
  Waveform,
  Plane,
  PlaneItem,
  FlowGraph,
  type FlowNode,
  type FlowEdge,
  Treemap,
  Board,
  type BoardCard,
  Outliner,
  type OutlineItem,
  QueryBuilder,
  type QueryGroup,
  Annotator,
  type Annotation,
} from "@/mizu";

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

export function PlaneDemo() {
  const [notes, setNotes] = useState([
    { id: "a", x: 0, y: 0, text: "Research" },
    { id: "b", x: 260, y: 90, text: "Prototype" },
    { id: "c", x: 90, y: 260, text: "Ship it" },
  ]);
  return (
    <Plane label="Planning board">
      {notes.map((n) => (
        <PlaneItem
          key={n.id}
          id={n.id}
          x={n.x}
          y={n.y}
          width={200}
          label={n.text}
          onMove={(x, y) =>
            setNotes((all) =>
              all.map((a) => (a.id === n.id ? { ...a, x, y } : a)),
            )
          }
        >
          <p
            style={{
              margin: 0,
              padding: 18,
              background: "var(--mizu-ink-2)",
              border: "1px solid var(--mizu-line-bright)",
            }}
          >
            {n.text}
          </p>
        </PlaneItem>
      ))}
    </Plane>
  );
}

export function FlowGraphDemo() {
  const [nodes, setNodes] = useState<FlowNode[]>([
    {
      id: "a",
      x: 0,
      y: 0,
      kind: "Trigger",
      label: "Form submitted",
      inputs: [],
    },
    { id: "b", x: 320, y: 0, kind: "Action", label: "Create ticket" },
    {
      id: "c",
      x: 640,
      y: 0,
      kind: "Email",
      label: "Confirm receipt",
      outputs: [],
    },
  ]);
  const [edges, setEdges] = useState<FlowEdge[]>([
    { id: "ab", source: "a", target: "b" },
  ]);
  return (
    <FlowGraph
      label="Support intake"
      nodes={nodes}
      edges={edges}
      onNodesChange={setNodes}
      onEdgesChange={setEdges}
    />
  );
}

export function TreemapDemo() {
  return (
    <Treemap
      label="Storage"
      format={(v) => `${v} GB`}
      data={{
        id: "all",
        label: "All",
        children: [
          {
            id: "media",
            label: "Media",
            children: [
              { id: "video", label: "Video", value: 420 },
              { id: "photos", label: "Photos", value: 180 },
            ],
          },
          { id: "backups", label: "Backups", value: 240 },
          { id: "docs", label: "Documents", value: 96 },
        ],
      }}
    />
  );
}

export function BoardDemo() {
  const [cards, setCards] = useState<BoardCard[]>([
    { id: "a", column: "todo", title: "Draft the announcement", meta: "2d" },
    { id: "b", column: "todo", title: "Record the demo" },
    {
      id: "c",
      column: "done",
      title: "Pick a launch date",
      assignee: "Rin Sato",
    },
  ]);
  return (
    <Board
      label="Launch"
      columns={[
        { id: "todo", title: "To do" },
        { id: "doing", title: "Doing", limit: 2 },
        { id: "done", title: "Done" },
      ]}
      cards={cards}
      onCardsChange={setCards}
    />
  );
}

export function OutlinerDemo() {
  const [items, setItems] = useState<OutlineItem[]>([
    {
      id: "a",
      text: "Plan the launch",
      children: [
        { id: "b", text: "Name an owner", done: true },
        { id: "c", text: "Rehearse the rollback" },
      ],
    },
    { id: "d", text: "Write the announcement" },
  ]);
  return <Outliner label="Launch" items={items} onItemsChange={setItems} />;
}

export function QueryBuilderDemo() {
  const [query, setQuery] = useState<QueryGroup>({
    id: "root",
    combinator: "and",
    rules: [{ id: "a", field: "plan", operator: "is", value: "pro" }],
  });
  return (
    <QueryBuilder
      label="Audience"
      value={query}
      onValueChange={setQuery}
      fields={[
        {
          id: "plan",
          label: "Plan",
          type: "select",
          options: [
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
          ],
        },
        { id: "seats", label: "Seats", type: "number" },
        { id: "joined", label: "Joined", type: "date" },
      ]}
    />
  );
}

export function AnnotatorDemo() {
  const [notes, setNotes] = useState<Annotation[]>([
    {
      id: "a",
      x: 0.3,
      y: 0.4,
      author: "Rin",
      body: "Can this headline be shorter?",
    },
  ]);
  return (
    <Annotator
      label="Homepage"
      author="You"
      annotations={notes}
      onAnnotationsChange={setNotes}
    >
      <img src="/images/field.svg" alt="Homepage draft" />
    </Annotator>
  );
}
