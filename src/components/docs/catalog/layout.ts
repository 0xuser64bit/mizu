import { define as d, prop as p } from "./define";
export const LAYOUT = [
  d(
    "Stack",
    "Layout",
    "layout/Layout.tsx",
    "A single-axis layout that wraps when the task calls for it.",
    '  return <Stack direction="row" wrap gap={12}><Badge>React</Badge><Badge>TypeScript</Badge><Badge>Native CSS</Badge></Stack>;',
    [
      p("direction", '"row" | "column"', "Main axis.", '"column"'),
      p(
        "gap / align / wrap",
        "number / CSS alignItems / boolean",
        "Spacing, cross-axis alignment and wrapping.",
      ),
      p(
        "...props",
        "HTMLAttributes",
        "Native div props; style can override defaults.",
      ),
    ],
    "No synthetic semantics. Use children with meaningful document structure.",
    "Native flex layout.",
    "Stack, Badge",
  ),
  d(
    "Grid",
    "Layout",
    "layout/Layout.tsx",
    "Responsive columns that make room for the content without breakpoint bookkeeping.",
    '  return <Grid minWidth={160} gap={24}><Stat label="Forms" value="16" /><Stat label="Status" value="12" /><Stat label="Data" value="12" /></Grid>;',
    [
      p(
        "minWidth / gap",
        "number",
        "Minimum column width and gap in pixels.",
        "220 / 24",
      ),
      p("...props", "HTMLAttributes", "Native div attributes."),
    ],
    "Native grid automatically collapses within its container. DOM reading order remains intact.",
    "CSS layout, no resize observer.",
    "Grid, Stat",
  ),
  d(
    "SplitPane",
    "Layout",
    "layout/SplitPane.tsx",
    "Give two working regions the space they need, with a real resizable boundary.",
    '  const [value,setValue] = useState(45);\n  return <SplitPane value={value} onValueChange={setValue} first={<div><h3>Source</h3><p className="mizu-field-hint">Drag the divider or focus it and use the arrow keys.</p></div>} second={<div><h3>Preview</h3><p className="mizu-field-hint">This panel receives {100-value}% of the available space.</p></div>} />;',
    [
      p("first / second", "ReactNode", "Two independent panels."),
      p(
        "value / onValueChange",
        "number / function",
        "Controlled percentage given to the first panel.",
      ),
      p(
        "min / max / label",
        "number / number / string",
        "Bounds and separator name.",
        "15 / 85",
      ),
    ],
    "Focusable separator with orientation, controls and current/min/max values. Arrow keys move 1%, Shift moves 10%; Home/End reach bounds. Pointer capture supports touch.",
    "Direct manipulation, no spring lag.",
  ),
  {
    ...d(
      "Dock",
      "Layout",
      "layout/Dock.tsx",
      "A two-pane workspace that keeps your drafts intact as tabs move, panels collapse and the working space changes.",
      `  const initial: DockLayout = { panes: [["draft", "notes"], ["preview"]], active: ["draft", "preview"], split: 52, collapsed: null };
  const [layout, setLayout] = useState(initial);
  return <div style={{ display: "grid", gap: 16 }}>
    <Dock label="Release workspace" value={layout} onValueChange={setLayout} tabs={[
      { id: "draft", label: "Draft", content: <TextArea label="Release draft" rows={7} defaultValue={"A quieter way to work.\\n\\nEvery panel keeps its place, and every draft stays yours."} hint="Edit this, then move the tab. Your draft travels with it." /> },
      { id: "notes", label: "Notes", content: <section><h3>Before publishing</h3><ul className="mizu-field-hint"><li>Check the keyboard path.</li><li>Read the empty and error states.</li><li>Keep the motion purposeful.</li></ul></section> },
      { id: "preview", label: "Preview", content: <article><h3>A quieter way to work.</h3><p className="mizu-field-hint">A focused workspace for the source, its context and the result. Tabs keep their content mounted when you switch, collapse or move them; on narrow screens the panes stack.</p></article> },
    ]} />
    <Button variant="ghost" arrow={false} size="sm" style={{ justifySelf: "start" }} onClick={() => setLayout(initial)}>Reset layout</Button>
  </div>;`,
      [
        p(
          "label",
          "string",
          "Accessible workspace name, also shown in the toolbar.",
        ),
        p(
          "tabs",
          "DockTab[]",
          "Unique id, label and content for every panel. Content stays mounted when hidden or moved.",
        ),
        p(
          "value / defaultValue / onValueChange",
          "DockLayout / DockLayout / function",
          "Controlled layout or an initial layout: panes contains two ordered ID lists, active contains each pane's selected ID, split is the first pane's percentage, and collapsed is 0, 1 or null.",
        ),
        p(
          "readOnly",
          "boolean",
          "Lock resizing, collapsing, moving and reordering. Tab selection stays available.",
          "false",
        ),
      ],
      "Named workspace with two roving-tabindex tablists and labelled tabpanels. Arrow keys select, Home/End reach the first/last tab. Every structural action has a labelled button. The separator supports pointer capture, arrows, Shift for 10%, and Home/End for the 20–80% bounds. On small screens panes stack and the separator is removed. Unknown or repeated IDs are removed, newly supplied tabs join the first pane, and missing selections fall back to the first available tab.",
      "Resizing tracks the hand directly; tabs and collapse update without travel. Hidden panels remain mounted so form values and component state survive layout changes.",
      "Dock, type DockLayout, TextArea, Button",
    ),
    keys: [
      { keys: "← → / Home End", action: "Select a tab within its pane" },
      { keys: "Alt + ← →", action: "Reorder the focused tab" },
      {
        keys: "Alt + Shift + ← →",
        action: "Move the focused tab to the first or second pane",
      },
      {
        keys: "← → / Shift + ← →",
        action: "Resize the focused divider by 1% / 10%",
      },
    ],
  },
  d(
    "AspectRatio",
    "Layout",
    "layout/Layout.tsx",
    "Reserve media space before it arrives, keeping the surrounding reading rhythm steady.",
    '  const field = (ground: string, mark: string) =>\n    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360"><pattern id="d" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M18 13l5 5-5 5-5-5z" fill="${mark}"/></pattern><rect width="720" height="360" fill="${ground}"/><rect width="720" height="360" fill="url(#d)"/></svg>`)}`;\n  return <AspectRatio ratio={2}><img src={field("#141413", "#7e776b")} alt="A diamond measurement field" /></AspectRatio>;',
    [
      p("ratio", "number", "Width divided by height.", "16 / 9"),
      p(
        "children / ...props",
        "ReactNode / HTMLAttributes",
        "Native wrapper and media.",
      ),
    ],
    "CSS aspect-ratio reserves space; invalid ratios fall back to a square. Content retains its own accessibility.",
    "Static geometry.",
  ),
  d(
    "ScrollArea",
    "Layout",
    "layout/Layout.tsx",
    "A bounded reading region that keyboard users can enter and scroll.",
    '  return <ScrollArea label="Release notes" maxHeight={180}><Prose>{Array.from({length:8},(_,i)=><p key={i}>Entry {i+1}. Each component keeps its own behavior, source and usage example available.</p>)}</Prose></ScrollArea>;',
    [
      p("label", "string", "Region name."),
      p("maxHeight", "number | string", "Height limit.", "300"),
      p("...props", "HTMLAttributes", "Native div attributes."),
    ],
    "Named region is keyboard-focusable. Native scrolling, overscroll containment and platform scrollbars.",
    "Native scroll; no smoothing loop.",
    "ScrollArea, Prose",
  ),
  d(
    "AppShell",
    "Layout",
    "layout/Layout.tsx",
    "Named working regions and a skip link, composed around the product's real content.",
    '  return <AppShell mainTag="section" mainId="shell-demo-content" header={<strong>Workshop</strong>} sidebar={<SideNav currentPath="/components" groups={[{label:"Explore",items:[{label:"Collection",href:"/components"},{label:"Lab",href:"/lab"}]}]} />} footer={<span className="mizu-field-hint">All changes stay on this device.</span>}><h3>Your workspace</h3><p className="mizu-field-hint">A shell gives content a place; it does not decide the product for you.</p></AppShell>;',
    [
      p(
        "header / sidebar / footer / children",
        "ReactNode",
        "Composed regions.",
      ),
      p("mainId", "string", "Unique skip-link destination.", '"mizu-main"'),
      p(
        "mainTag",
        '"main" | "section"',
        "Use section when embedding in an existing main landmark.",
        '"main"',
      ),
    ],
    "Native landmarks and a visible-on-focus skip link. Supply a unique mainId per shell. Sidebar stacks on small screens.",
    "CSS reflow, no entrance animation.",
    "AppShell, SideNav",
  ),
];
