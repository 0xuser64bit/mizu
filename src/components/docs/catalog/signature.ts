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
  s({
    name: "TrendChart",
    source: "TrendChart.tsx",
    tagline:
      "Values over time as an instrument: a live legend that reads the crosshair, drag-to-measure deltas, annotations, thresholds and linked views.",
    example:
      '  const day = (d: number) => Date.UTC(2026, 8, d);\n  return <TrendChart label="Weekly active teams" utc series={[{id:"teams",label:"Teams",area:true,data:[{x:day(1),y:412},{x:day(2),y:436},{x:day(3),y:431},{x:day(4),y:478},{x:day(5),y:502},{x:day(6),y:497},{x:day(7),y:540}]}]} />;',
    props: [
      p("label", "string", "Accessible name and visible title."),
      p(
        "series",
        "TrendSeries[]",
        "id, label, data of { x, y } (null y leaves a gap), tone, area and dashed.",
      ),
      p(
        "annotations / thresholds",
        "TrendAnnotation[] / TrendThreshold[]",
        "Numbered moments with detail; labelled reference values such as an SLO.",
      ),
      p(
        "format / formatX",
        "(value: number) => string",
        "Value and x formatting. Values default to compact numbers; x to time stamps.",
      ),
      p(
        "xType",
        '"time" | "number"',
        "How x is scaled and labelled.",
        '"time"',
      ),
      p(
        "utc / height / zero",
        "boolean / number / boolean",
        "UTC time, plot height and a zero baseline (on for areas).",
      ),
      p(
        "domain / defaultDomain / onDomainChange",
        "[number, number]",
        "Visible x range. Share it between charts to zoom them together.",
      ),
      p(
        "cursor / onCursorChange",
        "number | null",
        "Crosshair position. Share it to read several charts at once.",
      ),
      p("loading / empty", "boolean / ReactNode", "Loading and empty states."),
    ],
    a11y: "The plot is a focusable chart group: arrow keys step through readings and each reading is announced with every series. Shift extends a measured period. The legend is a set of toggle buttons that always keeps one series visible. A table view presents the visible readings as a real table.",
    motion:
      "Lines draw from left to right on first view and areas fade in after them. Zooms glide; the value axis eases to the visible data. Reduced motion shows the finished chart and changes instantly.",
    keys: [
      {
        keys: "← →",
        action: "Read the previous or next value (Alt: ten at a time)",
      },
      { keys: "Shift + ← →", action: "Extend a measured period" },
      { keys: "Enter", action: "Zoom to the measured period" },
      { keys: "+ −", action: "Zoom around the crosshair" },
      { keys: "0", action: "Show the whole range (or double-click)" },
      { keys: "Esc", action: "Clear the crosshair and measurement" },
      { keys: "Ctrl + scroll", action: "Zoom at the pointer" },
    ],
  }),
  s({
    name: "Waveform",
    source: "Waveform.tsx",
    tagline:
      "Audio you can see and scrub: a waveform over a native audio element, with chapters, speed, skips and an imperative handle.",
    example:
      '  return <Waveform src="/audio/calibration.wav" label="Calibration tone, 440 Hz" />;',
    props: [
      p("src / label", "string", "Playable source and accessible name."),
      p(
        "peaks",
        "number[]",
        "Normalised 0–1 amplitudes. Omit to decode from the source (same-origin or CORS-enabled).",
      ),
      p(
        "markers",
        "WaveformMarker[]",
        "Chapters or comments: id, time in seconds and label. Listed beneath with durations.",
      ),
      p(
        "duration",
        "number",
        "Seconds to show before the media reports its own.",
      ),
      p(
        "rates / height",
        "number[] / number",
        "Speed cycle and waveform height.",
        "[1, 1.25, 1.5, 2] / 72",
      ),
      p(
        "onTimeUpdate / onPlayingChange",
        "function",
        "Follow playback, e.g. to highlight a transcript.",
      ),
      p(
        "ref",
        "WaveformHandle",
        "play(), pause() and seek(seconds) for external controls.",
      ),
    ],
    a11y: "The waveform is a slider with readable time (“1:14 of 42:10”); arrows seek five seconds, Shift thirty. Play, skip and speed are labelled buttons, chapters are a real list with the current one marked. A failed source is announced with a retry. Letter shortcuts only apply while focus is inside the player.",
    motion:
      "The waveform prints left to right once measured; while decoding, bars breathe in a travelling wave. The play glyph morphs into pause. Reduced motion keeps every state and removes the travel.",
    keys: [
      { keys: "Space K", action: "Play or pause (on the waveform)" },
      { keys: "← →", action: "Seek five seconds (Shift: thirty)" },
      { keys: "J L", action: "Back or forward ten seconds" },
      { keys: "[ ]", action: "Previous or next chapter" },
      { keys: "Home End", action: "Start or end" },
    ],
  }),
];
