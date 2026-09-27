import type { ComponentMeta, PropDoc } from "../registry";

export function define(
  name: string,
  category: ComponentMeta["category"],
  source: string,
  tagline: string,
  example: string,
  props: PropDoc[],
  a11y: string,
  motion = "CSS transitions explain state changes. Reduced motion removes travel.",
  imports = name,
): ComponentMeta {
  return {
    name,
    slug: name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
    category,
    source,
    tagline,
    usage: `${example.includes("useState") ? 'import { useState } from "react";\n' : ""}import { ${imports} } from "mizu-ui";\n\nexport function Example() {\n${example}\n}`,
    props,
    a11y,
    motion,
  };
}
export const prop = (
  name: string,
  type: string,
  desc: string,
  def?: string,
): PropDoc => ({ name, type, desc, def });
