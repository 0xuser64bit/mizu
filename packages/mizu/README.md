# mizu-ui

Mizu's interface language for React: **104 systems across 13 families**, from
labelled forms and asynchronous actions to data inspection, bounded history,
variable type and interactive instruments. Warm ink and paper, hairline rules,
diamond markers and purposeful motion connect the collection.

## Install and render

Run this command in your React application:

```sh
npm install mizu-ui
```

Peers: React and React DOM >=18.3 <20; Motion >=12 <14. The package is ESM only,
with TypeScript declarations and source maps. Next.js and Tailwind are not
required.

```tsx
import { useState } from "react";
import "mizu-ui/styles.css";
import "mizu-ui/fonts.css"; // optional Archivo, Instrument Serif, JetBrains Mono
import { Button, TextField } from "mizu-ui";

export function App() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState("");
  return <div className="mizu-root" style={{ padding: 24 }}>
    <form onSubmit={e => { e.preventDefault(); setSubmitted(name); }}>
      <TextField label="Project name" required value={name}
        onChange={e => setName(e.target.value)} />
      <Button type="submit">Create project</Button>
    </form>
    <p role="status">{submitted ? `Created ${submitted}` : ""}</p>
  </div>;
}
```

Import CSS in your app entry or root layout, set the document language and
remove the default body margin. For Next.js, put interactive usage behind a
`"use client"` boundary. Package client directives are preserved. Optional font
CSS keeps font files out of a styles-only build; SoftType's width animation
needs a compatible variable font such as the included Archivo.

## Focused imports

The root exports everything; each family has a focused ESM entry point.

| Path | Systems |
| --- | --- |
| `mizu-ui/ui` | Button / ButtonLink, Mark, SectionTag, Rule, Badge, Spinner, Frame, Slider, Tooltip |
| `mizu-ui/motion` | MaskLine, Reveal, Magnetic, Marquee, PageWipe, Presence, Tilt, Parallax, ScrollProgress; MotionPreferences |
| `mizu-ui/type` | Specimen, SoftType, WaveText, GhostWord |
| `mizu-ui/lab` | Pinfield, Signal, RippleSurface |
| `mizu-ui/feedback` | CountUp, CopyButton, Toast |
| `mizu-ui/composite` | Accordion, Tabs, Dialog, Nav and compound parts |
| `mizu-ui/forms` | FormField, TextField, TextArea, SelectField, Checkbox, Switch, SearchField, PasswordField, RadioGroup, SegmentedControl, NumberField, Rating, ColorPicker, TagInput, FileDropzone, AsyncForm |
| `mizu-ui/status` | Status, Alert, Progress, Meter, Skeleton, EmptyState, ErrorState, ConnectionStatus, SaveIndicator, AsyncBoundary, TaskProgress, AsyncButton |
| `mizu-ui/data` | DataTable, DescriptionList, Stat, BarChart, Sparkline, Heatmap, Timeline, ActivityFeed, DiffView, DataInspector, TreeView, ComparisonTable |
| `mizu-ui/navigation` | Breadcrumbs, Pagination, Stepper, AnchorNav, SideNav, BottomNav, ActionMenu, CommandPalette |
| `mizu-ui/content` | Avatar, Kbd, CodeBlock, Quote, Prose, ImageFigure, MediaPlayer, LinkCard, FileCard, Checklist |
| `mizu-ui/layout` | Stack, Grid, SplitPane, AspectRatio, ScrollArea, AppShell |
| `mizu-ui/interaction` | Combobox, MultiSelect, InlineEdit, RangeSelector, ReorderList, ImageCompare, HistoryControls / useHistory, ConfirmAction |

Compound parts count with their system; providers and hooks are supporting APIs.

## Theme, style and motion

```tsx
<div className="mizu-root" data-theme="light">…</div>
```

Dark is the default. Local theme ancestors are preserved inside native dialogs.
All systems share `--mizu-*` custom properties. Pass `className` / `style` where
exposed, or override tokens on an ancestor. `--mizu-accent` is foreground signal;
`--mizu-accent-fill` is the filled action background. Check contrast after any
color override; status colors have separate success / warning / danger tokens.

Components honor `prefers-reduced-motion`. For an explicit preference including
CSS and canvas animation, use:

```tsx
import { MotionPreferences } from "mizu-ui/motion";
<MotionPreferences reduced={true}><YourInterface /></MotionPreferences>
```

Omit `reduced` to follow the operating system. Continuous marquees include
pause controls. Canvas instruments stop their loops off screen, when hidden or
with reduced motion, and render a static useful frame.

## Real state and composition

Native fields accept standard form props, controlled values or default values.
Specialized selectors use explicit values and callbacks; stable IDs identify
rows, options and reorderable items. Disabled entries are excluded from command
and keyboard selection. Supply a meaningful accessible label for each control.

AsyncButton / AsyncForm follow your actual promise and pass AbortSignal for
unmount cancellation; your service must honor the signal. ConfirmAction keeps a
failed operation open for retry. FileDropzone validates and returns File objects
but does not upload. Charts render supplied finite values; tables sort locally.
History is bounded and local. ConnectionStatus reports browser connectivity,
not your API's health. Native MediaPlayer needs a real playable source.

DataTable does not virtualize large datasets. DiffView aligns lines, without
semantic diffing. TreeView uses native disclosure rather than a full ARIA tree
widget. JSON inspection is bounded and copy is disabled if serialization fails.
These limits are intentional; use the relevant documented source/API when
composing more demanding workflows.

## Inspect, copy and validate

The [repository](https://github.com/0xuser64bit/mizu) includes the searchable
showcase: run it and visit `/components`. Every page has working usage,
properties, accessibility / motion notes and a source link. The
[complete inventory](https://github.com/0xuser64bit/mizu/blob/main/docs/COMPONENTS.md)
links to implementation files.

Source ships in `node_modules/mizu-ui/src` and via `mizu-ui/source/*`. Copy the
relative dependencies, shared CSS and MIT license too. Source uses .tsx/.ts
imports; TypeScript 5.7+ supports rewriting these extensions, or adapt them to
your bundler. The installed ESM output already uses resolvable .js imports.

The repository's tarball check installs outside the workspace with lifecycle
scripts disabled, checks all family exports and declarations, renders via Node
SSR, builds a production Vite composition and verifies small-import tree
shaking on React 18 and 19. See the repository's verification report for the
actual browser coverage and remaining compatibility checks.

MIT.
