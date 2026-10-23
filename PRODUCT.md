# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Developers and design engineers** who find Mizu (`mizu-ui` on npm, the
  docs at mizu.user64bit.world) and want interface craft in their React
  product: they browse the systems, copy usage and install the package.
- **Founders, product leads and teams who want to commission work** (added
  2026-10-13): they arrive from the archive, already impressed by a piece,
  and need to know what they can hire Mizu for, roughly what it costs, and
  how to start.

## Product Purpose

Mizu is an archive of interface craft: 131 React component systems across 14
families, led by 22 signature systems (timelines, charts, editors, readers,
flows, instrument controls), with a lab of instruments and four whole-
workflow examples. It is MIT-licensed and free.

From 2026-10-13 it is also the shop window for Mizu Studio's commissioned
work. Success for that surface is qualified briefs in the inbox: people who
know what they want built and have a budget that fits.

## Positioning

The archive is the portfolio. Every claim about how Mizu builds can be
checked by opening a component page, scrubbing a timeline or pressing a key.
Mizu Studio is one person: whoever commissions work deals directly with the
person who made the archive. There are no account managers or handoffs.

## Capabilities and Constraints

- Commissioned work offered (confirmed by the user): signature interfaces,
  design systems and component libraries, motion and craft passes on
  existing products, marketing and launch sites.
- Price floors were left to Claude by the user ("you figure it out").
  Chosen 2026-10-13 and kept as one constant in the work page source:
  craft pass from $4k, launch site from $8k, signature interface from $12k,
  design system from $20k (USD). These are starting points, not quotes.
- No availability is stated anywhere (the user's call).
- Briefs are sent by a Next.js Server Action through Resend
  (`RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`). Without a key, the
  form still tells the visitor where to write instead.
- Stack: Next.js 16 app router, React 19, Motion, Tailwind v4, the
  `mizu-ui` package in `packages/mizu` (imported as `@/mizu`).

## Brand Commitments

- Name: Mizu; the studio signs as "Mizu Studio".
- Voice: calm, exact, a little dry. It states what it refuses to be (see
  `/studio`). There are no funnels or engagement tricks: no popups, no
  countdowns and no fake scarcity.
- Commissioned work is spoken in the first person singular where it matters,
  because the studio is one person.

## Evidence on Hand

- The archive itself: `/components` (131 systems), `/examples` (incident
  review, design review, automation builder, audio workbench), `/lab`.
- `/workshop`: a theme editor with CSS export and contrast checks, a working
  props playground, and links to installable `/blocks`. DateRangeField and Dock
  extend the Forms and Layout families. User-approved additions, 2026-10-21.
- Drawer, Popover and OneTimeCode extend Composites and Forms, and
  LinkProvider sends Mizu's links through an app's router. The site gained
  ⌘K search over every page and component, a theme switch in the bar, URL-
  kept collection filters and copy-as-Markdown on component pages. Chosen
  by Claude on the user's delegation ("take decisions and do
  implementation"), 2026-10-23.
- `/studio`: the manifesto.
- **No client work, testimonials, logos or case studies exist.** Never invent
  them, nor numbers of clients, years, or delivered projects.

## Product Principles

1. Prove, don't claim: show the working system instead of describing it.
2. Every state is designed: empty, loading, error, reduced motion and keyboard.
3. Honest commerce: real price floors, no invented scarcity or social proof.
4. One person, start to finish: the work and the conversation stay with the maker.

## Accessibility & Inclusion

The whole archive keeps native semantics, visible focus, keyboard paths and
a reduced-motion path. Commissioned surfaces are held to the same standard.
