import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  CountUp,
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogTitle,
  GhostWord,
  Marquee,
  MaskLine,
  Reveal,
  RippleSurface,
  SectionTag,
  Specimen,
  Spinner,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTrigger,
  ToastProvider,
  WaveText,
  useToast,
  type ButtonVariant,
} from "mizu-ui";

export function App() {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<ButtonVariant>("solid");
  const [count, setCount] = useState(12);
  const { toast } = useToast();

  return (
    <div className="mizu-root" style={{ minHeight: "100vh", padding: "48px 24px" }}>
      <SectionTag>Consumer check</SectionTag>
      <h1 style={{ fontSize: 48, fontStretch: "118%", fontWeight: 900, margin: "16px 0" }}>
        <MaskLine>Mizu, installed.</MaskLine>
      </h1>

      <RippleSurface style={{ position: "fixed", inset: 0, pointerEvents: "none" }} />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <Button variant={variant} onClick={() => setVariant(variant === "solid" ? "ghost" : "solid")}>
          Toggle variant
        </Button>
        <Button loading>Working</Button>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Button onClick={() => toast("It works", { tone: "success" })}>Toast</Button>
      </div>

      <p style={{ marginTop: 32, fontSize: 40, fontWeight: 900, fontStretch: "118%" }}>
        <CountUp value={count} duration={0.8} />
      </p>
      <button onClick={() => setCount((c) => c + 11)}>Increment</button>

      <div style={{ marginTop: 32 }}>
        <WaveText text="Wave text" style={{ fontSize: 40, fontWeight: 900 }} />
      </div>

      <div style={{ marginTop: 48 }}>
        <Marquee duration={20} label="Words">
          <span>Install</span>
          <span>Import</span>
          <span>Ship</span>
        </Marquee>
      </div>

      <div style={{ marginTop: 48, maxWidth: 420 }}>
        <Specimen />
      </div>

      <div style={{ marginTop: 48 }}>
        <Tabs defaultValue="a">
          <TabsList label="Tabs">
            <TabsTrigger value="a">One</TabsTrigger>
            <TabsTrigger value="b">Two</TabsTrigger>
          </TabsList>
          <TabsPanel value="a">First panel</TabsPanel>
          <TabsPanel value="b">Second panel</TabsPanel>
        </Tabs>
      </div>

      <div style={{ marginTop: 48 }}>
        <Accordion>
          <AccordionItem value="1" title="Does it theme?">
            Yes — set data-theme=&quot;light&quot; on any ancestor.
          </AccordionItem>
          <AccordionItem value="2" title="Is it typed?">
            Full TypeScript declarations ship in the package.
          </AccordionItem>
        </Accordion>
      </div>

      <div style={{ marginTop: 48 }}>
        <Spinner />
        <div style={{ marginTop: 24 }}>
          <GhostWord text="MIZU." style={{ fontSize: 120, fontWeight: 900 }} />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen} label="Example">
        <DialogClose />
        <DialogTitle>From a fresh install</DialogTitle>
        <DialogBody>This dialog came from the packed tarball — focus trap and all.</DialogBody>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      <Reveal>
        <p style={{ marginTop: 48, color: "var(--mizu-faint)", fontSize: 12, letterSpacing: "0.2em" }}>
          REVEAL · MASKLINE · RIPPLE · MARQUEE · SPECIMEN · TABS · ACCORDION · DIALOG · GHOSTWORD
        </p>
      </Reveal>
    </div>
  );
}
