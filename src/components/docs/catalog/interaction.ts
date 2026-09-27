import { define as d, prop as p } from "./define";
export const INTERACTION = [
  d(
    "Combobox",
    "Interaction",
    "interaction/Combobox.tsx",
    "Search a bounded set of choices and select without leaving the keyboard.",
    '  const [value,setValue]=useState("react");\n  return <Combobox label="Framework" value={value} onValueChange={setValue} options={[{value:"react",label:"React",description:"Compose with components"},{value:"next",label:"Next.js",description:"React with server rendering"},{value:"vite",label:"Vite",description:"A quick client build"}]} />;',
    [
      p(
        "label / value / onValueChange",
        "string / string / function",
        "Accessible name and controlled selected value.",
      ),
      p("options", "Choice[]", "Value, label, description and disabled."),
      p(
        "placeholder / disabled",
        "string / boolean",
        "Prompt and availability.",
      ),
    ],
    "Combobox with listbox and active-descendant relationships. Type filters; arrows wrap, Enter selects, Escape dismisses without changing the value. Disabled choices are excluded.",
  ),
  d(
    "MultiSelect",
    "Interaction",
    "interaction/MultiSelect.tsx",
    "Filter a set, keep several choices and make the selection limit clear.",
    '  const [value,setValue]=useState(["types"]);\n  return <MultiSelect label="Release checks" value={value} onValueChange={setValue} max={3} options={[{value:"types",label:"Types"},{value:"lint",label:"Lint"},{value:"tests",label:"Tests"},{value:"browser",label:"Browser review"}]} />;',
    [
      p(
        "label / value / onValueChange",
        "string / string[] / function",
        "Name and controlled selected values.",
      ),
      p("options / max", "Choice[] / number", "Choices and optional capacity."),
    ],
    "Native disclosure and checkboxes. Selected choices stay removable when capacity is reached. Escape restores the disclosure trigger; pointer outside closes.",
  ),
  d(
    "InlineEdit",
    "Interaction",
    "interaction/InlineEdit.tsx",
    "Change a value in place, with validation and an explicit path back.",
    '  const [value,setValue]=useState("Untitled release");\n  return <InlineEdit label="Release name" value={value} onValueChange={setValue} validate={v=>v.trim() ? undefined : "A release needs a name."} />;',
    [
      p(
        "label / value / onValueChange",
        "string / string / function",
        "Name and committed value.",
      ),
      p(
        "validate",
        "(value: string) => string | undefined",
        "Return an error message to keep the draft open.",
      ),
    ],
    "Editing focuses a labelled input. Enter saves, Escape/Cancel discards; focus returns to the trigger. Validation errors are linked and announced. Blur never silently commits.",
  ),
  d(
    "RangeSelector",
    "Interaction",
    "interaction/RangeSelector.tsx",
    "Two bounded handles define an interval without crossing or hiding their values.",
    '  const [value,setValue]=useState<[number,number]>([20,70]);\n  return <RangeSelector label="Visible window" value={value} onValueChange={setValue} min={0} max={120} format={v=>`${v}s`} />;',
    [
      p(
        "value / onValueChange",
        "[number, number] / function",
        "Controlled start and end.",
      ),
      p(
        "min / max / step",
        "number",
        "Full interval and native step.",
        "0 / 100 / 1",
      ),
      p("format", "(value: number) => string", "Visible and announced units."),
    ],
    "Two separately labelled native ranges share a fieldset legend. Start is bounded by end, end by start. Native keyboard and touch behavior.",
    "Direct native input.",
  ),
  d(
    "ReorderList",
    "Interaction",
    "interaction/ReorderList.tsx",
    "Rearrange a sequence while each item keeps its identity.",
    '  const [items,setItems]=useState([{id:"a",label:"Verify types",description:"Catch incompatible props"},{id:"b",label:"Run checks",description:"Exercise behavior"},{id:"c",label:"Review the browser",description:"Confirm the real interaction"}]);\n  return <ReorderList label="Release order" items={items} onReorder={setItems} />;',
    [
      p(
        "items",
        "ReorderEntry[]",
        "Stable id, label and optional description.",
      ),
      p(
        "onReorder",
        "(items: ReorderEntry[]) => void",
        "Persist the new full ordering.",
      ),
      p("label", "string", "Sequence name."),
    ],
    "A real ordered sequence. Handles support pointer dragging and up/down keys; separate move buttons offer a touch-friendly alternative. Boundaries disable invalid moves.",
    "Motion layout retains identity; reduced motion uses zero-duration settling.",
  ),
  d(
    "ImageCompare",
    "Interaction",
    "interaction/ImageCompare.tsx",
    "Reveal two versions with a divider that follows your hand.",
    '  const [value,setValue]=useState(50);\n  return <ImageCompare label="Surface study" before={{src:"/images/field.svg",alt:"Ink surface with muted diamonds"}} after={{src:"/images/field-light.svg",alt:"Paper surface with warm diamonds"}} value={value} onValueChange={setValue} beforeLabel="Ink" afterLabel="Paper" />;',
    [
      p(
        "before / after",
        "{src: string; alt: string}",
        "Images with matching composition and dimensions.",
      ),
      p(
        "value / onValueChange",
        "number / function",
        "Controlled reveal percentage, 0–100.",
      ),
      p(
        "label / beforeLabel / afterLabel",
        "string",
        "Figure and version names.",
      ),
    ],
    "Pointer capture enables direct dragging; a labelled native range gives keyboard and touch control. Both images retain descriptions. Load failure disables the reveal with an explained state.",
    "Direct clipping with no decorative loop.",
  ),
  d(
    "HistoryControls",
    "Interaction",
    "interaction/HistoryControls.tsx",
    "Undo and redo a bounded edit history, including the branch created by a new change.",
    '  const history=useHistory("First draft");\n  return <Stack gap={16}><InlineEdit label="Draft name" value={history.value} onValueChange={history.set} /><HistoryControls canUndo={history.canUndo} canRedo={history.canRedo} onUndo={history.undo} onRedo={history.redo} /></Stack>;',
    [
      p(
        "useHistory(initial, limit?)",
        "hook",
        "Value, set, undo, redo, reset and availability; bounded to 50 past entries by default.",
      ),
      p("canUndo / canRedo", "boolean", "Availability from your history."),
      p("onUndo / onRedo", "function", "Actual history operations."),
    ],
    "Named button group with explicit disabled boundaries. Store immutable values; Object.is suppresses unchanged edits. A new edit clears the redo branch.",
    "State changes belong to the edited content.",
    "HistoryControls, useHistory, InlineEdit, Stack",
  ),
  d(
    "ConfirmAction",
    "Interaction",
    "interaction/ConfirmAction.tsx",
    "Review a consequential action, execute the actual promise and recover from failure.",
    '  const [archived,setArchived]=useState(false);\n  return archived ? <p role="status">Draft archived on this device.</p> : <ConfirmAction label="Archive draft" title="Archive this draft?" confirmLabel="Archive" action={async()=>{localStorage.setItem("mizu-demo-archived","true");}} onSuccess={()=>setArchived(true)}>The draft leaves your active list. This demonstration stores the result locally.</ConfirmAction>;',
    [
      p(
        "label / title / confirmLabel",
        "string",
        "Trigger, modal name and final action.",
      ),
      p(
        "action",
        "(signal: AbortSignal) => Promise<unknown>",
        "Actual transaction; honor the signal for cancellation.",
      ),
      p(
        "onSuccess / children",
        "function / ReactNode",
        "Completion callback and review content.",
      ),
    ],
    "Native modal focus containment and restoration. Pending execution blocks duplicates; failure stays open for retry. Cancel/Escape unmount the action and abort its signal.",
    "Modal entrance respects reduced motion.",
  ),
];
