"use client";

import { useState } from "react";
import { Annotator, Badge, Button, SectionTag, type Annotation } from "@/mizu";
import { Scenarios } from "./shared";

// Illustrative review: people, times and feedback are invented.
const REVIEW: Annotation[] = [
  {
    id: "a1",
    x: 0.24,
    y: 0.2,
    author: "Rin Sato",
    time: "09:12",
    body: "The headline promises “every team”, but the cheapest plan caps at three seats. Can we say who it is for?",
    replies: [
      {
        id: "a1r",
        author: "Tomás Reyes",
        time: "09:40",
        body: "Trying “From your first project to your fiftieth.”",
      },
    ],
  },
  {
    id: "a2",
    x: 0.5,
    y: 0.56,
    author: "Mei Tanaka",
    time: "10:03",
    body: "Team is the plan we want people on — should it be visually first, not just in the middle?",
  },
  {
    id: "a3",
    x: 0.83,
    y: 0.52,
    author: "Ade Okafor",
    time: "10:20",
    body: "Enterprise needs a real price or a clear “talk to us”; a dash reads like a bug.",
  },
  {
    id: "a4",
    x: 0.5,
    y: 0.9,
    author: "Rin Sato",
    time: "11:05",
    body: "Button contrast passes, but the ghost variant on ink might be lost on projectors.",
    resolved: true,
  },
];

function PricingDraft() {
  const plans = [
    { name: "Solo", price: "€0", note: "Up to 3 seats" },
    { name: "Team", price: "€12", note: "Per seat, monthly", featured: true },
    { name: "Enterprise", price: "—", note: "Volume and SSO" },
  ];
  return (
    <div className="mizu-demo-page">
      <SectionTag>Pricing · draft 3</SectionTag>
      <h4>Plans for every team.</h4>
      <p>
        Start free, invite your team when the work needs it, and keep every
        draft.
      </p>
      <div className="mizu-demo-plans">
        {plans.map((plan) => (
          <div key={plan.name} data-featured={plan.featured || undefined}>
            {plan.featured && <Badge tone="accent">Most chosen</Badge>}
            <strong>{plan.name}</strong>
            <b>{plan.price}</b>
            <small>{plan.note}</small>
          </div>
        ))}
      </div>
      <div className="mizu-demo-page-actions">
        <Button size="sm">Start free</Button>
        <Button size="sm" variant="ghost">
          Talk to sales
        </Button>
      </div>
    </div>
  );
}

type Scenario = "review" | "fresh" | "readonly";

export function AnnotatorShowcase() {
  const [scenario, setScenario] = useState<Scenario>("review");
  const [notes, setNotes] = useState<Annotation[]>(REVIEW);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Scenario"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setNotes(v === "fresh" ? [] : REVIEW);
        }}
        options={[
          { value: "review", label: "Design review" },
          { value: "fresh", label: "No comments yet" },
          { value: "readonly", label: "Read-only" },
        ]}
        note="Illustrative review. Press C (or the Comment button), then click the draft to drop a pin; ⌘/Ctrl+Enter posts. Drag pins to move them, or use arrow keys on a focused pin."
      />
      <Annotator
        key={scenario}
        label="Pricing page"
        annotations={notes}
        onAnnotationsChange={setNotes}
        author={scenario === "readonly" ? undefined : "You"}
      >
        <PricingDraft />
      </Annotator>
    </div>
  );
}
