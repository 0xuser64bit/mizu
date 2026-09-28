"use client";

import { useState } from "react";
import {
  Annotator,
  Board,
  Gallery,
  ImageFigure,
  TriageDeck,
  type Annotation,
  type BoardCard,
  type BoardColumn,
  type TriageDecision,
} from "@/mizu";
import { PLATES } from "@/components/docs/demos/signature/plates";

// Invented submissions for an invented harbour app's key art.
const DESIGNERS = ["Aiko Tanaka", "Léo Martin", "Ruth Mensah", "Sana Qureshi"];
const SUBMISSIONS = PLATES.slice(0, 8).map((plate, i) => ({
  id: plate.id,
  plate,
  title: String(plate.caption).replace(/^Plate \d+ — /, ""),
  designer: DESIGNERS[i % DESIGNERS.length]!,
}));
type Submission = (typeof SUBMISSIONS)[number];

const DECISIONS: TriageDecision[] = [
  { id: "revise", label: "Revise", direction: "left", tone: "warning" },
  { id: "ship", label: "Ship", direction: "right", tone: "success" },
  { id: "discuss", label: "Discuss", direction: "up", tone: "accent" },
];
const COLUMNS: BoardColumn[] = [
  { id: "ship", title: "Ship" },
  { id: "revise", title: "Revise" },
  { id: "discuss", title: "Discuss", limit: 3 },
];
const TONE = { ship: "success", revise: "warning", discuss: "accent" } as const;

const SEEDED: Record<string, Annotation[]> = {
  [SUBMISSIONS[0]!.id]: [
    {
      id: "seed-1",
      x: 0.33,
      y: 0.3,
      author: "Kofi Boateng",
      body: "The sun sits right where the app bar will go on small screens.",
      time: "Yesterday",
      replies: [
        {
          id: "seed-1r",
          author: "Aiko Tanaka",
          body: "Good catch — I can drop it lower.",
          time: "Yesterday",
        },
      ],
    },
  ],
  [SUBMISSIONS[1]!.id]: [
    {
      id: "seed-2",
      x: 0.62,
      y: 0.74,
      author: "Mei Chen",
      body: "Love the warmth here. Does it survive the dark theme?",
      time: "Today",
    },
  ],
};

export function DesignReview() {
  const [decided, setDecided] = useState<string[]>([]);
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [notes, setNotes] = useState<Record<string, Annotation[]>>(SEEDED);
  const [viewing, setViewing] = useState<number | null>(null);
  const current = SUBMISSIONS.find((s) => !decided.includes(s.id));
  const comments = (id: string) => notes[id]?.length ?? 0;
  const card = (s: Submission, column: string): BoardCard => ({
    id: s.id,
    column,
    title: s.title,
  });

  return (
    <div className="mizu-review">
      <div className="mizu-review-desk">
        <section className="mizu-review-canvas" aria-label="Current submission">
          {current ? (
            <>
              <p className="mizu-incident-label">
                {current.title} · {current.designer} ·{" "}
                {SUBMISSIONS.indexOf(current) + 1} of {SUBMISSIONS.length}
              </p>
              <Annotator
                key={current.id}
                label={`Comments on ${current.title}`}
                author="You"
                now="Just now"
                annotations={notes[current.id] ?? []}
                onAnnotationsChange={(list) =>
                  setNotes((n) => ({ ...n, [current.id]: list }))
                }
              >
                <ImageFigure src={current.plate.src} alt={current.plate.alt} />
              </Annotator>
            </>
          ) : (
            <div className="mizu-review-done">
              <p>Every submission has a decision.</p>
              <span>Rearrange the board, or open a card to see it large.</span>
            </div>
          )}
        </section>
        <TriageDeck
          label="Submissions"
          items={SUBMISSIONS}
          itemLabel={(s) => `${s.title} by ${s.designer}`}
          decisions={DECISIONS}
          onDecide={(s, d) => {
            setDecided((ids) => [...ids, s.id]);
            setCards((c) => [...c.filter((x) => x.id !== s.id), card(s, d.id)]);
          }}
          onUndo={(s) => {
            setDecided((ids) => ids.filter((id) => id !== s.id));
            setCards((c) => c.filter((x) => x.id !== s.id));
          }}
          empty="All reviewed."
          renderItem={(s) => (
            <article className="mizu-review-card">
              <ImageFigure src={s.plate.src} alt="" />
              <h3>{s.title}</h3>
              <p>
                {s.designer} · {comments(s.id)}{" "}
                {comments(s.id) === 1 ? "comment" : "comments"}
              </p>
            </article>
          )}
        />
      </div>

      <Board
        label="Decisions"
        columns={COLUMNS}
        cards={cards.map((c) => ({
          ...c,
          meta: `${SUBMISSIONS.find((s) => s.id === c.id)?.designer} · ${comments(c.id)} ${comments(c.id) === 1 ? "comment" : "comments"}`,
          tone: TONE[c.column as keyof typeof TONE],
        }))}
        onCardsChange={setCards}
        onCardOpen={(c) =>
          setViewing(SUBMISSIONS.findIndex((s) => s.id === c.id))
        }
      />

      <section aria-label="All submissions" className="mizu-review-sheet">
        <p className="mizu-incident-label">
          Contact sheet · open any to compare
        </p>
        <Gallery
          label="All submissions"
          items={SUBMISSIONS.map((s) => ({
            ...s.plate,
            caption: `${s.title} — ${s.designer}`,
          }))}
          rowHeight={120}
          index={viewing}
          onIndexChange={setViewing}
        />
      </section>
    </div>
  );
}
