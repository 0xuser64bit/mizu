"use client";

import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  ButtonLink,
  Frame,
  Mark,
  Pinfield,
  Rule,
  SectionTag,
  Slider,
  Spinner,
  Tooltip,
  type ButtonVariant,
} from "@/mizu";
import { DemoLabel, Segmented, Toggle } from "./shared";

export function ButtonDemo() {
  const [variant, setVariant] = useState<ButtonVariant>("solid");
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState<"md" | "sm">("md");

  return (
    <div>
      <div className="flex min-h-[120px] flex-wrap items-center gap-4">
        <Button variant={variant} size={size} loading={loading}>
          Continue
        </Button>
        <Button variant={variant} size={size} disabled>
          Disabled
        </Button>
        <ButtonLink href="#button" variant={variant} size={size} label="Anchor button">
          Anchor
        </ButtonLink>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-6">
        <Segmented options={["solid", "ghost", "inverse"] as const} value={variant} onChange={setVariant} />
        <Segmented options={["md", "sm"] as const} value={size} onChange={setSize} />
        <Toggle label="Loading" checked={loading} onChange={setLoading} />
      </div>
    </div>
  );
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border border-line bg-ink-2 p-5">
      <DemoLabel>{label}</DemoLabel>
      <div className="mt-4 flex min-h-[52px] items-center">{children}</div>
    </div>
  );
}

export function PrimitivesDemo() {
  const [slider, setSlider] = useState(60);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Cell label="Mark — the diamond">
        <div className="flex items-center gap-4">
          <Mark size={10} tone="accent" />
          <Mark size={10} tone="paper" />
          <Mark size={10} tone="muted" />
          <Mark size={10} tone="line" />
        </div>
      </Cell>
      <Cell label="SectionTag">
        <SectionTag tone="muted">01 — Foundation</SectionTag>
      </Cell>
      <Cell label="Rule">
        <div className="w-full">
          <div className="mb-4">
            <Rule tone="line" node={false} />
          </div>
          <Rule label="Interlude" />
        </div>
      </Cell>
      <Cell label="Badge">
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">Live</Badge>
          <Badge tone="paper">Draft</Badge>
          <Badge tone="muted">Queued</Badge>
          <Badge tone="line">Archived</Badge>
        </div>
      </Cell>
      <Cell label="Spinner">
        <div className="flex items-center gap-5">
          <Spinner size={12} />
          <Spinner size={18} tone="paper" />
        </div>
      </Cell>
      <Cell label="Frame">
        <div className="h-28 w-full">
          <Frame label="Fig. 01" className="h-full w-full">
            <div className="h-24 w-full">
              <Pinfield className="h-full w-full" gap={18} autoPulse={false} />
            </div>
          </Frame>
        </div>
      </Cell>
      <Cell label="Slider">
        <div className="w-full">
          <Slider label="Density" value={slider} min={0} max={100} onChange={setSlider} />
        </div>
      </Cell>
      <Cell label="Tooltip">
        <Tooltip label="Copied to clipboard">
          <Button size="sm" variant="ghost">
            Hover me
          </Button>
        </Tooltip>
      </Cell>
    </div>
  );
}
