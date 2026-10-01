import type { ComponentMeta } from "./registry";

/** "Button React component": the words someone looking for it types, then the brand. */
export const titleOf = (c: ComponentMeta) =>
  c.kind === "overview"
    ? `${c.name}: React primitives`
    : `${c.name} React component`;

/** The tagline, plus what the page holds when that still fits a search snippet. */
export function descriptionOf(c: ComponentMeta) {
  const full = `${c.tagline} Live demo, usage, props and accessibility notes.`;
  return full.length <= 160 ? full : c.tagline;
}
