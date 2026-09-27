"use client";

import { useState } from "react";
import { CodeBlock, Outliner, type OutlineItem } from "@/mizu";
import { Scenarios } from "./shared";

const PLAN: OutlineItem[] = [
  {
    id: "w1",
    text: "Week one — make it boring",
    children: [
      { id: "w1a", text: "Name one owner for the migration", done: true },
      {
        id: "w1b",
        text: "Rehearse the rollback on staging",
        children: [
          { id: "w1b1", text: "Time it with a stopwatch" },
          { id: "w1b2", text: "Write down every manual step" },
        ],
      },
      { id: "w1c", text: "Freeze the schema" },
    ],
  },
  {
    id: "w2",
    text: "Week two — rehearse in public",
    collapsed: true,
    children: [
      { id: "w2a", text: "Load test against the new schema" },
      { id: "w2b", text: "Status page copy reviewed by support" },
      { id: "w2c", text: "Dry run with the on-call rotation" },
    ],
  },
  {
    id: "w3",
    text: "Launch day",
    children: [
      { id: "w3a", text: "Flag on for 5% · watch error budget" },
      { id: "w3b", text: "Everyone else at 14:00 if quiet" },
    ],
  },
];
const NOTES: OutlineItem[] = [
  {
    id: "n1",
    text: "Design review — onboarding",
    children: [
      { id: "n1a", text: "Keep the empty state; it explains the first step" },
      { id: "n1b", text: "Progress should survive a refresh", done: true },
    ],
  },
  {
    id: "n2",
    text: "Decisions",
    children: [
      { id: "n2a", text: "Ship the checklist behind a flag" },
      { id: "n2b", text: "Revisit copy after the first 100 teams" },
    ],
  },
  { id: "n3", text: "Follow-ups" },
];

const markdown = (items: readonly OutlineItem[], depth = 0): string =>
  items
    .map(
      (item) =>
        `${"  ".repeat(depth)}- ${item.done ? "[x] " : ""}${item.text}\n${item.children ? markdown(item.children, depth + 1) : ""}`,
    )
    .join("");

type Scenario = "plan" | "notes" | "empty";

export function OutlinerShowcase() {
  const [scenario, setScenario] = useState<Scenario>("plan");
  const [items, setItems] = useState<OutlineItem[]>(PLAN);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Scenario"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setItems(v === "plan" ? PLAN : v === "notes" ? NOTES : []);
        }}
        options={[
          { value: "plan", label: "Launch plan" },
          { value: "notes", label: "Meeting notes" },
          { value: "empty", label: "Empty" },
        ]}
        note="Enter splits a line, Tab and Shift+Tab restructure, Alt+↑↓ moves a branch, ⌘/Ctrl+Enter marks done, ⌘/Ctrl+↑↓ folds, Alt+→ focuses on an item (or click its diamond)."
      />
      <Outliner
        key={scenario}
        label={scenario === "notes" ? "Notes" : "Launch plan"}
        items={items}
        onItemsChange={setItems}
      />
      <CodeBlock
        code={markdown(items) || "- (empty)"}
        language="markdown"
        filename="onItemsChange → Markdown"
      />
    </div>
  );
}
