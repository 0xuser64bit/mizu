"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import {
  Stack,
  Badge,
  Grid,
  Stat,
  SplitPane,
  AspectRatio,
  ScrollArea,
  Prose,
  AppShell,
  SideNav,
} from "@/mizu";

export function StackDemo() {
  return (
    <Stack direction="row" wrap gap={12}>
      <Badge>React</Badge>
      <Badge>TypeScript</Badge>
      <Badge>Native CSS</Badge>
    </Stack>
  );
}

export function GridDemo() {
  return (
    <Grid minWidth={160} gap={24}>
      <Stat label="Forms" value="16" />
      <Stat label="Status" value="12" />
      <Stat label="Data" value="12" />
    </Grid>
  );
}

export function SplitPaneDemo() {
  const [value, setValue] = useState(45);
  return (
    <SplitPane
      value={value}
      onValueChange={setValue}
      first={
        <div>
          <h3>Source</h3>
          <p className="mizu-field-hint">
            Drag the divider or focus it and use the arrow keys.
          </p>
        </div>
      }
      second={
        <div>
          <h3>Preview</h3>
          <p className="mizu-field-hint">
            This panel receives {100 - value}% of the available space.
          </p>
        </div>
      }
    />
  );
}

export function AspectRatioDemo() {
  // Stand-in art, so the example runs anywhere: use your own images.
  const field = (ground: string, mark: string) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360"><pattern id="d" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M18 13l5 5-5 5-5-5z" fill="${mark}"/></pattern><rect width="720" height="360" fill="${ground}"/><rect width="720" height="360" fill="url(#d)"/></svg>`)}`;
  return (
    <AspectRatio ratio={2}>
      <img
        src={field("#141413", "#7e776b")}
        alt="A diamond measurement field"
      />
    </AspectRatio>
  );
}

export function ScrollAreaDemo() {
  return (
    <ScrollArea label="Release notes" maxHeight={180}>
      <Prose>
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i}>
            Entry {i + 1}. Each component keeps its own behavior, source and
            usage example available.
          </p>
        ))}
      </Prose>
    </ScrollArea>
  );
}

export function AppShellDemo() {
  return (
    <AppShell
      mainTag="section"
      mainId="shell-demo-content"
      header={<strong>Workshop</strong>}
      sidebar={
        <SideNav
          currentPath="/components"
          groups={[
            {
              label: "Explore",
              items: [
                { label: "Collection", href: "/components" },
                { label: "Lab", href: "/lab" },
              ],
            },
          ]}
        />
      }
      footer={
        <span className="mizu-field-hint">
          All changes stay on this device.
        </span>
      }
    >
      <h3>Your workspace</h3>
      <p className="mizu-field-hint">
        A shell gives content a place; it does not decide the product for you.
      </p>
    </AppShell>
  );
}
