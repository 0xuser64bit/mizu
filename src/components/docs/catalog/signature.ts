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
      '  const src = "/audio/calibration.wav"; // an audio file your app serves\n  return <Waveform src={src} label="Calibration tone, 440 Hz" />;',
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
      '  return <FlowGraph label="Support intake" defaultNodes={[{id:"a",x:0,y:0,kind:"Trigger",label:"Form submitted",inputs:[]},{id:"b",x:320,y:0,kind:"Action",label:"Create ticket"},{id:"c",x:640,y:0,kind:"Email",label:"Confirm receipt",outputs:[]}]} defaultEdges={[{id:"ab",source:"a",target:"b"}]} />;',
    imports: "FlowGraph",
    props: [
      p("label", "string", "Accessible name of the canvas."),
      p(
        "nodes / defaultNodes / onNodesChange",
        "FlowNode[]",
        "id, x, y, label, kind, description, inputs, outputs and status.",
      ),
      p(
        "edges / defaultEdges / onEdgesChange",
        "FlowEdge[]",
        "source, target, optional ports and label.",
      ),
      p(
        "readOnly",
        "boolean",
        "Watch only: no dragging, wiring, tidying or deleting.",
        "false",
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
      '  return <Board label="Launch" columns={[{id:"todo",title:"To do"},{id:"doing",title:"Doing",limit:2},{id:"done",title:"Done"}]} defaultCards={[{id:"a",column:"todo",title:"Draft the announcement",meta:"2d"},{id:"b",column:"todo",title:"Record the demo"},{id:"c",column:"done",title:"Pick a launch date",assignee:"Rin Sato"}]} />;',
    imports: "Board",
    props: [
      p(
        "label / columns",
        "string / BoardColumn[]",
        "Region name; columns have id, title and an optional advisory limit.",
      ),
      p(
        "cards / defaultCards / onCardsChange",
        "BoardCard[]",
        "id, column, title, meta, tags, assignee and tone. Order within a column follows array order.",
      ),
      p("readOnly", "boolean", "Cards open but cannot be moved.", "false"),
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
      '  // Stand-in art, so the example runs anywhere: use your own images.\n  const field = (ground: string, mark: string) =>\n    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360"><pattern id="d" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M18 13l5 5-5 5-5-5z" fill="${mark}"/></pattern><rect width="720" height="360" fill="${ground}"/><rect width="720" height="360" fill="url(#d)"/></svg>`)}`;\n  const [notes,setNotes]=useState<Annotation[]>([{id:"a",x:0.3,y:0.4,author:"Rin",body:"Can this headline be shorter?"}]);\n  return <Annotator label="Homepage" author="You" annotations={notes} onAnnotationsChange={setNotes}><img src={field("#141413", "#7e776b")} alt="Homepage draft" /></Annotator>;',
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
  s({
    name: "Tour",
    source: "Tour.tsx",
    tagline:
      "A guided tour whose spotlight travels between real elements, follows them through scrolling and reflow, and explains each one beside it.",
    example:
      '  const [open,setOpen]=useState(false);\n  return <><button type="button" id="tour-start" className="mizu-text-button" onClick={()=>setOpen(true)}>Take the tour</button><Tour open={open} onOpenChange={setOpen} steps={[{target:"#tour-start",title:"This started the tour",body:"Each step points at a real element on the page."}]} /></>;',
    props: [
      p(
        "steps",
        "TourStep[]",
        "target (selector or function), title, body, placement and padding.",
      ),
      p(
        "open / onOpenChange",
        "boolean / function",
        "Controlled visibility; Escape and Skip request closing.",
      ),
      p("step / defaultStep / onStepChange", "number", "The current step."),
      p(
        "onFinish",
        "() => void",
        "Called when the last step is completed, not when skipped.",
      ),
      p("label", "string", "Accessible name of the tour.", '"Product tour"'),
    ],
    a11y: "A native modal dialog: the page becomes inert, focus stays on the tour's primary action and returns afterwards, Escape leaves. Each step is announced with its position; arrow keys move between steps. When a step's element is missing, the card centres itself and says so.",
    motion:
      "The spotlight pursues each new element — even while it scrolls into view — framed by accent corner brackets, while the card travels to the side with room and its copy fades in. Progress diamonds grow at the current step. Reduced motion moves the spotlight directly.",
    keys: [
      { keys: "→ · Enter", action: "Next step" },
      { keys: "←", action: "Previous step" },
      { keys: "Esc", action: "Leave the tour" },
    ],
  }),
  s({
    name: "Interview",
    source: "Interview.tsx",
    tagline:
      "A conversation instead of a form: one question at a time, letter keys for choices, branching, a review before sending and an honest submit.",
    example:
      '  return <Interview label="Feedback" onSubmit={(answers) => localStorage.setItem("mizu-feedback", JSON.stringify(answers))} questions={[{id:"role",title:"What do you do most days?",type:"choice",required:true,options:[{value:"design",label:"Design"},{value:"code",label:"Engineering"}]},{id:"score",title:"How was your week?",type:"scale",min:1,max:5},{id:"note",title:"Anything else?",type:"long"}]} />;',
    props: [
      p(
        "label / questions",
        "string / InterviewQuestion[]",
        "id, title, description, type (text, long, email, number, choice, multi, scale, yesno), options, required, min, max, validate and next.",
      ),
      p(
        "answers / defaultAnswers / onAnswersChange",
        "Record<string, InterviewAnswer>",
        "Answers by question id.",
      ),
      p(
        "onSubmit",
        "(answers) => void | Promise",
        "Resolve to finish; throw to keep everything and offer a retry.",
      ),
      p(
        "intro / done",
        "{ title, body, start } / ReactNode",
        "Optional welcome screen and the completion message.",
      ),
      p(
        "submitLabel",
        "string",
        "The review screen's action.",
        '"Send answers"',
      ),
    ],
    a11y: "Each question is a labelled form; focus moves to its first field. Choices are real radio or checkbox groups with letter shortcuts as an enhancement; the scale is a radio group. Errors are alerts linked to the field. Progress is a progressbar, and each new question, the review and the result are announced.",
    motion:
      "Questions rise in going forward and settle downward going back. A single choice blinks twice to confirm and moves on by itself; a rejected answer shakes once. The progress hairline stretches and a diamond seal turns into place when it is sent. Reduced motion keeps every state without travel or blinking.",
    keys: [
      { keys: "Enter", action: "Continue (Ctrl + Enter in long answers)" },
      { keys: "A B C …", action: "Choose an option; multiple choice toggles" },
      { keys: "Y N", action: "Answer a yes-or-no question" },
      { keys: "1 … 9 0", action: "Pick a score (0 is ten)" },
    ],
  }),
  s({
    name: "TransferQueue",
    source: "TransferQueue.tsx",
    tagline:
      "Uploads you can watch and steer: a concurrency-limited queue around your own transfer function, with live speed, time left, pause, retry and cancel.",
    example:
      '  return <TransferQueue label="Local reads" transfer={async (file, { signal, onProgress }) => { const reader = file.stream().getReader(); let loaded = 0; for (;;) { const { done, value } = await reader.read(); if (done) return; if (signal.aborted) { await reader.cancel(); throw new DOMException("Stopped", "AbortError"); } loaded += value.byteLength; onProgress(loaded); } }} />;',
    props: [
      p("label", "string", "Region name; also names the drop zone."),
      p(
        "transfer",
        "(file, { signal, onProgress }) => Promise",
        "Your upload or per-file task. Honour the signal for pause and cancel; report loaded bytes. For upload progress use XMLHttpRequest's upload.onprogress — fetch cannot report it.",
      ),
      p("concurrency", "number", "Transfers running at once.", "2"),
      p(
        "accept / maxSize",
        "string / number",
        "Validation applied by the drop zone before anything is queued.",
      ),
      p(
        "onComplete / onItemsChange",
        "function",
        "One finished file; the whole queue after any change.",
      ),
      p(
        "ref",
        "TransferQueueHandle",
        "add(files) — queue files from paste handlers or other sources.",
      ),
    ],
    a11y: "Files arrive through the existing FileDropzone (a real button and file input, with validation errors as alerts). Each transfer is a progressbar whose value text reads its percentage, speed and time left; failures are alerts; every action names its file. Queueing, finishing, failing and cancelling are announced.",
    motion:
      "Rows slide in as files are queued and close when cleared. Progress moves continuously, batched to one update per frame; the colour changes with state and a check diamond pops on completion. The overall bar and throughput trace keep pace. Reduced motion removes the travel.",
  }),
  s({
    name: "TriageDeck",
    source: "TriageDeck.tsx",
    tagline:
      "Decisions at the speed of a gesture: fling the top card toward a decision, or use arrows and buttons — with tallies and an undo that flies the card back.",
    example:
      '  return <TriageDeck label="Inbox" items={[{id:"a",title:"Invoice from Northworks"},{id:"b",title:"Team offsite dates"}]} itemLabel={m=>m.title} decisions={[{id:"archive",label:"Archive",direction:"left"},{id:"keep",label:"Keep",direction:"right",tone:"success"}]} renderItem={m=><h3 style={{margin:0,fontSize:24}}>{m.title}</h3>} />;',
    props: [
      p(
        "label / items / renderItem",
        "string / T[] / (item) => ReactNode",
        "Region name, the queue (each with an id) and a card body.",
      ),
      p(
        "itemLabel",
        "(item) => string",
        "A short name used in announcements and the deck's label.",
      ),
      p(
        "decisions",
        "TriageDecision[]",
        "id, label, direction (left, right or up — one each) and tone.",
      ),
      p(
        "onDecide / onUndo",
        "(item, decision) => void",
        "Record or reverse a decision.",
      ),
      p("empty", "ReactNode", "Shown when every item has been decided."),
    ],
    a11y: "The deck is a focusable group named after the current item and its position. Arrow keys make the decisions a fling would; every decision also has a labelled button with its key, and Backspace undoes. Each decision announces what happened and what comes next. Tallies are a labelled list.",
    motion:
      "The top card follows your hand and tilts with it; decision stamps fade in as you cross a threshold, and release velocity carries it off. The next card steps forward in depth, and an undone card flies back from the side it left by. Reduced motion decides without flight or tilt.",
    keys: [
      { keys: "← →", action: "Decide left or right" },
      { keys: "↑", action: "Decide up, when offered" },
      { keys: "Backspace Z", action: "Undo the last decision" },
    ],
  }),
  s({
    name: "Gallery",
    source: "Gallery.tsx",
    tagline:
      "A justified photo grid whose photos open from exactly where they sit: swipe to travel, pull down to put one back, pinch or double-tap to look closer.",
    example:
      '  // Stand-in art, so the example runs anywhere: use your own images.\n  const field = (ground: string, mark: string) =>\n    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360"><pattern id="d" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M18 13l5 5-5 5-5-5z" fill="${mark}"/></pattern><rect width="720" height="360" fill="${ground}"/><rect width="720" height="360" fill="url(#d)"/></svg>`)}`;\n  return <Gallery label="Field studies" rowHeight={160} items={[{id:"ink",src:field("#141413", "#7e776b"),alt:"Diamond field on ink",width:720,height:360,caption:"Field, ink"},{id:"paper",src:field("#f4f0e8", "#93877a"),alt:"Diamond field on paper",width:720,height:360,caption:"Field, paper"}]} />;',
    props: [
      p(
        "label / items",
        "string / GalleryItem[]",
        "Region name; each photo has an id, src, alt, width and height, with an optional thumbnail and caption.",
      ),
      p(
        "index / defaultIndex / onIndexChange",
        "number | null",
        "The open photo, or null while the viewer is closed.",
      ),
      p(
        "rowHeight / gap",
        "number",
        "Rows aim for this height (220) and full rows adjust to fill the width exactly; gap defaults to 6.",
      ),
      p(
        "loading / empty",
        "boolean / ReactNode",
        "Skeleton rows with a scan line, or what to show when there are no photos.",
      ),
      p(
        "justifyRows()",
        "(sizes, width, target, gap) => Row[]",
        "The layout on its own, for server rendering or grids of your own.",
      ),
    ],
    a11y: "Photos are buttons named by their alt text, in a list; arrow keys move between them, up and down by row. The viewer is a native modal dialog: the page goes inert and stops scrolling, Escape closes, and focus returns to the photo you closed on. Position and alt text are announced as you travel, and every gesture also has a key or a button.",
    motion:
      "A photo flies out of its tile into the viewer, and back into the tile of whichever photo you close on. Swipes follow your finger with resistance at the ends; pulling down shrinks the photo and thins the backdrop until it lets go. Zoom springs around the point you pinch, scroll or double-tap. Reduced motion trades the flight for a short fade.",
    keys: [
      { keys: "← →", action: "Previous or next photo, in the grid or viewer" },
      { keys: "↑ ↓", action: "The row above or below, in the grid" },
      { keys: "Home End", action: "First or last photo" },
      { keys: "+ − 0", action: "Zoom in, out, or back to fit" },
      { keys: "Esc", action: "Put the photo back" },
    ],
  }),
  s({
    name: "Folio",
    source: "Folio.tsx",
    imports: "Folio, Sidenote",
    tagline:
      "A long-form reading surface: sidenotes sit in the margin beside their marks and fold into the text on narrow screens, while a contents rail keeps your place.",
    example:
      '  return <Folio label="Field notes"><h2 id="usage-rivers">Rivers</h2><p>Water finds the lowest path through any landscape<Sidenote>Unless it freezes first.</Sidenote> and keeps to it until something moves it.</p></Folio>;',
    props: [
      p(
        "label / children",
        "string / ReactNode",
        "The article's name and its prose: paragraphs, h2 and h3 headings, blockquotes, with Sidenotes inside the text.",
      ),
      p(
        "contents",
        "boolean",
        "A contents rail from the headings that have an id, shown from 1040px wide.",
        "true",
      ),
      p(
        "Sidenote children",
        "ReactNode",
        "The note: phrasing content, numbered automatically in reading order.",
      ),
      p(
        "--mizu-folio-offset / --mizu-folio-note",
        "CSS length",
        "Clearance for a sticky header (24px) and the margin note width (232px).",
      ),
    ],
    a11y: "Folio is a labelled article; its contents rail is a named navigation whose current section is marked with aria-current, and choosing one moves focus to that heading. Each mark is a button named with its number; on narrow screens it reports whether its note is expanded. Notes keep their place in the reading order right after their mark, with the note role.",
    motion:
      "Notes that would collide step down beside each other and glide when the text reflows; on narrow screens a note unfolds beneath its line. The contents marker springs to the section in view, the progress line fills as you read, and choosing a mark whose note is already in the margin makes the note glow. Reduced motion keeps the layout and drops the travel.",
    keys: [
      { keys: "Tab", action: "Move between note marks and contents" },
      {
        keys: "Enter Space",
        action: "Unfold a note, or point to it in the margin",
      },
    ],
  }),
  s({
    name: "SplitFlap",
    source: "SplitFlap.tsx",
    imports: "SplitFlap, Button",
    tagline:
      "A mechanical flip display: every character falls forward through the drum to its new value, cell after cell, and lands with a slap.",
    example:
      '  const [n, setN] = useState(0);\n  const states = ["ON TIME", "BOARDING", "DEPARTED"];\n  return <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}><SplitFlap value={states[n % 3]!} length={8} label="Status" live /><Button variant="ghost" onClick={() => setN(n + 1)}>Advance</Button></div>;',
    props: [
      p(
        "value / length / align",
        "string / number / left | right",
        "The text, padded or trimmed to `length` cells (its own length by default).",
      ),
      p(
        "characters",
        "string",
        "The drum in falling order — FLAP_CHARACTERS by default. Characters outside it arrive in one flip.",
      ),
      p(
        "flip / stagger",
        "number",
        "Milliseconds for one flap to fall (70) and between neighbouring cells starting (35).",
      ),
      p(
        "label / live",
        "string / boolean",
        "Read before the value; live displays announce each new value politely.",
      ),
      p(
        "tone / onSettle",
        "SignatureTone / (value) => void",
        "Glyph colour, and a call when every cell has arrived.",
      ),
      p(
        "flapPath()",
        "(from, to, characters, most?) => string[]",
        "The flaps a cell passes on its way, for displays of your own.",
      ),
    ],
    a11y: "The cells are hidden from assistive technology; the value and its label sit beside them as plain text, so a display reads as words rather than letters, inside a table cell or a button alike. A live display announces each new value once, not every flap.",
    motion:
      "Each cell falls forward through the drum like the real mechanism: the top leaf folds down and darkens while the next character lands with a small overshoot, and neighbouring cells start a beat apart so a change ripples along the line. Long journeys skip ahead to the last dozen flaps. Reduced motion shows the new value at once.",
  }),
  s({
    name: "ColumnBrowser",
    source: "ColumnBrowser.tsx",
    tagline:
      "Miller columns: choose an item and its contents open alongside, loading on demand, until a leaf opens in a preview — a stack you push and pop on narrow screens.",
    example:
      '  return <ColumnBrowser label="Library" items={[{id:"books",label:"Books",children:[{id:"dune",label:"Dune",meta:"1965"},{id:"piranesi",label:"Piranesi",meta:"2020"}]},{id:"films",label:"Films",children:[]}]} defaultPath={["books"]} />;',
    props: [
      p(
        "label / items",
        "string / BrowserItem[]",
        "The hierarchy's name and top level: id, label, children or hasChildren, with an optional icon, meta and disabled.",
      ),
      p(
        "loadChildren",
        "(item) => Promise<BrowserItem[]>",
        "Fetches the children of items marked hasChildren on first visit; results are kept, and failures offer a retry.",
      ),
      p(
        "path / defaultPath / onPathChange",
        "string[]",
        "The selected ids from the top level down.",
      ),
      p(
        "renderPreview / onOpen",
        "(item, trail) => ReactNode / (item) => void",
        "The last pane for an item without children, and what Enter or a double-click does with it.",
      ),
      p(
        "columnWidth / empty",
        "number / ReactNode",
        "Column width (240) and what an empty column says. Height comes from --mizu-columns-height (420px).",
      ),
    ],
    a11y: "Each column is a listbox named after its parent, with one tab stop for the whole browser. Arrow keys walk up and down a column and into or out of the next, Home and End jump, and typing finds an item by name. Entering a column announces its size or that it is loading; failures are alerts with a retry. A labelled breadcrumb marks the current location, and on narrow screens a back button names where it returns to.",
    motion:
      "New columns slide in from the one that opened them while the track glides to keep the newest in view; the selection bar grows in the focused column and the chevron of an open folder steps forward. On narrow screens panes push in from the right and pop back from the left. Loading columns sweep a hairline over skeleton rows. Reduced motion keeps every state and drops the travel.",
    keys: [
      { keys: "↑ ↓", action: "Move within a column" },
      { keys: "→ Enter", action: "Open the chosen folder; Enter opens a file" },
      { keys: "←", action: "Back to the parent column" },
      { keys: "Home End", action: "First or last item" },
      { keys: "a–z", action: "Jump to a name" },
    ],
  }),
  s({
    name: "LogStream",
    source: "LogStream.tsx",
    tagline:
      "A live log tail that renders only what is in view: it follows new lines until you scroll away, counts what you missed, and searches, filters and opens any line whole.",
    example:
      '  const t = Date.UTC(2026, 0, 12, 9, 30);\n  return <LogStream label="deploy #214" utc lines={[{ id: 1, time: t, level: "info", source: "build", message: "Build started on runner-3" }, { id: 2, time: t + 4200, level: "warn", source: "cache", message: "Cache cold: restoring 312 files" }, { id: 3, time: t + 9100, level: "error", source: "migrate", message: "Step migrate failed: lock timeout after 30 s", fields: { step: "migrate", exit: 1 } }]} />;',
    props: [
      p(
        "label / lines",
        "string / LogLine[]",
        "Oldest first: id, time (ms), level (debug, info, warn, error), message, with optional source and fields. Append as lines arrive and trim to bound memory.",
      ),
      p(
        "selected / defaultSelected / onSelectedChange",
        "id | null",
        "The line open in the detail panel, for syncing with a chart or timeline.",
      ),
      p(
        "loading / empty",
        "boolean / ReactNode",
        "Skeleton rows with a scan line, or what an empty log says.",
      ),
      p("utc", "boolean", "Show times in UTC instead of local time.", "false"),
      p(
        "--mizu-log-height",
        "CSS length",
        "Height of the scrolling lines (420px).",
      ),
    ],
    a11y: "The lines are a listbox with one tab stop; arrows, Page keys, Home and End move the selection, which is announced through aria-activedescendant, and only rendered lines are ever referenced. Levels are toggle buttons with counts, the search reports its matches as they change, and while you are paused, missed lines are announced at most every five seconds rather than line by line.",
    motion:
      "New lines glow briefly as they arrive at the tail. Scrolling away pauses the follow and a count of missed lines springs up from the bottom; choosing it drops you back to the live tail. The overview strip marks the stretch in view as you scroll. Reduced motion keeps every state without the travel.",
    keys: [
      {
        keys: "↑ ↓ PageUp PageDown",
        action: "Select a line (pauses following)",
      },
      { keys: "Home End", action: "First line, or back to the live tail" },
      { keys: "Esc", action: "Close the selected line" },
      {
        keys: "Enter Shift+Enter",
        action: "Next or previous match, in the search field",
      },
    ],
  }),
  s({
    name: "Knob",
    source: "Controls.tsx",
    tagline:
      "A rotary control for instruments rather than forms: drag up or down, Shift for fine, arrows to step, double-click to return home — with log tapers for frequencies and times.",
    example:
      '  const [cutoff, setCutoff] = useState(1200);\n  return <Knob label="Cutoff" min={40} max={16000} taper="log" value={cutoff} onValueChange={setCutoff} format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} kHz` : `${v} Hz`)} />;',
    props: [
      p(
        "label / value / defaultValue / onValueChange",
        "string / number",
        "The control's name and value.",
      ),
      p(
        "onValueCommit",
        "(value) => void",
        "When a drag, key press or reset finishes: the moment to save or send.",
      ),
      p(
        "min / max / step / taper",
        "number / linear | log",
        "Range (0–100) and step (1); a log taper spreads ratios evenly and needs a positive min.",
      ),
      p(
        "format / resetValue",
        "(value) => string / number",
        "Readout text, and where a reset returns (defaultValue).",
      ),
      p(
        "bipolar / size",
        "boolean / number",
        "Fill from the centre, for pans and offsets; diameter (64).",
      ),
      p(
        "name / disabled",
        "string / boolean",
        "Submit with a form; switch off.",
      ),
    ],
    a11y: "Behind the drawing is a native range input: it takes focus, answers the arrow, Page, Home and End keys, reads its value as formatted text, and submits with a form when named. Shift steps by a tenth of the range, Backspace or Delete returns home, and focus shows in the accent.",
    motion:
      "The value arc and pointer spring to changes from keys, resets and code, and follow the hand directly while dragging; bipolar knobs fill from the centre. Reduced motion jumps instead of springing.",
    keys: [
      { keys: "↑ → ↓ ←", action: "Step up or down" },
      { keys: "Shift+arrows PageUp PageDown", action: "A tenth of the range" },
      { keys: "Home End", action: "Minimum or maximum" },
      { keys: "Backspace Delete", action: "Return home" },
    ],
  }),
  s({
    name: "Fader",
    source: "Controls.tsx",
    tagline:
      "A console fader with a live meter: drag the cap, click the track to jump, and watch the level fall away beside it with a held peak.",
    example:
      '  return <Fader label="Master" min={0} max={1} step={0.01} defaultValue={0.8} marks={[1, 0.5, 0]} level={0.62} format={(v) => `${Math.round(v * 100)}%`} />;',
    props: [
      p(
        "label / value / defaultValue / onValueChange / onValueCommit",
        "string / number",
        "As for Knob.",
      ),
      p(
        "level",
        "number | MotionValue<number>",
        "A live signal from 0 to 1 for the meter; pass a motion value to update it without re-rendering.",
      ),
      p(
        "marks / height",
        "number[] / number",
        "Values labelled beside the track; track height (176).",
      ),
      p(
        "min / max / step / taper / format / resetValue",
        "number / linear | log / (value) => string",
        "As for Knob.",
      ),
      p(
        "name / disabled",
        "string / boolean",
        "Submit with a form; switch off.",
      ),
    ],
    a11y: "Behind the drawing is a native range input: it takes focus, answers the arrow, Page, Home and End keys, reads its value as formatted text, and submits with a form when named. Shift steps by a tenth of the range, Backspace or Delete returns home, and focus shows in the accent.",
    motion:
      "The cap glides to track clicks and resets and follows the hand while dragged. The meter attacks instantly and releases steadily; its peak holds for a moment, then falls. Reduced motion jumps the cap.",
    keys: [
      { keys: "↑ ↓", action: "Step up or down" },
      { keys: "Shift+arrows PageUp PageDown", action: "A tenth of the range" },
      { keys: "Home End", action: "Minimum or maximum" },
      { keys: "Backspace Delete", action: "Return home" },
    ],
  }),
  s({
    name: "XYPad",
    source: "Controls.tsx",
    tagline:
      "Two parameters under one finger: press anywhere and the puck springs there, then sweep both at once with a trail behind it.",
    example:
      '  return <XYPad label="Balance" x={{ label: "Temp", min: -100, max: 100 }} y={{ label: "Tint", min: -100, max: 100 }} defaultValue={{ x: 0, y: 0 }} />;',
    props: [
      p(
        "label / value / defaultValue / onValueChange / onValueCommit",
        "string / { x, y }",
        "The pad's name and point.",
      ),
      p(
        "x / y",
        "{ label, min, max, step, taper, format }",
        "Each axis's name, range and readout.",
      ),
      p(
        "size / resetValue",
        "number / { x, y }",
        "Side length (200); where a reset returns.",
      ),
      p(
        "name / disabled",
        "string / boolean",
        "Submits name-x and name-y with a form; switch off.",
      ),
    ],
    a11y: "Each axis is its own native slider, named after the pad and the axis, so assistive technology reads and sets them separately. From either one, left and right move X and up and down move Y; Shift steps a tenth, Backspace returns home, and the focused axis's crosshair lights in the accent.",
    motion:
      "The puck springs to where you press and then follows your finger exactly, drawing a short comet trail that fades when you let go. Keys and resets glide. Reduced motion jumps and skips the trail.",
    keys: [
      { keys: "← →", action: "Move along X" },
      { keys: "↑ ↓", action: "Move along Y" },
      { keys: "Shift+arrows PageUp PageDown", action: "A tenth of the range" },
      { keys: "Backspace Delete", action: "Return home" },
    ],
  }),
];
