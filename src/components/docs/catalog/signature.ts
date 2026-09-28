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
  s({
    name: "Board",
    source: "Board.tsx",
    tagline:
      "A kanban board with lift-and-carry dragging, cards that part and fly into place, advisory limits, collapsible columns and a full keyboard path.",
    example:
      '  const [cards,setCards]=useState<BoardCard[]>([{id:"a",column:"todo",title:"Draft the announcement",meta:"2d"},{id:"b",column:"todo",title:"Record the demo"},{id:"c",column:"done",title:"Pick a launch date",assignee:"Rin Sato"}]);\n  return <Board label="Launch" columns={[{id:"todo",title:"To do"},{id:"doing",title:"Doing",limit:2},{id:"done",title:"Done"}]} cards={cards} onCardsChange={setCards} />;',
    imports: "Board, type BoardCard",
    props: [
      p(
        "label / columns",
        "string / BoardColumn[]",
        "Region name; columns have id, title and an optional advisory limit.",
      ),
      p(
        "cards / onCardsChange",
        "BoardCard[] / function",
        "id, column, title, meta, tags, assignee and tone. Order within a column follows array order. Omit the callback for a fixed board.",
      ),
      p(
        "renderCard",
        "(card) => ReactNode",
        "Replace the default card body; dragging and keyboard behaviour stay.",
      ),
      p(
        "onCardOpen / onAddCard",
        "(card) => void / (column) => void",
        "Enter or double-click opens; an add button per column.",
      ),
      p(
        "moveCard(cards, id, column, index)",
        "function",
        "The same reorder used internally, for your own commands.",
      ),
    ],
    a11y: "Cards are buttons described as draggable. Space picks one up and announces its column and position; arrows move it between positions and columns, Space drops, Escape restores it. Each column states its count and limit; being over a limit is written, not only coloured. Touch drags start from a grip so the page still scrolls.",
    motion:
      "A picked-up card lifts and tilts while its neighbours part to open a slot; carried near an edge, the board scrolls itself. On drop the card flies from your hand into its new place through a shared layout transition. Reduced motion moves cards without travel.",
    keys: [
      { keys: "Space", action: "Pick up or drop the focused card" },
      { keys: "↑ ↓", action: "While holding: move within the column" },
      { keys: "← →", action: "While holding: move to the next column" },
      { keys: "Esc", action: "Put the card back" },
      { keys: "Enter", action: "Open the card" },
    ],
  }),
  s({
    name: "Outliner",
    source: "Outliner.tsx",
    tagline:
      "A keyboard-first outline: Enter splits, Tab restructures, whole branches move and fold, and any item can be zoomed into until it becomes the title.",
    example:
      '  const [items,setItems]=useState<OutlineItem[]>([{id:"a",text:"Plan the launch",children:[{id:"b",text:"Name an owner",done:true},{id:"c",text:"Rehearse the rollback"}]},{id:"d",text:"Write the announcement"}]);\n  return <Outliner label="Launch" items={items} onItemsChange={setItems} />;',
    imports: "Outliner, type OutlineItem",
    props: [
      p(
        "label",
        "string",
        "Accessible name and the root of the location trail.",
      ),
      p(
        "items / defaultItems / onItemsChange",
        "OutlineItem[]",
        "A tree of id, text, done, collapsed and children. Every edit returns a fresh tree.",
      ),
      p(
        "placeholder",
        "string",
        "Prompt for the first line.",
        '"Write a line…"',
      ),
      p(
        "createId",
        "() => string",
        "Id factory for new lines; defaults to a random id.",
      ),
    ],
    a11y: "Each line is a labelled text field that states its level and position; done and folded states are described. Every structural command is a key chord with an announcement. The location trail is a navigation landmark; focusing into an item moves focus to its first line.",
    motion:
      "Lines slide to their new level or place, open and close in height, and a focused item's text grows into the page title through a shared layout transition; stepping out reverses it. The active thread is traced in accent. Reduced motion changes structure instantly.",
    keys: [
      {
        keys: "Enter · Shift + Enter",
        action: "New line (splits at the caret) · line break",
      },
      {
        keys: "Tab · Shift + Tab",
        action: "Indent · outdent with descendants",
      },
      { keys: "Alt + ↑ ↓", action: "Move the branch among its siblings" },
      { keys: "⌘/Ctrl + Enter", action: "Mark done" },
      { keys: "⌘/Ctrl + ↑ ↓", action: "Fold or unfold" },
      { keys: "Alt + → ←", action: "Focus on the item · step back out" },
      { keys: "Backspace", action: "At the start: merge with the line above" },
    ],
  }),
  s({
    name: "QueryBuilder",
    source: "QueryBuilder.tsx",
    tagline:
      "Conditions that read as a sentence: typed operators per field, nested any/all groups, a plain-language reading and an evaluator for local filtering.",
    example:
      '  const [query,setQuery]=useState<QueryGroup>({id:"root",combinator:"and",rules:[{id:"a",field:"plan",operator:"is",value:"pro"}]});\n  return <QueryBuilder label="Audience" value={query} onValueChange={setQuery} fields={[{id:"plan",label:"Plan",type:"select",options:[{value:"free",label:"Free"},{value:"pro",label:"Pro"}]},{id:"seats",label:"Seats",type:"number"},{id:"joined",label:"Joined",type:"date"}]} />;',
    imports: "QueryBuilder, type QueryGroup",
    props: [
      p(
        "label / fields",
        "string / QueryField[]",
        "Region name; fields have id, label, type (text, number, date, select, boolean), options and unit.",
      ),
      p(
        "value / defaultValue / onValueChange",
        "QueryGroup",
        "The query: a combinator and rules or nested groups.",
      ),
      p("maxDepth", "number", "Group nesting limit.", "3"),
      p("footer", "ReactNode", "Beside the reading, e.g. a live match count."),
      p(
        "describeQuery(query, fields)",
        "function",
        "The plain-language reading, for saved segments.",
      ),
      p(
        "matchesQuery(query, record, fields, now?)",
        "function",
        "Evaluate a record locally; incomplete rules are ignored.",
      ),
    ],
    a11y: "Each group is a fieldset; the all/any choice is a real radio group. Every condition is a named group of native selects and inputs with specific labels, and an incomplete condition is described in words. Additions and removals are announced, and a new condition receives focus.",
    motion:
      "New conditions unfold from the left, removed ones close, and the and/or joins roll over like a counter when a group's logic changes. Reduced motion shows each change immediately.",
  }),
  s({
    name: "Annotator",
    source: "Annotator.tsx",
    tagline:
      "Review pins on anything: drop numbered pins, discuss in threads, resolve and reopen, and find every conversation in the list beside the work.",
    example:
      '  const [notes,setNotes]=useState<Annotation[]>([{id:"a",x:0.3,y:0.4,author:"Rin",body:"Can this headline be shorter?"}]);\n  return <Annotator label="Homepage" author="You" annotations={notes} onAnnotationsChange={setNotes}><img src="/images/field.svg" alt="Homepage draft" /></Annotator>;',
    imports: "Annotator, type Annotation",
    props: [
      p(
        "label / children",
        "string / ReactNode",
        "Region name and the work under review: an image, a page or a live composition.",
      ),
      p(
        "annotations / defaultAnnotations / onAnnotationsChange",
        "Annotation[]",
        "id, x and y (0–1 of the surface), author, body, time, resolved and replies.",
      ),
      p(
        "author / now",
        "string",
        "Name and time label for new comments and replies. Omit author for read-only review.",
      ),
      p(
        "selected / defaultSelected / onSelectedChange",
        "string | null",
        "The open thread.",
      ),
      p("createId", "() => string", "Id factory for new comments and replies."),
    ],
    a11y: "Pins are buttons named with their number, author, state and text, in reading order; threads are labelled dialogs that return focus to their pin. C toggles comment mode, where Enter places a pin that arrow keys (or Alt+arrows while typing) move before posting. Every action is announced; the comment list offers the same threads without the surface.",
    motion:
      "Pins drop in on a spring and send out a single impact ring. Threads unfold from the side of their pin; a pin being placed breathes until it is posted. Resolving settles the pin into a quiet outline. Reduced motion places and opens everything directly.",
    keys: [
      { keys: "C", action: "Toggle comment mode" },
      { keys: "Enter", action: "In comment mode: place a pin at the centre" },
      {
        keys: "Alt + ← → ↑ ↓",
        action: "While writing: move the new pin (Shift: further)",
      },
      { keys: "⌘/Ctrl + Enter", action: "Post the comment or reply" },
      { keys: "← → ↑ ↓", action: "On a pin: move it" },
      { keys: "Esc", action: "Close the thread or discard the draft" },
    ],
  }),
];
