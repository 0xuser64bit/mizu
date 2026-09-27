import { define as d, prop as p } from "./define";
export const NAVIGATION = [
  d(
    "Breadcrumbs",
    "Navigation",
    "navigation/Navigation.tsx",
    "A quiet path back through the hierarchy.",
    '  return <Breadcrumbs items={[{label:"Collection",href:"/components"},{label:"Navigation",href:"/components?category=Navigation"},{label:"Breadcrumbs"}]} />;',
    [
      p(
        "items",
        "{label: string; href?: string}[]",
        "Ordered ancestry; the final item is current.",
      ),
      p("label", "string", "Navigation landmark name."),
    ],
    "Native links in an ordered list. The current page is announced; separators are hidden.",
    "Static navigation.",
  ),
  d(
    "Pagination",
    "Navigation",
    "navigation/Navigation.tsx",
    "Move through bounded pages with a compact view of the whole sequence.",
    '  const [page,setPage] = useState(3);\n  return <div><Pagination page={page} totalPages={12} onPageChange={setPage} /><p className="mizu-field-hint">Showing page {page} of 12.</p></div>;',
    [
      p("page / totalPages", "number", "One-based current page and total."),
      p(
        "onPageChange",
        "(page: number) => void",
        "Load or show the requested page.",
      ),
    ],
    "Labelled navigation; current page and disabled boundaries are explicit. No fetching is implied.",
  ),
  d(
    "Stepper",
    "Navigation",
    "navigation/Navigation.tsx",
    "A numbered journey with a clear present step.",
    '  const [step,setStep] = useState("review");\n  return <Stepper current={step} onStepChange={setStep} steps={[{id:"prepare",label:"Prepare",description:"Choose the package"},{id:"review",label:"Review",description:"Check the details"},{id:"release",label:"Release",description:"Publish when ready"}]} />;',
    [
      p("steps", "{id,label,description?,disabled?}[]", "Ordered steps."),
      p("current", "string", "Current step id."),
      p(
        "onStepChange",
        "function",
        "Optional navigation; omit for a static indicator.",
      ),
    ],
    "Ordered list with aria-current step. Buttons are optional; progression rules belong to the caller.",
  ),
  d(
    "AnchorNav",
    "Navigation",
    "navigation/Navigation.tsx",
    "A page outline that follows the section in view.",
    '  return <div><AnchorNav items={[{id:"anchor-intro",label:"Introduction"},{id:"anchor-details",label:"Details"}]} /><section id="anchor-intro"><h3>Introduction</h3><p>Navigation follows the document.</p></section><section id="anchor-details"><h3>Details</h3><p>Every item is a native fragment link.</p></section></div>;',
    [
      p(
        "items",
        "{id: string; label: string}[]",
        "Existing document section ids.",
      ),
      p("label", "string", "Landmark name."),
    ],
    "Native fragment links work without an observer. IntersectionObserver marks the visible location and disconnects on unmount.",
    "Native scrolling; respects the document's scrolling settings.",
  ),
  d(
    "SideNav",
    "Navigation",
    "navigation/Navigation.tsx",
    "Grouped destinations with the current place held in focus.",
    '  return <SideNav currentPath="/components" groups={[{label:"Discover",items:[{label:"Collection",href:"/components"},{label:"Getting started",href:"/components/getting-started"}]},{label:"Experiment",items:[{label:"Lab",href:"/lab"},{label:"Studio",href:"/studio"}]}]} />;',
    [
      p(
        "groups",
        "{label: string; items: NavigationItem[]}[]",
        "Named groups with native links.",
      ),
      p("currentPath", "string", "Exact href of the current page."),
      p("label", "string", "Navigation landmark."),
    ],
    "Real anchors and aria-current page. Decorative icons are hidden; link labels stay visible.",
  ),
  d(
    "BottomNav",
    "Navigation",
    "navigation/Navigation.tsx",
    "Touch-friendly destinations that fit the phone's safe area.",
    '  return <BottomNav currentPath="/components" items={[{label:"Collection",href:"/components",icon:"◇"},{label:"Lab",href:"/lab",icon:"∿"},{label:"Studio",href:"/studio",icon:"□"}]} />;',
    [
      p("items", "NavigationItem[]", "Visible label, href and optional icon."),
      p("currentPath", "string", "Current destination."),
      p("label", "string", "Navigation landmark."),
    ],
    "Native links with generous targets and visible names. Safe-area padding is built in; positioning belongs to your layout.",
  ),
  d(
    "ActionMenu",
    "Navigation",
    "navigation/ActionMenu.tsx",
    "A compact menu of real actions, with disabled and destructive states.",
    '  const [status,setStatus] = useState("No action selected.");\n  return <div><ActionMenu items={[{id:"copy",label:"Duplicate record",onSelect:() => setStatus("Record duplicated.")},{id:"archive",label:"Archive record",onSelect:() => setStatus("Record archived.")},{id:"delete",label:"Delete record",danger:true,onSelect:() => setStatus("Record deleted.")}]} /><p role="status" className="mizu-field-hint">{status}</p></div>;',
    [
      p(
        "items",
        "MenuAction[]",
        "Stable id, label, callback and optional disabled/danger flags.",
      ),
      p("label", "string", "Trigger and menu name.", '"Actions"'),
    ],
    "Native disclosure, named actions, arrow/Home/End navigation and Escape focus restoration. Pointer outside dismisses.",
  ),
  d(
    "CommandPalette",
    "Navigation",
    "navigation/CommandPalette.tsx",
    "Search commands and execute them without taking your hands off the keyboard.",
    '  const [open,setOpen] = useState(false), [result,setResult] = useState("Choose a command.");\n  return <div><Button onClick={() => setOpen(true)}>Open commands</Button><p role="status" className="mizu-field-hint">{result}</p><CommandPalette open={open} onOpenChange={setOpen} commands={[{id:"new",label:"Create a draft",description:"Start a new local record",onSelect:() => setResult("Draft created.")},{id:"review",label:"Review the release",description:"Open the review queue",onSelect:() => setResult("Review queue opened.")},{id:"save",label:"Save changes",shortcut:"⌘ S",onSelect:() => setResult("Changes saved.")}]} /></div>;',
    [
      p(
        "open / onOpenChange",
        "boolean / function",
        "Controlled modal visibility.",
      ),
      p(
        "commands",
        "Command[]",
        "Stable id, label, description, optional shortcut/disabled and onSelect.",
      ),
      p("label / placeholder", "string", "Accessible name and search prompt."),
    ],
    "Native modal contains focus and restores its trigger. Combobox/listbox exposes active commands. Up/down wraps, Enter executes; Escape closes.",
    "Modal entrance obeys reduced motion.",
    "CommandPalette, Button",
  ),
];
