"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import {
  Avatar,
  Kbd,
  CodeBlock,
  Quote,
  Prose,
  ImageFigure,
  MediaPlayer,
  LinkCard,
  FileCard,
  Checklist,
} from "@/mizu";

export function AvatarDemo() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar name="Mizu Workshop" />
      <Avatar name="Aya Mori" size={60} />
      <span className="mizu-field-hint">A small team, clearly named.</span>
    </div>
  );
}

export function KbdDemo() {
  return (
    <p>
      Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open your command palette.
    </p>
  );
}

export function CodeBlockDemo() {
  return (
    <CodeBlock
      filename="app.tsx"
      language="tsx"
      code={
        'import { Button } from "mizu-ui";\n\n<Button>Make something</Button>'
      }
    />
  );
}

export function QuoteDemo() {
  return (
    <Quote author="Mizu design note">
      The interface should make the next action feel obvious.
    </Quote>
  );
}

export function ProseDemo() {
  return (
    <Prose>
      <h2>Interfaces are instruments.</h2>
      <p>
        They give people a way to observe, choose and change something. A clear
        reading rhythm keeps those decisions in focus.
      </p>
      <ul>
        <li>Keep labels visible.</li>
        <li>Explain the next action.</li>
      </ul>
      <p>
        Begin with the{" "}
        <a href="/components/getting-started">installation guide</a>.
      </p>
    </Prose>
  );
}

export function ImageFigureDemo() {
  // Stand-in art, so the example runs anywhere: use your own images.
  const field = (ground: string, mark: string) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360"><pattern id="d" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M18 13l5 5-5 5-5-5z" fill="${mark}"/></pattern><rect width="720" height="360" fill="${ground}"/><rect width="720" height="360" fill="url(#d)"/></svg>`)}`;
  return (
    <ImageFigure
      src={field("#141413", "#7e776b")}
      alt="Warm diamonds arranged on a dark measurement field"
      caption="Field study 01 — a repeatable spacing rhythm."
      width={720}
      height={360}
    />
  );
}

export function MediaPlayerDemo() {
  const src = "/audio/calibration.wav"; // an audio file your app serves
  return (
    <MediaPlayer
      kind="audio"
      label="A four-second calibration tone"
      src={src}
      preload="metadata"
    />
  );
}

export function LinkCardDemo() {
  return (
    <LinkCard
      href="/components/getting-started"
      title="Build with Mizu"
      description="Install the package, bring the styles and compose your first interface."
    />
  );
}

export function FileCardDemo() {
  return (
    <FileCard
      href="/api/source/button"
      name="Button.tsx"
      type="TypeScript source"
    />
  );
}

export function ChecklistDemo() {
  const [items, setItems] = useState([
    { id: "types", label: "Check types", checked: true },
    {
      id: "browser",
      label: "Review in the browser",
      description: "Include a narrow screen and keyboard navigation.",
      checked: false,
    },
    { id: "package", label: "Install mizu-ui", checked: false },
  ]);
  return (
    <Checklist
      label="Release checks"
      items={items}
      onChange={(id, checked) =>
        setItems(items.map((i) => (i.id === id ? { ...i, checked } : i)))
      }
    />
  );
}
