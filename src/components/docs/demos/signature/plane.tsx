"use client";

import { useRef, useState } from "react";
import { Plane, PlaneItem, type PlaneHandle } from "@/mizu";

type Card = {
  id: string;
  x: number;
  y: number;
  kind: "heading" | "note" | "quote" | "figure";
  text: string;
  by?: string;
};

// An illustrative retrospective wall: three clusters you can rearrange.
const CARDS: Card[] = [
  { id: "h1", x: 0, y: 0, kind: "heading", text: "What worked" },
  {
    id: "n1",
    x: 0,
    y: 70,
    kind: "note",
    text: "Weekly demo kept design and engineering honest about scope.",
    by: "Rin",
  },
  {
    id: "n2",
    x: 250,
    y: 70,
    kind: "note",
    text: "Feature flags let support switch off the importer in one click.",
    by: "Ade",
  },
  {
    id: "q1",
    x: 0,
    y: 230,
    kind: "quote",
    text: "“The staging data finally looked like production.”",
    by: "QA review",
  },
  { id: "h2", x: 620, y: 0, kind: "heading", text: "What hurt" },
  {
    id: "n3",
    x: 620,
    y: 70,
    kind: "note",
    text: "The migration plan lived in three documents and nobody owned it.",
    by: "Tomás",
  },
  {
    id: "n4",
    x: 870,
    y: 70,
    kind: "note",
    text: "Load tests ran against yesterday's schema.",
    by: "Mei",
  },
  {
    id: "f1",
    x: 620,
    y: 230,
    kind: "figure",
    text: "Error budget, launch week",
  },
  { id: "h3", x: 300, y: 520, kind: "heading", text: "Next time" },
  {
    id: "n5",
    x: 300,
    y: 590,
    kind: "note",
    text: "One owner per migration, named in the plan's first line.",
    by: "Team",
  },
  {
    id: "n6",
    x: 550,
    y: 590,
    kind: "note",
    text: "Rehearse the rollback, not just the rollout.",
    by: "Team",
  },
];

export function PlaneShowcase() {
  const [cards, setCards] = useState(CARDS);
  const [grid, setGrid] = useState<"dots" | "lines" | "none">("dots");
  const plane = useRef<PlaneHandle>(null);
  const cluster = (ids: string[]) => {
    const members = cards.filter((c) => ids.includes(c.id));
    const x0 = Math.min(...members.map((c) => c.x)),
      y0 = Math.min(...members.map((c) => c.y));
    const x1 = Math.max(
        ...members.map((c) => c.x + (c.kind === "heading" ? 420 : 230)),
      ),
      y1 = Math.max(...members.map((c) => c.y + 150));
    plane.current?.flyTo({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 });
  };
  return (
    <div className="mizu-showcase">
      <div className="mizu-showcase-scenarios">
        <div
          className="mizu-showcase-actions"
          role="group"
          aria-label="Fly to a cluster"
        >
          <button
            type="button"
            className="mizu-text-button"
            onClick={() => cluster(["h1", "n1", "n2", "q1"])}
          >
            What worked
          </button>
          <button
            type="button"
            className="mizu-text-button"
            onClick={() => cluster(["h2", "n3", "n4", "f1"])}
          >
            What hurt
          </button>
          <button
            type="button"
            className="mizu-text-button"
            onClick={() => cluster(["h3", "n5", "n6"])}
          >
            Next time
          </button>
          <button
            type="button"
            className="mizu-text-button"
            onClick={() =>
              setGrid(
                grid === "dots" ? "lines" : grid === "lines" ? "none" : "dots",
              )
            }
          >
            Grid: {grid}
          </button>
        </div>
        <p>
          Drag cards to rearrange. Drag the background to travel, pinch or
          Ctrl-scroll to zoom, tab between cards and the view follows.
          Illustrative content.
        </p>
      </div>
      <Plane ref={plane} label="Launch retrospective" grid={grid}>
        {cards.map((c) => (
          <PlaneItem
            key={c.id}
            id={c.id}
            x={c.x}
            y={c.y}
            width={c.kind === "heading" ? 420 : 230}
            label={c.kind === "heading" ? `Cluster: ${c.text}` : c.text}
            className={`mizu-demo-card mizu-demo-card--${c.kind}`}
            onMove={(x, y) =>
              setCards((all) =>
                all.map((a) => (a.id === c.id ? { ...a, x, y } : a)),
              )
            }
          >
            {c.kind === "heading" ? (
              <h4>{c.text}</h4>
            ) : c.kind === "figure" ? (
              <figure>
                <svg viewBox="0 0 200 80" aria-hidden="true">
                  <polyline points="0,70 20,66 40,68 60,40 70,12 80,18 95,52 120,60 150,64 200,62" />
                  <line x1="0" x2="200" y1="30" y2="30" />
                </svg>
                <figcaption>{c.text}</figcaption>
              </figure>
            ) : (
              <>
                <p>{c.text}</p>
                {c.by && <small>{c.by}</small>}
              </>
            )}
          </PlaneItem>
        ))}
      </Plane>
    </div>
  );
}
