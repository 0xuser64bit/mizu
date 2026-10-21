# Test the workshop

Run `bun run dev` from the repository, then open
<http://localhost:3000/workshop>. The Workshop link in the site navigation
and the documentation sidebar also lead here.

## Theme Workshop — `/workshop/theme`

- Choose Ink, Paper, Blueprint and Moss. The palette changes only the preview.
- Adjust the four colors, typeface and corners; the palette becomes Custom.
- Check the Workspace and Components views. Toggle a review checkbox and
  save the sample preferences; these are working controls.
- Set text and surface to the same color: the text contrast check says Adjust.
- Copy or download the CSS, then reset to Mizu ink.
- The export applies one theme to all theme ancestors. Scope its selector if
  you want separate light/dark palettes.

## Props Playground — `/workshop/playground`

- Try all five components. Edit labels, variants, tones and state controls.
- Click the preview button; type in TextField; move Slider with arrow keys.
- Inspect the generated JSX and paste it into a React component. Labels that
  contain quotes, braces and line breaks must remain valid code.
- Toggle narrow width and the preview theme. Reset restores props and preview.
- On `/components/button` (also Badge, TextField, Alert and Slider), choose
  “Edit props & copy JSX” to open these controls inline.

## Mizu Blocks — `/blocks`

- Settings: edit and save, reload to restore, discard an unsaved draft, and
  restore defaults. Storage errors keep the draft and allow another save.
- Files: search, filter by type, sort columns, inspect a selected file, and
  download its actual sample content. A search with no matches offers recovery.
- Analytics: change the reporting window, select a preset, switch metric,
  sort the table, and export CSV. All views use the same filtered records.
- Copy an install command into a separate React project with a configured
  `components.json`. The command uses the origin you are browsing, so a local
  URL works while this development server runs. Add Mizu's fonts separately
  if wanted.

## Audio Workbench — `/examples/audio-workbench`

- Play the bundled synthetic recording. Click a transcript passage to seek.
- Select a passage, adjust the excerpt bounds, and play only that excerpt.
- Add a timestamped note, edit its outline, delete it and undo the deletion.
- Copy or download the Markdown and confirm that it contains your edits.
- Notes live only in the current tab; export them before reloading.

## Dock — `/components/dock`

- Edit a draft, switch tabs, move the draft to the other pane, and return to it.
  The text stays intact. The arrow keys select tabs; Alt + arrows reorder;
  Alt + Shift + → moves a tab to the second pane and Alt + Shift + ← back to
  the first. Buttons perform the same actions.
- Drag the separator or use arrows, Shift + arrows, Home and End. Collapse
  and restore either pane. Narrow containers stack panes instead of shrinking
  them into unusable columns.

## DateRangeField — `/components/date-range-field`

- Edit either date, clear a date, select a preset, clear and reset the range.
- Try an end before the start, dates beyond the bounds and an incomplete range.
- Native form submission blocks invalid ranges; keyboard and touch use the
  platform's date controls. Dates are date-only strings, not UTC instants.

## Automated checks

`bun run check` covers types, lint, registry/demo freshness, behavior tests and
package compilation. `bun run build` checks the production site.
`bun run test:consumer` and `bun run test:consumer --react18` check packed
React 19/18 consumption, exports, CSS, fonts, SSR and tree shaking.
`bun run test:blocks` installs the three blocks via the real shadcn CLI into
a temporary project and type-checks the copied source (local server required).

Every page above has had a browser pass at 1440, 820 and 375 pixels wide, in
both themes. Repeat it after layout changes, with reduced motion and the
keyboard as well: the workshop pages share the examples container, and the
site navigation switches to its menu below 900 pixels.
