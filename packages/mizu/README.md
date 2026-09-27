# mizu-ui

The Mizu interface language — surfaces, motion and systems for React.

Mizu is not a generic UI kit. It is a curated collection of components with a point of view: warm ink-and-paper surfaces, hairline rules, mono microcopy, a signature diamond mark, and motion that means something.

## Install

```bash
npm install mizu-ui
# or
bun add mizu-ui
```

Peer dependencies: `react` (>=18.3 <20), `react-dom` (>=18.3 <20), `motion` (>=12 <14).

## Setup

Import the stylesheet once, at the root of your app. It ships design tokens and component styles. Self-hosted fonts are optional.

```tsx
import "mizu-ui/styles.css";
import "mizu-ui/fonts.css"; // optional: Archivo Variable, Instrument Serif, JetBrains Mono
```

Wrap your app in the theme surface class:

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="mizu-root">{children}</body>
    </html>
  );
}
```

## Theming

Dark is the default. For a light surface, set `data-theme="light"` on any ancestor:

```tsx
<body className="mizu-root" data-theme="light">
```

All components read from CSS custom properties (`--mizu-ink`, `--mizu-accent`, …), so you can re-theme any component by overriding tokens on your own selector:

```css
.my-surface {
  --mizu-ink: #101418;
  --mizu-paper: #eef2f5;
  --mizu-accent: #2f6bff;
}
```

## Components

### Foundation
- `Button` / `ButtonLink` — solid / ghost / inverse, loading state, arrow micro-motion
- `SectionTag` — mono label with diamond marker
- `Rule` — hairline divider with optional node and label
- `Badge` — mono status chip
- `Mark` — the Mizu diamond glyph
- `Frame` — crop-mark frame for media
- `Slider` — diamond-thumb range control
- `Tooltip` — mono tooltip

### Motion
- `MaskLine` — masked line-wipe text reveal
- `Reveal` — scroll-triggered entrance
- `Magnetic` — spring-follow pointer wrapper
- `Marquee` — seamless ticker
- `PageWipeProvider` / `usePageWipe` — full-screen page transition

### Type systems
- `Specimen` — live type tester
- `SoftType` — variable-font canvas engine
- `WaveText` — pointer-reactive kinetic text
- `GhostWord` — outlined display word that fills on hover

### Instruments
- `Pinfield` — pulse-propagating dot grid
- `Signal` — draggable waveform scrubber
- `RippleSurface` — ambient ripple field

### Feedback
- `CountUp` — eased number animation
- `CopyButton` — clipboard with confirmation morph
- `ToastProvider` / `useToast` — toast system

### Composites
- `Accordion` / `AccordionItem`
- `Tabs` / `TabsList` / `TabsTrigger` / `TabsPanel`
- `Dialog` / `DialogTitle` / `DialogBody` / `DialogFooter` / `DialogClose`
- `Nav` — thread header with scroll progress and chapter tracking

## Reduced motion

Every component respects `prefers-reduced-motion`. Canvas instruments stop their loops and render a static frame; springs and wipes resolve instantly. You can also force it with `reducedMotion="user"` on `MotionConfig` from `motion`.

## License

MIT
