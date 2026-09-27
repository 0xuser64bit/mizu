"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import {
  Mark,
  SectionTag,
  Rule,
  Badge,
  Spinner,
  Frame,
  Slider,
  Tooltip,
  Button,
} from "@/mizu";

export function MarkDemo() {
  return (
    <div style={{ display: "flex", gap: 24 }}>
      <Mark size={8} />
      <Mark size={12} tone="paper" />
    </div>
  );
}

export function SectionTagDemo() {
  return <SectionTag tone="accent">Interface craft</SectionTag>;
}

export function RuleDemo() {
  return <Rule label="Next chapter" />;
}

export function BadgeDemo() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Badge tone="accent">New</Badge>
      <Badge tone="paper">Stable</Badge>
      <Badge>Draft</Badge>
    </div>
  );
}

export function SpinnerDemo() {
  return <Spinner label="Loading artwork" size={18} />;
}

export function FrameDemo() {
  return (
    <Frame label="Artwork">
      <div style={{ padding: 40, textAlign: "center" }}>
        A place for your work
      </div>
    </Frame>
  );
}

export function SliderDemo() {
  const [value, setValue] = useState(40);
  return (
    <Slider
      label="Density"
      value={value}
      min={0}
      max={100}
      onChange={setValue}
    />
  );
}

export function TooltipDemo() {
  return (
    <Tooltip label="Keep your changes">
      <Button size="sm" variant="ghost">
        Save draft
      </Button>
    </Tooltip>
  );
}
