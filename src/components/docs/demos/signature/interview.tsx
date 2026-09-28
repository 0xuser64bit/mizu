"use client";

import { useRef, useState } from "react";
import {
  CodeBlock,
  Interview,
  type InterviewAnswers,
  type InterviewQuestion,
} from "@/mizu";
import { Scenarios } from "./shared";

const QUESTIONS: InterviewQuestion[] = [
  {
    id: "name",
    title: "First, what should we call you?",
    type: "text",
    required: true,
    placeholder: "Your name",
  },
  {
    id: "role",
    title: "What do you do most days?",
    type: "choice",
    required: true,
    options: [
      { value: "design", label: "Design" },
      { value: "engineering", label: "Engineering" },
      { value: "product", label: "Product" },
      { value: "research", label: "Research" },
    ],
  },
  {
    id: "team",
    title: "How many people build your product?",
    type: "number",
    min: 1,
    max: 5000,
    placeholder: "12",
  },
  {
    id: "system",
    title: "Do you already keep a design system?",
    type: "yesno",
    required: true,
    next: (a) => (a.system ? "which" : "focus"),
  },
  {
    id: "which",
    title: "Which one, and what does it get right?",
    type: "long",
    description: "A sentence is plenty.",
  },
  {
    id: "focus",
    title: "Where should Mizu help first?",
    type: "multi",
    required: true,
    description: "Choose everything that applies.",
    options: [
      { value: "tokens", label: "Tokens and theming" },
      { value: "components", label: "Components" },
      { value: "motion", label: "Motion" },
      { value: "docs", label: "Documentation" },
    ],
  },
  {
    id: "likely",
    title: "How likely are you to recommend your current tools?",
    type: "scale",
    min: 1,
    max: 10,
  },
  {
    id: "email",
    title: "Where can we send your starter kit?",
    type: "email",
    required: true,
    placeholder: "you@studio.com",
  },
];

type Scenario = "calm" | "flaky";

export function InterviewShowcase() {
  const [scenario, setScenario] = useState<Scenario>("calm");
  const [answers, setAnswers] = useState<InterviewAnswers>({});
  const attempts = useRef(0);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Network"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setAnswers({});
          attempts.current = 0;
        }}
        options={[
          { value: "calm", label: "Sends first time" },
          { value: "flaky", label: "Fails once, then sends" },
        ]}
        note="Illustrative onboarding. Letters answer choices, Y/N answers yes-or-no, digits pick a score, Enter continues. Answering “no” to the design-system question skips its follow-up."
      />
      <Interview
        key={scenario}
        label="Studio onboarding"
        questions={QUESTIONS}
        answers={answers}
        onAnswersChange={setAnswers}
        intro={{
          title: "Set up your studio in a minute.",
          body: (
            <p>
              Eight short questions. You can go back at any point, and nothing
              is sent until you review it.
            </p>
          ),
          start: "Begin",
        }}
        onSubmit={async () => {
          await new Promise((r) => setTimeout(r, 900));
          if (scenario === "flaky" && attempts.current++ === 0)
            throw new Error("Network");
        }}
        done={
          <>
            Welcome aboard
            {typeof answers.name === "string" && answers.name
              ? `, ${answers.name}`
              : ""}
            .
            <p className="mizu-interview-description">
              Your starter kit is on its way. This demonstration sends nothing.
            </p>
          </>
        }
      />
      <CodeBlock
        code={JSON.stringify(answers, null, 2)}
        language="json"
        filename="onAnswersChange"
      />
    </div>
  );
}
