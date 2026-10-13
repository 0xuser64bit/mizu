import { CATEGORIES, SYSTEMS } from "@/components/docs/registry";
import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt = `Mizu: ${SYSTEMS.length} React component systems in ${CATEGORIES.length} families.`;

export default function Image() {
  return card({
    label: "The archive",
    title: `${SYSTEMS.length} systems,`,
    accent: `${CATEGORIES.length} families.`,
    line: "Timelines, charts, editors, flows, forms and data, each with a live demo, props and source.",
    path: "/components",
  });
}
