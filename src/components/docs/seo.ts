import type { ComponentMeta } from "./registry";

export const titleOf = (c: ComponentMeta) =>
  c.kind === "overview"
    ? `${c.name}: React primitives`
    : `${c.name} React component`;

export function descriptionOf(c: ComponentMeta) {
  const full = `${c.tagline} Live demo, usage, props and accessibility notes.`;
  return full.length <= 160 ? full : c.tagline;
}
