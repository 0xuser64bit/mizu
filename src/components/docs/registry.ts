import { CATALOG } from "./catalog";

export type PropDoc = {
  name: string;
  type: string;
  def?: string;
  desc: string;
};

export type ComponentMeta = {
  slug: string;
  name: string;
  category:
    | "Foundation"
    | "Motion"
    | "Type"
    | "Instruments"
    | "Feedback"
    | "Composites"
    | "Forms"
    | "Status"
    | "Data"
    | "Navigation"
    | "Content"
    | "Layout"
    | "Interaction";
  tagline: string;
  source: string;
  kind?: "overview";
  usage: string;
  props: PropDoc[];
  a11y: string;
  motion: string;
};

export const CATEGORIES: ComponentMeta["category"][] = [
  "Foundation",
  "Motion",
  "Type",
  "Instruments",
  "Feedback",
  "Composites",
  "Forms",
  "Status",
  "Data",
  "Navigation",
  "Content",
  "Layout",
  "Interaction",
];

const ORIGINAL_COMPONENTS: ComponentMeta[] = [
  {
    slug: "button",
    source: "ui/Button.tsx",
    name: "Button",
    category: "Foundation",
    tagline:
      "The primary action surface — solid, ghost and inverse, with a loading state and an arrow that leans into the hover.",
    usage: `import { Button, ButtonLink } from "mizu-ui";

export function Actions() {
  return (
    <>
      <Button variant="solid">Continue</Button>
      <Button variant="ghost" size="sm">Cancel</Button>
      <Button loading>Saving</Button>
      <ButtonLink href="/next" label="Next page">
        Next page
      </ButtonLink>
    </>
  );
}`,
    props: [
      {
        name: "variant",
        type: '"solid" | "ghost" | "inverse"',
        def: '"solid"',
        desc: "Surface treatment. Inverse is for use on accent fills.",
      },
      {
        name: "size",
        type: '"md" | "sm"',
        def: '"md"',
        desc: "Padding and type scale.",
      },
      {
        name: "loading",
        type: "boolean",
        def: "false",
        desc: "Preserves the action label, adds a diamond spinner and disables the button.",
      },
      {
        name: "arrow",
        type: "boolean",
        def: "true",
        desc: "Show the corner arrow that translates on hover.",
      },
      {
        name: "label",
        type: "string",
        desc: "ButtonLink only — sets aria-label for icon-only links.",
      },
    ],
    a11y: "Renders a real <button> / <a>. Disabled states use the disabled attribute; loading is conveyed through role=status on the spinner.",
    motion:
      "Arrow translates 2px on hover with expo easing. Loading retains the label and replaces the arrow.",
  },
  {
    slug: "primitives",
    source: "ui/Mark.tsx",
    kind: "overview",
    name: "Primitives",
    category: "Foundation",
    tagline:
      "The shared atoms — Mark, SectionTag, Rule, Badge, Spinner, Frame, Slider and Tooltip. Every other component is built from these.",
    usage: `import { useState } from "react";
import { SectionTag, Rule, Badge, Spinner, Frame, Slider, Tooltip } from "mizu-ui";

export function Header() {
  const [v, setV] = useState(40);
  return (
    <>
      <SectionTag tone="muted">01 — Foundation</SectionTag>
      <Rule label="Interlude" />
      <Badge tone="accent">Live</Badge>
      <Spinner size={12} />
      <Frame label="Fig. 01"><p>Framed content</p></Frame>
      <Slider label="Density" value={v} min={0} max={100} onChange={setV} />
      <Tooltip label="Help"><button>Focus me</button></Tooltip>
    </>
  );
}`,
    props: [
      {
        name: "Mark",
        type: "size, tone",
        desc: "The diamond glyph. Tones: accent, paper, muted, line.",
      },
      {
        name: "SectionTag",
        type: "tone, diamond",
        desc: "Mono uppercase label with optional diamond marker.",
      },
      {
        name: "Rule",
        type: "label, node, tone",
        desc: "Hairline divider with optional centered node and label.",
      },
      {
        name: "Badge",
        type: "tone, diamond",
        desc: "Status chip. Tones: paper, muted, accent, line.",
      },
      {
        name: "Spinner",
        type: "size, tone, label",
        desc: "Rotating diamond loader with role=status.",
      },
      {
        name: "Frame",
        type: "label, tone",
        desc: "Crop-mark frame for media with optional caption plate.",
      },
      {
        name: "Slider",
        type: "label, value, min, max, step, onChange",
        desc: "Diamond-thumb range control.",
      },
      {
        name: "Tooltip",
        type: "label, side",
        desc: "Linked tooltip on hover/focus, dismissible with Escape.",
      },
    ],
    a11y: "Mark is aria-hidden (decorative). Spinner exposes role=status with a label. Tooltip appears on :focus-within as well as hover. Slider is a labelled native input.",
    motion:
      "Spinner rotates on a 900ms linear loop. Tooltip fades and rises on hover/focus.",
  },
  {
    slug: "maskline",
    source: "motion/MaskLine.tsx",
    name: "MaskLine",
    category: "Motion",
    tagline:
      "The Mizu headline reveal — text rises from inside its own mask, one line at a time.",
    usage: `import { MaskLine } from "mizu-ui";

export function Headline() {
  return (
    <h1>
      <MaskLine>Movement</MaskLine>
      <MaskLine delay={0.15}>travels.</MaskLine>
    </h1>
  );
}`,
    props: [
      {
        name: "delay",
        type: "number",
        def: "0",
        desc: "Seconds before the line rises.",
      },
      {
        name: "y",
        type: "string",
        def: '"112%"',
        desc: "Start position of the masked rise.",
      },
    ],
    a11y: "Text remains in the document — the mask is pure CSS overflow. Screen readers see the full headline immediately.",
    motion:
      "1.15s expo rise per line. Stagger delays for multi-line headlines.",
  },
  {
    slug: "reveal",
    source: "motion/Reveal.tsx",
    name: "Reveal",
    category: "Motion",
    tagline:
      "Scroll-triggered entrance with direction, distance and delay control.",
    usage: `import { Reveal } from "mizu-ui";

export function Grid() {
  return (
    <Reveal delay={0.1} y={24}>
      <p>Your content arrives here.</p>
    </Reveal>
  );
}`,
    props: [
      {
        name: "delay",
        type: "number",
        def: "0",
        desc: "Seconds before entrance starts.",
      },
      {
        name: "x / y",
        type: "number",
        def: "0 / 32",
        desc: "Entrance offset in pixels.",
      },
      {
        name: "duration",
        type: "number",
        def: "0.95",
        desc: "Entrance duration in seconds.",
      },
      {
        name: "once",
        type: "boolean",
        def: "true",
        desc: "Reveal only the first time it enters the viewport.",
      },
    ],
    a11y: "Content is present in the DOM before revealing — no content is created or removed by the animation.",
    motion: "0.95s expo rise, fires once at 70px viewport margin.",
  },
  {
    slug: "magnetic",
    source: "motion/Magnetic.tsx",
    name: "Magnetic",
    category: "Motion",
    tagline:
      "A spring-follow wrapper — the surface leans toward the cursor and settles back.",
    usage: `import { Magnetic } from "mizu-ui";

export function PullTab() {
  return (
    <Magnetic strength={0.4}>
      <button>Pull</button>
    </Magnetic>
  );
}`,
    props: [
      {
        name: "strength",
        type: "number",
        def: "0.32",
        desc: "Fraction of the distance to the cursor that the element travels.",
      },
    ],
    a11y: "Purely presentational — the wrapped control keeps its own keyboard and screen-reader behavior.",
    motion:
      "Spring (stiffness 160, damping 14) on both axes. Travel is disabled by the reduced-motion hook.",
  },
  {
    slug: "marquee",
    source: "motion/Marquee.tsx",
    name: "Marquee",
    category: "Motion",
    tagline:
      "A seamless infinite ticker that pauses on hover and stands still for reduced motion.",
    usage: `import { Marquee } from "mizu-ui";

export function Ticker() {
  return (
    <Marquee duration={30} label="Disciplines">
      <span>Surfaces</span>
      <span>Motion</span>
    </Marquee>
  );
}`,
    props: [
      {
        name: "duration",
        type: "number",
        def: "42",
        desc: "Seconds per full cycle.",
      },
      {
        name: "pauseOnHover",
        type: "boolean",
        def: "true",
        desc: "Pause the cycle while hovered.",
      },
      {
        name: "separator",
        type: "boolean",
        def: "true",
        desc: "Diamond separator between items.",
      },
      {
        name: "label",
        type: "string",
        desc: "Accessible name for the marquee region.",
      },
    ],
    a11y: "The second copy is aria-hidden and inert. Hover/focus pauses, and a visible Pause/Play button gives explicit control.",
    motion: "Linear transform loop — GPU-friendly, no layout thrash.",
  },
  {
    slug: "pagewipe",
    source: "motion/PageWipe.tsx",
    name: "PageWipe",
    category: "Motion",
    tagline:
      "The page transition — a full-screen sweep with a label, and an imperative API that hands you the midpoint.",
    usage: `import type { ReactNode } from "react";
import { PageWipeProvider, usePageWipe } from "mizu-ui";

export function App({ children }: { children: ReactNode }) {
  return <PageWipeProvider>{children}</PageWipeProvider>;
}

export function NavLink() {
  const { wipe } = usePageWipe();

  const go = async () => {
    await wipe("The lab");   // resolves at the sweep midpoint
    window.location.assign("/lab"); // or call your router here
  };

  return <button onClick={go}>Enter</button>;
}`,
    props: [
      {
        name: "wipe",
        type: "(label?: string) => Promise<void>",
        desc: "Starts the sweep. The promise resolves at the midpoint — navigate then.",
      },
    ],
    a11y: "The overlay is aria-hidden and pointer-events:none. Under reduced motion the promise resolves immediately with no visual.",
    motion:
      "1.05s wipe easing sweep; the label fades in and out with the cover.",
  },
  {
    slug: "specimen",
    source: "type/Specimen.tsx",
    name: "Specimen",
    category: "Type",
    tagline:
      "A live type tester — set text, size, weight, tracking and serif voice while the specimen redraws.",
    usage: `import { Specimen } from "mizu-ui";

export function Tester() {
  return <Specimen />;
}`,
    props: [
      {
        name: "text / onTextChange",
        type: "string / fn",
        def: '"Mizu"',
        desc: "Specimen text, up to 14 characters.",
      },
      {
        name: "size / onSizeChange",
        type: "number / fn",
        def: "84",
        desc: "Font size in px (24–140).",
      },
      {
        name: "weight / onWeightChange",
        type: "number / fn",
        def: "800",
        desc: "Archivo weight (100–900, step 25). Disabled in serif mode.",
      },
      {
        name: "tracking / onTrackingChange",
        type: "number / fn",
        def: "-2",
        desc: "Letter spacing in px (-8–24).",
      },
      {
        name: "serif / onSerifChange",
        type: "boolean / fn",
        def: "false",
        desc: "Switch to Instrument Serif italic.",
      },
    ],
    a11y: "All controls are labelled native inputs. The specimen stage is presentational.",
    motion: "Size and tracking transition over 150ms as you drag the sliders.",
  },
  {
    slug: "softtype",
    source: "type/SoftType.tsx",
    name: "SoftType",
    category: "Type",
    tagline:
      "A variable-font engine in CSS — weight and width oscillate through the Archivo axes.",
    usage: `import { SoftType } from "mizu-ui";

export function Engine() {
  return <SoftType text="Aa" mode="both" speed={1} />;
}`,
    props: [
      {
        name: "text",
        type: "string",
        def: '"Aa"',
        desc: "The specimen glyphs.",
      },
      {
        name: "mode",
        type: '"weight" | "width" | "both"',
        def: '"weight"',
        desc: "Which axes oscillate.",
      },
      {
        name: "speed",
        type: "number",
        def: "1",
        desc: "Oscillation rate multiplier.",
      },
      {
        name: "min / max",
        type: "number",
        def: "100 / 900",
        desc: "Weight range.",
      },
    ],
    a11y: "The type specimen carries role=img and a descriptive label.",
    motion:
      "CSS keyframes interpolate font-variation-settings. Reduced motion holds the actual font axes still.",
  },
  {
    slug: "wavetext",
    source: "type/WaveText.tsx",
    name: "WaveText",
    category: "Type",
    tagline:
      "Kinetic text that answers the cursor — each letter lifts, scales and warms as you pass over it.",
    usage: `import { WaveText } from "mizu-ui";

export function Title() {
  return (
    <WaveText
      text="Mizu"
      as="h1"
      radius={120}
      colorFrom="#f4f0e8"
      colorTo="#ff4d1c"
    />
  );
}`,
    props: [
      { name: "text", type: "string", desc: "The word or phrase." },
      {
        name: "radius",
        type: "number",
        def: "120",
        desc: "Pointer influence radius in px.",
      },
      {
        name: "colorFrom / colorTo",
        type: "string",
        def: '"var(--mizu-paper)" / "var(--mizu-accent)"',
        desc: "Resting and active letter colors.",
      },
      {
        name: "as",
        type: '"span" | "h1" | "h2" | "p" | "div"',
        def: '"span"',
        desc: "Semantic element to render.",
      },
    ],
    a11y: "Letters are aria-hidden; the container carries the full text as its accessible name.",
    motion:
      "Direct motion values with smoothstep falloff. Reduced motion removes pointer listeners and keeps letters at rest.",
  },
  {
    slug: "ghostword",
    source: "type/GhostWord.tsx",
    name: "GhostWord",
    category: "Type",
    tagline:
      "An oversized outlined word that fills with accent when hovered — built for footers and chapter markers.",
    usage: `import { GhostWord } from "mizu-ui";

export function Footer() {
  return <GhostWord text="MIZU." />;
}`,
    props: [
      { name: "text", type: "string", desc: "The word." },
      {
        name: "fill",
        type: '"accent" | "paper"',
        def: '"accent"',
        desc: "Hover fill color.",
      },
    ],
    a11y: "aria-hidden — pair with an sr-only heading for the same text.",
    motion:
      "500ms fill and stroke-color transition with expo letter-spacing settle.",
  },
  {
    slug: "pinfield",
    source: "lab/Pinfield.tsx",
    name: "Pinfield",
    category: "Instruments",
    tagline:
      "A grid of pins that carries pulses — click and a wavefront travels outward, lighting the field.",
    usage: `import { Pinfield } from "mizu-ui";

export function Field() {
  return <Pinfield gap={26} />;
}`,
    props: [
      { name: "gap", type: "number", def: "26", desc: "Grid spacing in px." },
      {
        name: "speed",
        type: "number",
        def: "3.4",
        desc: "Wavefront propagation speed.",
      },
      {
        name: "autoPulse",
        type: "boolean",
        def: "true",
        desc: "Send an ambient pulse every 3s.",
      },
    ],
    a11y: "Canvas carries button semantics with instructions. Focus the field and press Enter or Space to send a pulse.",
    motion:
      "DPR-scaled canvas with IntersectionObserver pausing, and a static frame under reduced motion.",
  },
  {
    slug: "signal",
    source: "lab/Signal.tsx",
    name: "Signal",
    category: "Instruments",
    tagline:
      "A waveform you can scrub — drag horizontally to move the phase, hover to light the bars.",
    usage: `import { Signal } from "mizu-ui";

export function Wave() {
  return <Signal density={14} />;
}`,
    props: [
      {
        name: "density",
        type: "number",
        def: "14",
        desc: "Bar width divisor — lower is denser.",
      },
      {
        name: "speed",
        type: "number",
        def: "1",
        desc: "Auto-advance rate when not dragging.",
      },
    ],
    a11y: "A labelled native range input provides keyboard scrubbing alongside pointer dragging.",
    motion:
      "Pointer capture for drag; phase eases back to auto-advance on release.",
  },
  {
    slug: "ripplesurface",
    source: "lab/RippleSurface.tsx",
    name: "RippleSurface",
    category: "Instruments",
    tagline:
      "An ambient surface that ripples where you touch it — built for hero sections and invite panels.",
    usage: `import { RippleSurface } from "mizu-ui";

export function Hero() {
  return (
    <div style={{ position: "relative" }}>
      <RippleSurface style={{ position: "absolute", inset: 0 }} />
      <h1>Step inside</h1>
    </div>
  );
}`,
    props: [
      {
        name: "auto",
        type: "boolean",
        def: "true",
        desc: "Drop an ambient ripple every 2.6s.",
      },
    ],
    a11y: "aria-hidden — the surface is decorative.",
    motion:
      "Ripples expand and fade on a 1px stroke. Reduced motion paints a static frame.",
  },
  {
    slug: "countup",
    source: "feedback/CountUp.tsx",
    name: "CountUp",
    category: "Feedback",
    tagline:
      "Numbers that count — eased value animation with tabular figures, prefixes and suffixes.",
    usage: `import { CountUp } from "mizu-ui";

export function Stat() {
  return <CountUp value={1284} duration={1.4} suffix="+" />;
}`,
    props: [
      {
        name: "value",
        type: "number",
        desc: "Target value. Animates from the previous value on change.",
      },
      {
        name: "duration",
        type: "number",
        def: "1.2",
        desc: "Animation duration in seconds.",
      },
      {
        name: "delay",
        type: "number",
        def: "0",
        desc: "Start delay in seconds.",
      },
      {
        name: "decimals",
        type: "number",
        def: "0",
        desc: "Fraction digits, clamped to 0–20.",
      },
      {
        name: "prefix / suffix",
        type: "string",
        def: '""',
        desc: "Affixes rendered outside the animation.",
      },
    ],
    a11y: "The final value is separate screen-reader text; the changing visual figures are aria-hidden. Reduced motion renders the final number directly.",
    motion:
      "Quartic ease-out on a rAF loop. Reduced motion sets the value instantly.",
  },
  {
    slug: "copybutton",
    source: "feedback/CopyButton.tsx",
    name: "CopyButton",
    category: "Feedback",
    tagline:
      "Copy to clipboard with a check-morph confirmation and a legacy fallback.",
    usage: `import { CopyButton } from "mizu-ui";

export function Swatch({ hex }: { hex: string }) {
  return <CopyButton text={hex}>{hex}</CopyButton>;
}`,
    props: [
      { name: "text", type: "string", desc: "The string to copy." },
      {
        name: "feedback",
        type: "string",
        def: '"Copied"',
        desc: "Confirmation label shown for 1.4s.",
      },
    ],
    a11y: "aria-label announces the copied state. Clipboard failure is reported explicitly and never claims success.",
    motion:
      "The diamond is replaced by a check; feedback stays visible for 1.4 seconds.",
  },
  {
    slug: "toast",
    source: "feedback/Toast.tsx",
    name: "Toast",
    category: "Feedback",
    tagline:
      "A toast system — provider, imperative API, tones, and a live region for screen readers.",
    usage: `import type { ReactNode } from "react";
import { ToastProvider, useToast } from "mizu-ui";

export function App({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

export function Saver() {
  const { toast } = useToast();
  const notify = () => toast("Notification received", { tone: "success" });
  return <button onClick={notify}>Notify</button>;
}`,
    props: [
      {
        name: "toast",
        type: "(message, options?) => void",
        desc: "Push a toast. options: tone (default | success | error), duration (ms).",
      },
    ],
    a11y: "The viewport is aria-live=polite — toasts are announced without stealing focus.",
    motion:
      "Expo rise on enter, slide-fade on exit. Maximum 4 visible; oldest is replaced.",
  },
  {
    slug: "accordion",
    source: "composite/Accordion.tsx",
    name: "Accordion",
    category: "Composites",
    tagline:
      "Height-animated disclosure with a diamond marker that morphs between states.",
    usage: `import { Accordion, AccordionItem } from "mizu-ui";

export function Faq() {
  return (
    <Accordion>
      <AccordionItem value="a" title="First question">
        The answer, revealed with a 450ms expo height animation.
      </AccordionItem>
    </Accordion>
  );
}`,
    props: [
      {
        name: "allowMultiple",
        type: "boolean",
        def: "false",
        desc: "Allow several items open at once.",
      },
      { name: "value", type: "string", desc: "Item identity." },
      { name: "title", type: "string", desc: "Item heading." },
    ],
    a11y: "Native button with aria-expanded and aria-controls; panel is a labelled region.",
    motion:
      "450ms expo height animation; the marker rotates 45°→0° and scales down when open.",
  },
  {
    slug: "tabs",
    source: "composite/Tabs.tsx",
    name: "Tabs",
    category: "Composites",
    tagline:
      "Controlled or uncontrolled tabs with a sliding underline that travels between triggers.",
    usage: `import { Tabs, TabsList, TabsTrigger, TabsPanel } from "mizu-ui";

export function Switcher() {
  return (
    <Tabs defaultValue="a">
      <TabsList label="Settings">
        <TabsTrigger value="a">General</TabsTrigger>
      </TabsList>
      <TabsPanel value="a">Panel content</TabsPanel>
    </Tabs>
  );
}`,
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        desc: "Controlled value, or the initial value when uncontrolled.",
      },
      {
        name: "onChange",
        type: "(v: string) => void",
        desc: "Fires on selection (uncontrolled and controlled).",
      },
    ],
    a11y: "Full tab pattern: tablist, tab with aria-selected, tabpanel. Inactive triggers are removed from the tab order.",
    motion: "The underline is a layout animation — it slides, it doesn't jump.",
  },
  {
    slug: "dialog",
    source: "composite/Dialog.tsx",
    name: "Dialog",
    category: "Composites",
    tagline:
      "A modal with focus trap, Escape handling, scroll lock and an expo entrance.",
    usage: `import { useState } from "react";
import { Button, Dialog, DialogTitle, DialogBody, DialogFooter, DialogClose } from "mizu-ui";

export function Modal() {
  const [open, setOpen] = useState(false);
  return (
    <>
    <Button onClick={() => setOpen(true)}>Open dialog</Button>
    <Dialog open={open} onOpenChange={setOpen} label="Archive notice">
      <DialogClose />
      <DialogTitle>Release when ready</DialogTitle>
      <DialogBody>…</DialogBody>
      <DialogFooter><Button onClick={() => setOpen(false)}>Close</Button></DialogFooter>
    </Dialog>
    </>
  );
}`,
    props: [
      {
        name: "open / onOpenChange",
        type: "boolean / fn",
        desc: "Controlled open state.",
      },
      {
        name: "label",
        type: "string",
        desc: "Accessible name for the dialog.",
      },
    ],
    a11y: "Native showModal supplies background inertness and focus containment. Escape requests close, focus returns to the trigger and body scroll is locked. Local themes are preserved.",
    motion:
      "A CSS expo entrance communicates opening. Reduced motion removes the entrance.",
  },
  {
    slug: "nav",
    source: "composite/Nav.tsx",
    name: "Nav",
    category: "Composites",
    tagline:
      "The thread header — scroll progress with a diamond node, chapter tracking, and a full-screen mobile menu.",
    usage: `import { Nav } from "mizu-ui";

export function Shell() {
  return (
    <Nav
      brand={<strong>MIZU.</strong>}
      links={[{ href: "/", label: "Home" }]}
      currentPath="/"
    />
  );
}`,
    props: [
      { name: "brand", type: "ReactNode", desc: "Logo or wordmark." },
      {
        name: "links",
        type: "{ href, label }[]",
        desc: "Primary navigation links.",
      },
      {
        name: "currentPath",
        type: "string",
        desc: "Current path for active state. Defaults to window.location.pathname.",
      },
      {
        name: "trackChapters",
        type: "boolean",
        def: "true",
        desc: "Observe [data-chapter] sections and show the current chapter.",
      },
    ],
    a11y: "Semantic header/nav; mobile menu uses native modal focus containment, locks scroll, and closes on Escape.",
    motion:
      "Progress line is a spring-smoothed scroll link; the chapter label crossfades; the mobile menu is a full-screen fade.",
  },
];

export const COMPONENTS: ComponentMeta[] = [...ORIGINAL_COMPONENTS, ...CATALOG];
export const SYSTEMS = COMPONENTS.filter((c) => c.kind !== "overview");

export function getComponent(slug: string): ComponentMeta | undefined {
  return COMPONENTS.find((c) => c.slug === slug);
}
