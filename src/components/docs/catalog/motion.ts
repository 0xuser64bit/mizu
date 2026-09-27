import { define as d, prop as p } from "./define";
export const MOTION = [
  d(
    "Presence",
    "Motion",
    "motion/Presence.tsx",
    "A keyed state enters after the previous state has made room.",
    '  const [saved,setSaved]=useState(false);\n  return <Stack gap={20}><Button size="sm" onClick={()=>setSaved(!saved)}>Change state</Button><Presence presenceKey={String(saved)}><Alert title={saved ? "Changes saved" : "Draft in progress"} tone={saved ? "success" : "neutral"}>{saved ? "The current draft is ready for review." : "Keep shaping the idea."}</Alert></Presence></Stack>;',
    [
      p(
        "presenceKey",
        "string | number",
        "Stable identity of the visible state.",
      ),
      p(
        "children / className",
        "ReactNode / string",
        "The changing content and wrapper styling.",
      ),
    ],
    "Content stays in document order. Do not move a focused control between keyed states; use persistent controls outside Presence.",
    "AnimatePresence waits for exit and displays the latest state. Reduced motion replaces content without travel.",
    "Presence, Stack, Button, Alert",
  ),
  d(
    "Tilt",
    "Motion",
    "motion/Tilt.tsx",
    "A restrained depth response to the pointer, returning cleanly to rest.",
    '  return <Tilt max={5}><Frame><p className="mizu-field-hint">POINTER STUDY</p><h3 style={{fontSize:36,letterSpacing:"-.04em",margin:"20px 0"}}>A little depth.</h3><p className="mizu-field-hint">Move across the surface. The reading order and hit targets stay familiar.</p></Frame></Tilt>;',
    [
      p("max", "number", "Maximum tilt in degrees, clamped to 0–20.", "6"),
      p(
        "children / className",
        "ReactNode / string",
        "Surface content and styling.",
      ),
    ],
    "Pointer-mouse enhancement only. Touch and keyboard receive a stable surface; no essential information is pointer-dependent.",
    "Motion springs settle on leave. Reduced motion disables rotation.",
    "Tilt, Frame",
  ),
  d(
    "Parallax",
    "Motion",
    "motion/Scroll.tsx",
    "A bounded depth cue linked to the surface's actual position in the viewport.",
    '  return <Parallax distance={35}><ImageFigure src="/images/field.svg" alt="A field of measurement diamonds" caption="Scroll the page to study the relationship." width={720} height={360} /></Parallax>;',
    [
      p(
        "distance",
        "number",
        "Travel around rest in pixels, bounded to ±120.",
        "40",
      ),
      p(
        "children / className",
        "ReactNode / string",
        "Prefer decorative media and stable surrounding text.",
      ),
    ],
    "No essential information depends on movement. Overflow contains the visual travel; children retain their own semantics.",
    "Motion's managed scroll subscription maps start/end positions directly. Reduced motion shows the resting state.",
    "Parallax, ImageFigure",
  ),
  d(
    "ScrollProgress",
    "Motion",
    "motion/Scroll.tsx",
    "A thin reading indicator driven by real document scroll progress.",
    '  return <Stack gap={20}><ScrollProgress label="Documentation reading progress" /><p className="mizu-field-hint">Scroll this document. The line measures the available document scroll, including the API below.</p></Stack>;',
    [
      p("label", "string", "Accessible progress name.", '"Reading progress"'),
      p("className", "string", "Optional placement and styling."),
    ],
    "Named progressbar exposes a bounded 0–100 value. No fabricated reading time or completion state.",
    "A managed Motion scroll value updates the line directly; the announced percentage updates only on integer changes.",
    "ScrollProgress, Stack",
  ),
];
