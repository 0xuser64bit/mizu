"use client";

import { useState } from "react";
import { Accordion, AccordionItem, Button, Dialog, DialogBody, DialogClose, DialogFooter, DialogTitle, Tabs, TabsList, TabsPanel, TabsTrigger } from "@/mizu";
import { SiteNav } from "@/components/shell/SiteNav";
import { Toggle } from "./shared";

const FAQ = [
  {
    value: "materials",
    title: "What is a Mizu surface?",
    body: "The surface is the material an interface is made of. Mizu ships surfaces as token-driven React components: ink and paper themes, hairline rules, mono microcopy and a signature diamond mark.",
  },
  {
    value: "motion",
    title: "How does motion behave?",
    body: "Motion is a material, not a coating. Wipes travel, springs follow, and every animation carries information. Under prefers-reduced-motion everything resolves instantly or renders a static frame.",
  },
  {
    value: "tokens",
    title: "Can I re-theme components?",
    body: "Every component reads CSS custom properties. Override --mizu-accent, --mizu-ink or any token on your own selector, or flip the whole surface with data-theme=\"light\".",
  },
];

export function AccordionDemo() {
  const [multi, setMulti] = useState(false);
  return (
    <div>
      <div className="mb-6 flex items-center gap-6">
        <Toggle label="Allow multiple" checked={multi} onChange={setMulti} />
      </div>
      <Accordion allowMultiple={multi}>
        {FAQ.map((f) => (
          <AccordionItem key={f.value} value={f.value} title={f.title}>
            {f.body}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="tokens">
      <TabsList label="Mizu systems">
        <TabsTrigger value="tokens">Tokens</TabsTrigger>
        <TabsTrigger value="motion">Motion</TabsTrigger>
        <TabsTrigger value="type">Type</TabsTrigger>
      </TabsList>
      <TabsPanel value="tokens">
        <p className="max-w-xl leading-relaxed text-muted">
          Tokens are CSS custom properties scoped to --mizu-* namespaces. One stylesheet defines the
          surface; every component inherits it. Re-theming is an override, not a fork.
        </p>
      </TabsPanel>
      <TabsPanel value="motion">
        <p className="max-w-xl leading-relaxed text-muted">
          Two easings carry the library: expo for entrances and wipes for transitions. Springs handle
          pointer-follow. Reduced motion collapses all of it to instant state changes.
        </p>
      </TabsPanel>
      <TabsPanel value="type">
        <p className="max-w-xl leading-relaxed text-muted">
          Archivo Variable spans width 62–125 and weight 100–900, Instrument Serif carries the
          italic voice, and JetBrains Mono sets every label at 0.22em tracking.
        </p>
      </TabsPanel>
    </Tabs>
  );
}

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onOpenChange={setOpen} label="Archive notice">
        <DialogClose />
        <DialogTitle>Release when ready</DialogTitle>
        <DialogBody>
          Pieces enter the archive when they are finished — not before. This dialog demonstrates the
          focus trap, Escape handling and scroll lock built into every Mizu overlay.
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Keep working
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Archive it
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export function NavDemo() {
  return (
    <div className="overflow-hidden border border-line">
      <DemoNote />
      <div style={{ transform: "scale(0.55)", transformOrigin: "top left", width: "181.81%" }}>
        <div style={{ pointerEvents: "none" }}>
          <SiteNav trackChapters={false} />
        </div>
      </div>
      <p className="border-t border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        The live Nav, scaled — the real one is holding this page together
      </p>
    </div>
  );
}

function DemoNote() {
  return (
    <p className="border-b border-line bg-ink-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
      Scroll progress · chapter tracking · mobile overlay
    </p>
  );
}
