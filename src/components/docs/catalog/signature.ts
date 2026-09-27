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
        "range / defaultRange / onRangeChange",
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
  s({
    name: "Plane",
    source: "Plane.tsx",
    tagline:
      "An infinite, zoomable surface for boards, maps and diagrams — inertia, pinch, a minimap and a camera that follows keyboard focus.",
    example:
      '  const [notes,setNotes]=useState([{id:"a",x:0,y:0,text:"Research"},{id:"b",x:260,y:90,text:"Prototype"},{id:"c",x:90,y:260,text:"Ship it"}]);\n  return <Plane label="Planning board">{notes.map(n=><PlaneItem key={n.id} id={n.id} x={n.x} y={n.y} width={200} label={n.text} onMove={(x,y)=>setNotes(all=>all.map(a=>a.id===n.id?{...a,x,y}:a))}><p style={{margin:0,padding:18,background:"var(--mizu-ink-2)",border:"1px solid var(--mizu-line-bright)"}}>{n.text}</p></PlaneItem>)}</Plane>;',
    imports: "Plane, PlaneItem",
    props: [
      p(
        "label / children",
        "string / ReactNode",
        "Accessible name and world content (usually PlaneItems).",
      ),
      p(
        "view / defaultView / onViewChange",
        "{ x, y, zoom }",
        "Camera: the world point at the centre and the zoom. Frames the content by default.",
      ),
      p("minZoom / maxZoom", "number", "Zoom limits.", "0.15 / 4"),
      p(
        "grid / minimap / coordinates",
        '"dots" | "lines" | "none" / boolean / boolean',
        "Surface texture and instruments.",
        '"dots" / true / true',
      ),
      p("tools", "ReactNode", "Extra toolbar controls beside zoom and Fit."),
      p(
        "ref",
        "PlaneHandle",
        "fit(), zoomBy(factor), flyTo(box | point) and toWorld(clientX, clientY).",
      ),
      p(
        "PlaneItem: id / x / y / width / height / label",
        "string / number",
        "World position and size; measured when width or height is omitted.",
      ),
      p(
        "PlaneItem: onMove / onMoveEnd",
        "(x, y) => void",
        "Makes the item draggable and nudgeable.",
      ),
    ],
    a11y: "The viewport is a focusable canvas group with keyboard travel and zoom. Items are named groups in reading order; tabbing to one flies the camera to it. Draggable items nudge with arrow keys. Plain scrolling only pans once the canvas is active, so the page never traps the wheel; a hint explains Ctrl-scroll.",
    motion:
      "The camera glides in log space and pulls back on long flights before settling in; drags coast to rest with inertia. The zoom-adaptive dot grid re-densifies as you scale. Reduced motion jumps directly and removes coasting.",
    keys: [
      { keys: "← → ↑ ↓", action: "Travel (Shift for larger steps)" },
      { keys: "+ −", action: "Zoom" },
      { keys: "0 · 1", action: "Fit everything · 100%" },
      { keys: "Tab", action: "Next item — the view follows" },
      {
        keys: "← → ↑ ↓",
        action: "On a draggable item: nudge it (Shift: 48px)",
      },
      {
        keys: "Ctrl + scroll",
        action: "Zoom at the pointer; double-click zooms in",
      },
    ],
  }),
  s({
    name: "FlowGraph",
    source: "FlowGraph.tsx",
    tagline:
      "A node-and-wire editor: drag, wire with magnetic ports or the keyboard, refuse bad connections, watch runs flow and tidy into layers.",
    example:
      '  const [nodes,setNodes]=useState<FlowNode[]>([{id:"a",x:0,y:0,kind:"Trigger",label:"Form submitted",inputs:[]},{id:"b",x:320,y:0,kind:"Action",label:"Create ticket"},{id:"c",x:640,y:0,kind:"Email",label:"Confirm receipt",outputs:[]}]);\n  const [edges,setEdges]=useState<FlowEdge[]>([{id:"ab",source:"a",target:"b"}]);\n  return <FlowGraph label="Support intake" nodes={nodes} edges={edges} onNodesChange={setNodes} onEdgesChange={setEdges} />;',
    imports: "FlowGraph, type FlowNode, type FlowEdge",
    props: [
      p("label", "string", "Accessible name of the canvas."),
      p(
        "nodes / onNodesChange",
        "FlowNode[] / function",
        "id, x, y, label, kind, description, inputs, outputs and status. Omit the callback for a fixed layout.",
      ),
      p(
        "edges / onEdgesChange",
        "FlowEdge[] / function",
        "source, target, optional ports and label. Omit the callback to prevent wiring.",
      ),
      p(
        "selected / defaultSelected / onSelectedChange",
        "string | null",
        "Selected node or connection id.",
      ),
      p(
        "validateConnection",
        "(edge) => boolean | string",
        "Refuse a wire; a string explains why.",
      ),
      p(
        "renderNode / nodeWidth",
        "(node) => ReactNode / number",
        "Custom node heading and width.",
        "— / 232",
      ),
      p(
        "tidyFlow(nodes, edges)",
        "function",
        "The layered layout behind Tidy, for positioning stored graphs.",
      ),
    ],
    a11y: "Nodes are named groups whose description lists what they receive from and send to. Output ports start a connection with Enter; input ports then become tabbable targets and Enter connects. Connections are focusable buttons. Refusals are alerts; connections and removals are announced.",
    motion:
      "Selection brackets snap in around a node, running nodes scan, and their outgoing wires carry flowing dashes. Wiring snaps magnetically to the nearest input. Tidy animates every node and wire together into layers, then frames the result.",
    keys: [
      { keys: "Enter", action: "On an output: start a connection" },
      { keys: "Tab · Enter", action: "Reach an input · connect" },
      { keys: "Esc", action: "Cancel a connection" },
      { keys: "Delete", action: "Remove the selected node or connection" },
      { keys: "← → ↑ ↓", action: "Nudge the focused node" },
    ],
  }),
  s({
    name: "Treemap",
    source: "Treemap.tsx",
    tagline:
      "A hierarchy by size that you enter like a place: squarified blocks, a camera that moves inside, nested previews, heat and a path back out.",
    example:
      '  return <Treemap label="Storage" format={v=>`${v} GB`} data={{id:"all",label:"All",children:[{id:"media",label:"Media",children:[{id:"video",label:"Video",value:420},{id:"photos",label:"Photos",value:180}]},{id:"backups",label:"Backups",value:240},{id:"docs",label:"Documents",value:96}]}} />;',
    props: [
      p(
        "label / data",
        "string / TreemapNode",
        "Accessible name and root. Nodes have id, label, value (leaves), children, tone and detail.",
      ),
      p(
        "format",
        "(value: number) => string",
        "Value formatting for blocks, path and readout.",
      ),
      p(
        "path / defaultPath / onPathChange",
        "string[]",
        "Ids from the root's child to the opened node.",
      ),
      p("onSelect", "(node, path) => void", "A leaf was chosen."),
      p(
        "heat",
        "(node) => number | undefined",
        "0–1 intensity mixed into a block, e.g. growth or error rate.",
      ),
      p("height", "number", "Stage height in pixels.", "440"),
      p(
        "squarify(items, box)",
        "function",
        "The layout itself, for custom renderers.",
      ),
    ],
    a11y: "Blocks are buttons named with their value, share of the level and contents. Arrow keys move to the nearest block in that direction; Enter opens a branch or chooses a leaf, Backspace returns. The path is a navigation list with the current level marked; openings are announced and focus lands on the largest block inside.",
    motion:
      "Opening a block is a camera move: it grows to fill the stage while its neighbours fly outward and the next level resolves inside it. Returning plays the same path in reverse. Only geometry animates, so text never distorts. Reduced motion changes level instantly.",
    keys: [
      { keys: "← → ↑ ↓", action: "Move to the neighbouring block" },
      { keys: "Enter", action: "Open a block, or choose a leaf" },
      { keys: "Backspace Esc", action: "Return to the level above" },
    ],
  }),
];
