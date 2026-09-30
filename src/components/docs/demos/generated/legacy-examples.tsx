"use client";
// Compile the original copied examples too; these do not replace their interactive demos.
import { useState, type ReactNode } from "react";
import {
  Button,
  ButtonLink,
  SectionTag,
  Rule,
  Badge,
  Spinner,
  Frame,
  Slider,
  Tooltip,
  MaskLine,
  Reveal,
  Magnetic,
  Marquee,
  PageWipeProvider,
  usePageWipe,
  Specimen,
  SoftType,
  WaveText,
  GhostWord,
  Pinfield,
  Signal,
  RippleSurface,
  CountUp,
  CopyButton,
  ToastProvider,
  useToast,
  Accordion,
  AccordionItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
  Dialog,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
  Nav,
} from "@/mizu";

export function ButtonUsage_Actions() {
  return (
    <>
      <Button variant="solid">Continue</Button>
      <Button variant="ghost" size="sm">
        Cancel
      </Button>
      <Button loading>Saving</Button>
      <ButtonLink href="/next" label="Next page">
        Next page
      </ButtonLink>
    </>
  );
}

export function PrimitivesUsage_Header() {
  const [v, setV] = useState(40);
  return (
    <>
      <SectionTag tone="muted">01 — Foundation</SectionTag>
      <Rule label="Interlude" />
      <Badge tone="accent">Live</Badge>
      <Spinner size={12} />
      <Frame label="Fig. 01">
        <p>Framed content</p>
      </Frame>
      <Slider label="Density" value={v} min={0} max={100} onChange={setV} />
      <Tooltip label="Help">
        <button>Focus me</button>
      </Tooltip>
    </>
  );
}

export function MaskLineUsage_Headline() {
  return (
    <h1>
      <MaskLine>Movement</MaskLine>
      <MaskLine delay={0.15}>travels.</MaskLine>
    </h1>
  );
}

export function RevealUsage_Grid() {
  return (
    <Reveal delay={0.1} y={24}>
      <p>Your content arrives here.</p>
    </Reveal>
  );
}

export function MagneticUsage_PullTab() {
  return (
    <Magnetic strength={0.4}>
      <button>Pull</button>
    </Magnetic>
  );
}

export function MarqueeUsage_Ticker() {
  return (
    <Marquee duration={30} label="Disciplines">
      <span>Surfaces</span>
      <span>Motion</span>
    </Marquee>
  );
}

export function PageWipeUsage_App({ children }: { children: ReactNode }) {
  return <PageWipeProvider>{children}</PageWipeProvider>;
}

export function PageWipeUsage_NavLink() {
  const { wipe } = usePageWipe();

  const go = async () => {
    await wipe("The lab"); // resolves at the sweep midpoint
    window.location.assign("/lab"); // or call your router here
  };

  return <button onClick={go}>Enter</button>;
}

export function SpecimenUsage_Tester() {
  return <Specimen />;
}

export function SoftTypeUsage_Engine() {
  return <SoftType text="Aa" mode="both" speed={1} />;
}

export function WaveTextUsage_Title() {
  return (
    <WaveText
      text="Mizu"
      as="h1"
      radius={120}
      style={{ margin: 0, fontSize: 72, fontWeight: 900 }}
    />
  );
}

export function GhostWordUsage_Footer() {
  return <GhostWord text="MIZU." />;
}

export function PinfieldUsage_Field() {
  return <Pinfield gap={26} />;
}

export function SignalUsage_Wave() {
  return <Signal density={14} />;
}

export function RippleSurfaceUsage_Hero() {
  return (
    <div style={{ position: "relative" }}>
      <RippleSurface style={{ position: "absolute", inset: 0 }} />
      <h1>Step inside</h1>
    </div>
  );
}

export function CountUpUsage_Stat() {
  return <CountUp value={1284} duration={1.4} suffix="+" />;
}

export function CopyButtonUsage_Swatch({ hex }: { hex: string }) {
  return <CopyButton text={hex}>{hex}</CopyButton>;
}

export function ToastUsage_App({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

export function ToastUsage_Saver() {
  const { toast } = useToast();
  const notify = () => toast("Notification received", { tone: "success" });
  return <button onClick={notify}>Notify</button>;
}

export function AccordionUsage_Faq() {
  return (
    <Accordion>
      <AccordionItem value="a" title="First question">
        The answer, revealed with a 450ms expo height animation.
      </AccordionItem>
    </Accordion>
  );
}

export function TabsUsage_Switcher() {
  return (
    <Tabs defaultValue="a">
      <TabsList label="Settings">
        <TabsTrigger value="a">General</TabsTrigger>
      </TabsList>
      <TabsPanel value="a">Panel content</TabsPanel>
    </Tabs>
  );
}

export function DialogUsage_Modal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onOpenChange={setOpen} label="Archive notice">
        <DialogClose />
        <DialogTitle>Release when ready</DialogTitle>
        <DialogBody>…</DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export function NavUsage_Shell() {
  return (
    <Nav
      brand={<strong>MIZU.</strong>}
      links={[{ href: "/", label: "Home" }]}
      currentPath="/"
    />
  );
}
