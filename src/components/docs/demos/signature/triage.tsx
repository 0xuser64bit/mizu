"use client";

import { useState } from "react";
import { TriageDeck, type TriageDecision } from "@/mizu";
import { Scenarios } from "./shared";

type Post = {
  id: string;
  author: string;
  flag: string;
  body: string;
  age: string;
};
// Invented community posts and reports.
const POSTS: Post[] = [
  {
    id: "p1",
    author: "harbor_light",
    flag: "Reported as spam · 3",
    body: "Selling 40% off accounts for your favourite design tools, message me for the link!!",
    age: "4 min",
  },
  {
    id: "p2",
    author: "rin.sato",
    flag: "Reported as off-topic · 1",
    body: "Does anyone have a good way to rehearse a database rollback without a full staging copy?",
    age: "12 min",
  },
  {
    id: "p3",
    author: "anon-4821",
    flag: "Reported as abusive · 5",
    body: "[Message hidden while it is reviewed — contains a personal attack on another member.]",
    age: "31 min",
  },
  {
    id: "p4",
    author: "mei_t",
    flag: "Reported as duplicate · 2",
    body: "Sharing our launch checklist template again for the people who asked in last week’s thread.",
    age: "1 h",
  },
  {
    id: "p5",
    author: "quietworks",
    flag: "Reported as spam · 1",
    body: "We just open-sourced our tokens pipeline. Feedback welcome — no signup, just the repo.",
    age: "2 h",
  },
];
const MODERATE: TriageDecision[] = [
  { id: "remove", label: "Remove", direction: "left", tone: "danger" },
  { id: "keep", label: "Keep", direction: "right", tone: "success" },
  { id: "escalate", label: "Escalate", direction: "up", tone: "warning" },
];

type Word = {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  example: string;
};
const WORDS: Word[] = [
  {
    id: "w1",
    word: "水",
    reading: "mizu",
    meaning: "water",
    example: "水を一杯ください。 — A glass of water, please.",
  },
  {
    id: "w2",
    word: "波",
    reading: "nami",
    meaning: "wave",
    example: "波が静かだ。 — The waves are calm.",
  },
  {
    id: "w3",
    word: "紙",
    reading: "kami",
    meaning: "paper",
    example: "紙に書いてください。 — Please write it on paper.",
  },
  {
    id: "w4",
    word: "墨",
    reading: "sumi",
    meaning: "ink",
    example: "墨の香り。 — The scent of ink.",
  },
];
const STUDY: TriageDecision[] = [
  { id: "again", label: "Again", direction: "left", tone: "warning" },
  { id: "known", label: "Got it", direction: "right", tone: "success" },
];

type Scenario = "moderation" | "vocabulary";

export function TriageDeckShowcase() {
  const [scenario, setScenario] = useState<Scenario>("moderation");
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Queue"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setLog([]);
        }}
        options={[
          { value: "moderation", label: "Moderation queue" },
          { value: "vocabulary", label: "Vocabulary cards" },
        ]}
        note="Fling the top card toward a decision, or use the arrow keys or buttons. Backspace undoes — the card flies back from where it went. Illustrative content."
      />
      {scenario === "moderation" ? (
        <TriageDeck
          key="moderation"
          label="Reported posts"
          items={POSTS}
          itemLabel={(p) => `post by ${p.author}`}
          decisions={MODERATE}
          onDecide={(p, d) =>
            setLog((l) => [`${d.label} ${p.author}`, ...l].slice(0, 4))
          }
          onUndo={(p) => setLog((l) => [`Undo ${p.author}`, ...l].slice(0, 4))}
          empty="The queue is clear. Nice work."
          renderItem={(p) => (
            <article className="mizu-demo-post">
              <p className="mizu-demo-post-flag">{p.flag}</p>
              <p className="mizu-demo-post-body">{p.body}</p>
              <p className="mizu-demo-post-meta">
                @{p.author} · {p.age} ago
              </p>
            </article>
          )}
        />
      ) : (
        <TriageDeck
          key="vocabulary"
          label="Vocabulary"
          items={WORDS}
          itemLabel={(w) => `${w.reading}, ${w.meaning}`}
          decisions={STUDY}
          onDecide={(w, d) =>
            setLog((l) => [`${d.label}: ${w.reading}`, ...l].slice(0, 4))
          }
          empty="Every card reviewed. Come back tomorrow."
          renderItem={(w) => (
            <article className="mizu-demo-word">
              <p lang="ja">{w.word}</p>
              <p>
                {w.reading} <span>· {w.meaning}</span>
              </p>
              <small lang="ja">{w.example}</small>
            </article>
          )}
        />
      )}
      {log.length > 0 && (
        <p className="mizu-showcase-readout" role="status">
          <span>onDecide · onUndo</span>
          {log.join(" · ")}
        </p>
      )}
    </div>
  );
}
