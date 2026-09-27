import { signature as s, prop as p } from "./define";

export const SIGNATURE = [
  s({
    name: "Chronicle",
    source: "Chronicle.tsx",
    tagline:
      "A zoomable, multi-lane timeline for incidents, releases and audit trails — spans, instants, a playhead and an overview brush.",
    example:
      '  const at = (h: number, m: number) => Date.UTC(2026, 8, 27, h, m);\n  return <Chronicle label="Checkout incident" utc lanes={[{id:"deploys",label:"Deploys"},{id:"api",label:"API"},{id:"alerts",label:"Alerts"}]} events={[{id:"deploy",lane:"deploys",start:at(14,2),label:"Deploy v2.41",tone:"accent",detail:"Canary promoted to every region."},{id:"latency",lane:"api",start:at(14,6),end:at(14,31),label:"p95 above 2s",tone:"danger"},{id:"page",lane:"alerts",start:at(14,9),label:"On-call paged",tone:"warning"},{id:"rollback",lane:"deploys",start:at(14,24),label:"Rollback",tone:"success"}]} />;',
    props: [
      p("label", "string", "Accessible name and visible heading."),
      p(
        "events",
        "ChronicleEvent[]",
        "id, lane, start, optional end (omit for an instant), label, tone and detail content.",
      ),
      p(
        "lanes",
        "ChronicleLane[]",
        "Lane order and names. Derived from the events when omitted.",
      ),
      p(
        "range / defaultRange / onRangeChange",
        "[number, number]",
        "Visible interval in ms. Fits every event until the viewer moves.",
      ),
      p(
        "cursor / defaultCursor / onCursorChange",
        "number",
        "Playhead time. Supply either to show it and drive other views.",
      ),
      p(
        "selected / defaultSelected / onSelectedChange",
        "string | null",
        "Selected event id; its detail opens beneath the lanes.",
      ),
      p("now", "number | Date", "Marks the present."),
      p("utc", "boolean", "Align and label time in UTC.", "false"),
      p("minSpan", "number", "Smallest visible interval in ms.", "1000"),
      p("loading / empty", "boolean / ReactNode", "Loading and empty states."),
    ],
    a11y: "The viewport is a focusable region with keyboard panning and zoom. Events form a listbox grouped by lane; each option names its label, time and duration, and selection is announced. The playhead is a slider with readable time. The overview brush is a pointer shortcut — every action has a keyboard path.",
    motion:
      "Events sweep in left to right on first view. Button and keyboard zooms glide in log space so scale changes feel even; drags pan directly and coast to rest. Reduced motion removes the sweep, glide and coasting.",
    keys: [
      { keys: "← →", action: "Pan the viewport (Shift for larger steps)" },
      { keys: "+ −", action: "Zoom around the playhead or centre" },
      { keys: "0", action: "Fit every event" },
      { keys: "Home End", action: "Jump to the first or last events" },
      { keys: "Ctrl + scroll", action: "Zoom at the pointer (pinch on touch)" },
      {
        keys: "← → ↑ ↓",
        action: "On an event: move through a lane, change lanes",
      },
      { keys: "Enter · Esc", action: "Select an event · clear selection" },
    ],
  }),
];
