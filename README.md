# Mizu — An Archive of Interface Craft

Mizu is an independent UI platform: a curated collection of React components
built around a distinct visual language — ink-and-paper surfaces, hairline
rules, mono microcopy, a signature diamond mark, and motion that means
something.

## The collection

The component library lives in [`packages/mizu`](./packages/mizu) and is
published-ready as `mizu-ui`:

- **Foundation** — Button, SectionTag, Rule, Badge, Mark, Frame, Slider, Tooltip
- **Motion** — MaskLine, Reveal, Magnetic, Marquee, PageWipe
- **Type systems** — Specimen, SoftType, WaveText, GhostWord
- **Instruments** — Pinfield, Signal, RippleSurface
- **Feedback** — CountUp, CopyButton, Toast
- **Composites** — Accordion, Tabs, Dialog, Nav

## The site

- `/` — the archive (manifesto, selected pieces, lab invite)
- `/components` — live documentation with playgrounds, props tables and
  per-component accessibility/motion notes
- `/lab` — interactive instruments
- `/studio` — the standpoint

## Develop

```bash
bun install
bun run dev        # http://localhost:3000
bun run build      # production build
bun run build:ui   # compile packages/mizu to dist
bun test           # component behavior tests (vitest)
bun run lint
```

## Consumer check

[`examples/consumer`](./examples/consumer) is a fresh Vite + React app that
installs `mizu-ui` from the package directory (via its `prepare` script)
and renders a dozen components — the closest thing to an external consumer.
