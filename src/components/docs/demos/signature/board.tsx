"use client";

import { useState } from "react";
import {
  Board,
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  type BoardCard,
  type BoardColumn,
} from "@/mizu";
import { Scenarios } from "./shared";

const COLUMNS: BoardColumn[] = [
  { id: "backlog", title: "Backlog" },
  { id: "ready", title: "Ready", limit: 4 },
  { id: "doing", title: "Doing", limit: 3 },
  { id: "review", title: "Review", limit: 2 },
  { id: "done", title: "Done" },
];

// Illustrative launch work: identifiers, estimates and people are invented.
const CARDS: BoardCard[] = [
  {
    id: "c1",
    column: "backlog",
    title: "Archive last year's pricing experiments",
    meta: "MZ-201",
    tags: ["cleanup"],
  },
  {
    id: "c2",
    column: "backlog",
    title: "Offline mode for the field app",
    meta: "MZ-188 · 8d",
    tags: ["research"],
    tone: "muted",
  },
  {
    id: "c3",
    column: "ready",
    title: "Rewrite the migration plan with one owner",
    meta: "MZ-142 · 2d",
    assignee: "Tomás Reyes",
    tone: "accent",
  },
  {
    id: "c4",
    column: "ready",
    title: "Rehearse the rollback on staging",
    meta: "MZ-150 · 1d",
    assignee: "Mei Tanaka",
    tags: ["ops"],
  },
  {
    id: "c5",
    column: "doing",
    title: "Load test against the new schema",
    meta: "MZ-145 · 3d",
    assignee: "Ade Okafor",
    tags: ["perf"],
    tone: "warning",
  },
  {
    id: "c6",
    column: "doing",
    title: "Status page copy for launch day",
    meta: "MZ-160",
    assignee: "Rin Sato",
  },
  {
    id: "c7",
    column: "review",
    title: "Feature flag for the importer",
    meta: "MZ-139",
    assignee: "Ade Okafor",
    tags: ["safety"],
    tone: "success",
  },
  {
    id: "c8",
    column: "done",
    title: "Staging data mirrors production",
    meta: "MZ-120",
    assignee: "Mei Tanaka",
  },
  {
    id: "c9",
    column: "done",
    title: "Weekly demo on the calendar",
    meta: "MZ-118",
  },
];
const CROWDED: BoardCard[] = CARDS.map((c) =>
  c.id === "c3" || c.id === "c4" ? { ...c, column: "doing" } : c,
);

type Scenario = "plan" | "crowded" | "empty";

export function BoardShowcase() {
  const [scenario, setScenario] = useState<Scenario>("plan");
  const [cards, setCards] = useState(CARDS);
  const [open, setOpen] = useState<BoardCard | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const title = (id: string) => COLUMNS.find((c) => c.id === id)?.title ?? id;
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Scenario"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setLog([]);
          setCards(v === "plan" ? CARDS : v === "crowded" ? CROWDED : []);
        }}
        options={[
          { value: "plan", label: "Launch plan" },
          { value: "crowded", label: "Over the limit" },
          { value: "empty", label: "Empty board" },
        ]}
        note="Drag a card by its body with a mouse, or its grip on touch. Space picks a card up from the keyboard, arrows carry it, Space drops, Escape cancels. Enter opens it."
      />
      <Board
        key={scenario}
        label="Launch board"
        columns={COLUMNS}
        cards={cards}
        onCardsChange={(next) => {
          const moved = next.find(
            (c) => cards.find((o) => o.id === c.id)?.column !== c.column,
          );
          if (moved)
            setLog((l) =>
              [`${moved.title} → ${title(moved.column)}`, ...l].slice(0, 3),
            );
          setCards(next);
        }}
        onCardOpen={setOpen}
        onAddCard={(column) =>
          setCards((all) => [
            ...all,
            {
              id: `new-${all.length + 1}`,
              column,
              title: `New card ${all.length + 1}`,
              meta: "Draft",
            },
          ])
        }
      />
      {log.length > 0 && (
        <p className="mizu-showcase-readout" role="status">
          <span>onCardsChange</span>
          {log.join(" · ")}
        </p>
      )}
      <Dialog
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        label={open?.title ?? "Card"}
      >
        <DialogClose />
        <DialogTitle>{open?.title}</DialogTitle>
        <DialogBody>
          <p>
            {open?.meta} · {open && title(open.column)}
            {open?.assignee && ` · ${open.assignee}`}
          </p>
          <p>
            Opened with Enter or a double-click through onCardOpen. Any product
            detail view belongs here.
          </p>
        </DialogBody>
      </Dialog>
    </div>
  );
}
