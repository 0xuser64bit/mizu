import { card } from "@/lib/og/card";
import { COMMISSIONS, usd } from "./brief";

export { contentType, size } from "@/lib/og/card";
export const alt = "Have it made: commission interface work from Mizu Studio.";

const FLOOR = usd(Math.min(...COMMISSIONS.map((c) => c.from)));

export default function Image() {
  return card({
    label: "Mizu Studio",
    title: "Have it",
    accent: "made.",
    line: "Signature interfaces, design systems, craft passes and launch sites. One person, start to finish.",
    path: "/work",
    foot: `Commissions from ${FLOOR}`,
  });
}
