import { card } from "@/lib/og/card";

export { contentType, size } from "@/lib/og/card";
export const alt =
  "Automation builder, a Mizu example: Wire a flow, write its condition as a query, and see which records take which path before anything runs.";

export default function Image() {
  return card({
    label: "Example",
    title: "Automation builder",
    line: "Wire a flow, write its condition as a query, and see which records take which path before anything runs.",
    path: "/examples/automation",
  });
}
