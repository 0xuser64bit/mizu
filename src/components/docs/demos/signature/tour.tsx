"use client";

import { useState } from "react";
import {
  Button,
  DataTable,
  SearchField,
  Stat,
  Tour,
  type TourStep,
} from "@/mizu";
import { Scenarios } from "./shared";

// An invented product screen; the tour points at its real, working parts.
const STEPS: TourStep[] = [
  {
    target: "[data-tour='search']",
    title: "Find anything",
    body: (
      <p>
        Search across projects, people and files. Press / from anywhere to jump
        here.
      </p>
    ),
  },
  {
    target: "[data-tour='new']",
    title: "Start a project",
    body: (
      <p>
        Projects hold your drafts, reviews and releases. Templates are one click
        away.
      </p>
    ),
    placement: "left",
  },
  {
    target: "[data-tour='stats']",
    title: "Know where you stand",
    body: <p>These numbers update as your team works — no refresh needed.</p>,
  },
  {
    target: "[data-tour='table']",
    title: "Pick up where you left off",
    body: (
      <p>
        Recent work, sorted by what changed last. Select a column header to
        sort.
      </p>
    ),
    placement: "top",
  },
  {
    target: "[data-tour='billing']",
    title: "Billing lives in settings",
    body: (
      <p>
        Only owners see billing. This step’s element is absent here, so the card
        centres itself.
      </p>
    ),
  },
];

const ROWS = [
  { id: "1", name: "Autumn launch", owner: "Rin Sato", updated: "12 min ago" },
  { id: "2", name: "Pricing page", owner: "Mei Tanaka", updated: "1 h ago" },
  {
    id: "3",
    name: "Onboarding emails",
    owner: "Ade Okafor",
    updated: "Yesterday",
  },
];

export function TourShowcase() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [finished, setFinished] = useState(false);
  const [scenario, setScenario] = useState<"full" | "short">("full");
  const steps = scenario === "full" ? STEPS : STEPS.slice(0, 2);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Tour"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setStep(0);
        }}
        options={[
          { value: "full", label: "Five steps, one missing" },
          { value: "short", label: "Two steps" },
        ]}
        note="Arrow keys step through; Escape leaves. The spotlight follows its element while the page scrolls or reflows."
      />
      <div className="mizu-demo-app">
        <header>
          <strong>Atlas</strong>
          <div data-tour="search">
            <SearchField
              label="Search"
              value={query}
              onValueChange={setQuery}
              placeholder="Projects, people, files"
            />
          </div>
          <span data-tour="new">
            <Button size="sm">New project</Button>
          </span>
        </header>
        <div className="mizu-demo-app-stats" data-tour="stats">
          <Stat
            label="Open reviews"
            value="12"
            change={{ value: "3 today", direction: "up" }}
          />
          <Stat label="Drafts" value="48" />
          <Stat
            label="Shipped this month"
            value="7"
            change={{
              value: "2 more than August",
              direction: "up",
              favorable: true,
            }}
          />
        </div>
        <div data-tour="table">
          <DataTable
            label="Recent work"
            rows={ROWS}
            getRowId={(r) => r.id}
            columns={[
              {
                id: "name",
                header: "Project",
                render: (r) => r.name,
                sortValue: (r) => r.name,
              },
              { id: "owner", header: "Owner", render: (r) => r.owner },
              { id: "updated", header: "Updated", render: (r) => r.updated },
            ]}
          />
        </div>
      </div>
      <div className="mizu-showcase-readout">
        <span>Try it</span>
        <button
          type="button"
          className="mizu-text-button"
          onClick={() => {
            setStep(0);
            setFinished(false);
            setOpen(true);
          }}
        >
          Take the tour
        </button>
        {finished && <output>onFinish called — the tour was completed</output>}
      </div>
      <Tour
        steps={steps}
        open={open}
        onOpenChange={setOpen}
        step={step}
        onStepChange={setStep}
        onFinish={() => setFinished(true)}
        label="Welcome to Atlas"
      />
    </div>
  );
}
