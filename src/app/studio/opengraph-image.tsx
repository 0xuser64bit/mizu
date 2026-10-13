import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt = "The Mizu standpoint: a manifesto for interface craft.";

export default function Image() {
  return card({
    label: "Standpoint",
    title: "What Mizu",
    accent: "is.",
    line: "Surfaces before components, motion as a material, and systems that hold up beyond a screenshot.",
    path: "/studio",
  });
}
