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
  Treemap,
  Board,
  Outliner,
  type OutlineItem,
  QueryBuilder,
  type QueryGroup,
  Annotator,
  type Annotation,
  Tour,
  Interview,
  TransferQueue,
  TriageDeck,
  Gallery,
  Folio,
  Sidenote,
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
  return (
    <FlowGraph
      label="Support intake"
      defaultNodes={[
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
      ]}
      defaultEdges={[{ id: "ab", source: "a", target: "b" }]}
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
  return (
    <Board
      label="Launch"
      columns={[
        { id: "todo", title: "To do" },
        { id: "doing", title: "Doing", limit: 2 },
        { id: "done", title: "Done" },
      ]}
      defaultCards={[
        {
          id: "a",
          column: "todo",
          title: "Draft the announcement",
          meta: "2d",
        },
        { id: "b", column: "todo", title: "Record the demo" },
        {
          id: "c",
          column: "done",
          title: "Pick a launch date",
          assignee: "Rin Sato",
        },
      ]}
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

export function TourDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        id="tour-start"
        className="mizu-text-button"
        onClick={() => setOpen(true)}
      >
        Take the tour
      </button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        steps={[
          {
            target: "#tour-start",
            title: "This started the tour",
            body: "Each step points at a real element on the page.",
          },
        ]}
      />
    </>
  );
}

export function InterviewDemo() {
  return (
    <Interview
      label="Feedback"
      onSubmit={(answers) =>
        localStorage.setItem("mizu-feedback", JSON.stringify(answers))
      }
      questions={[
        {
          id: "role",
          title: "What do you do most days?",
          type: "choice",
          required: true,
          options: [
            { value: "design", label: "Design" },
            { value: "code", label: "Engineering" },
          ],
        },
        {
          id: "score",
          title: "How was your week?",
          type: "scale",
          min: 1,
          max: 5,
        },
        { id: "note", title: "Anything else?", type: "long" },
      ]}
    />
  );
}

export function TransferQueueDemo() {
  return (
    <TransferQueue
      label="Local reads"
      transfer={async (file, { signal, onProgress }) => {
        const reader = file.stream().getReader();
        let loaded = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) return;
          if (signal.aborted) {
            await reader.cancel();
            throw new DOMException("Stopped", "AbortError");
          }
          loaded += value.byteLength;
          onProgress(loaded);
        }
      }}
    />
  );
}

export function TriageDeckDemo() {
  return (
    <TriageDeck
      label="Inbox"
      items={[
        { id: "a", title: "Invoice from Northworks" },
        { id: "b", title: "Team offsite dates" },
      ]}
      itemLabel={(m) => m.title}
      decisions={[
        { id: "archive", label: "Archive", direction: "left" },
        { id: "keep", label: "Keep", direction: "right", tone: "success" },
      ]}
      renderItem={(m) => <h3 style={{ margin: 0, fontSize: 24 }}>{m.title}</h3>}
    />
  );
}

export function GalleryDemo() {
  return (
    <Gallery
      label="Field studies"
      rowHeight={160}
      items={[
        {
          id: "ink",
          src: "/images/field.svg",
          alt: "Diamond field on ink",
          width: 720,
          height: 360,
          caption: "Field, ink",
        },
        {
          id: "paper",
          src: "/images/field-light.svg",
          alt: "Diamond field on paper",
          width: 720,
          height: 360,
          caption: "Field, paper",
        },
      ]}
    />
  );
}

export function FolioDemo() {
  return (
    <Folio label="Field notes">
      <h2 id="usage-rivers">Rivers</h2>
      <p>
        Water finds the lowest path through any landscape
        <Sidenote>Unless it freezes first.</Sidenote> and keeps to it until
        something moves it.
      </p>
    </Folio>
  );
}
