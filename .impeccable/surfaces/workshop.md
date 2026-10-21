---
version: 1
slug: "workshop"
primary_target: "src/app/workshop/page.tsx"
related_targets:
  - "src/app/workshop/theme/page.tsx"
  - "src/app/workshop/playground/page.tsx"
  - "src/app/blocks/page.tsx"
  - "src/app/examples/audio-workbench/page.tsx"
---

# Workshop expansion

Mode: Operate, with Read for the index and installation notes. Audience:
developers trying Mizu and bringing its systems into a real React product.
The user delegated product, design and implementation decisions, accepted all
six additions and requested local commits. After a design QA pass on
2026-10-21 the user asked for the branch to land on main and be pushed.

Inherit DESIGN.md and the existing collection. The new surfaces are working
benches: a restrained control column alongside a generous, live working area.
Use the existing Archivo, Instrument Serif and JetBrains Mono roles, warm ink
and paper, hairline rules, fixed readouts, and native inputs. No new visual world.

First viewport: the tool title, a plain explanation, local workshop navigation,
and the controls and actual result together. The overview is a ruled index of
the six additions, not a grid of feature cards. On narrow screens, controls
precede results in reading order and all actions remain reachable.

Signature interactions: theme edits immediately change the actual components;
playground edits produce matching JSX; audio playback, transcript, selection and
notes share time; Dock preserves drafts while tabs move between panes. Motion
explains state and respects the existing reduced-motion contract.

Ship six complete outcomes: Theme Workshop with CSS export; registry Blocks
with working previews; Audio Workbench with original bundled synthetic speech;
Dock with keyboard controls; DateRangeField using native date inputs; and a
props playground with copyable, executable JSX. Keep new data browser-local,
make no backend or collaboration claims, and add no dependencies unless the
existing platform demonstrably cannot do the work.

Verification: behavior tests, catalog and registry regeneration checks, types,
lint, package build, production site build, packed consumers, and a bounded
desktop/mobile browser pass. Commit each coherent feature locally, then the
integration and verified release notes.
