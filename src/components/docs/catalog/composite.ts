import { define as d, prop as p } from "./define";
export const COMPOSITES = [
  d(
    "Drawer",
    "Composites",
    "composite/Drawer.tsx",
    "A panel that slides in from an edge for filters, details and quick edits, with all of Dialog's modal care.",
    '  const [open, setOpen] = useState(false);\n  return (\n    <>\n      <Button onClick={() => setOpen(true)}>Filter incidents</Button>\n      <Drawer open={open} onOpenChange={setOpen} label="Filters">\n        <DialogClose />\n        <DialogTitle>Filters</DialogTitle>\n        <DialogBody>\n          <Checkbox label="Only open incidents" defaultChecked />\n          <Checkbox label="Assigned to me" />\n        </DialogBody>\n        <DialogFooter>\n          <Button onClick={() => setOpen(false)}>Show results</Button>\n        </DialogFooter>\n      </Drawer>\n    </>\n  );',
    [
      p(
        "open / onOpenChange",
        "boolean / (open: boolean) => void",
        "Controlled visibility. Escape, the backdrop and DialogClose ask to close through onOpenChange.",
      ),
      p("label", "string", "Accessible name of the drawer."),
      p(
        "side",
        '"right" | "left" | "bottom"',
        "The edge it slides from. Side drawers leave 48px of the page showing on a phone, to tap away.",
        '"right"',
      ),
      p(
        "children",
        "ReactNode",
        "Compose DialogTitle, DialogBody, DialogFooter and DialogClose inside, as in a Dialog.",
      ),
    ],
    "A native modal dialog: focus moves inside and returns to the trigger, the page behind is inert and keeps its scroll position, and Escape closes it.",
    "The panel slides in from its edge with expo easing; reduced motion shows it in place.",
    "Drawer, DialogTitle, DialogBody, DialogFooter, DialogClose, Button, Checkbox",
  ),
  d(
    "Popover",
    "Composites",
    "composite/Popover.tsx",
    "A small panel that opens beside its button for settings and filters, closing when you look away.",
    '  return (\n    <Popover label="Columns">\n      <fieldset className="mizu-form-fields">\n        <legend className="mizu-field-label">Show columns</legend>\n        <Checkbox label="Owner" defaultChecked />\n        <Checkbox label="Severity" defaultChecked />\n        <Checkbox label="Last updated" />\n      </fieldset>\n    </Popover>\n  );',
    [
      p("label", "string", "Button text and the panel's accessible name."),
      p("children", "ReactNode", "The panel's content."),
      p(
        "side / align",
        '"bottom" | "top" / "start" | "end"',
        "Where the panel opens. It flips to the other side when there is no room.",
        '"bottom" / "start"',
      ),
    ],
    "Built on the native Popover API: Escape or a click outside closes it and returns focus to the button, which reports aria-expanded. The panel is a non-modal dialog named by its button, and follows the button in the tab order.",
    "The panel settles 4px into place; reduced motion opens it still.",
    "Popover, Checkbox",
  ),
];
