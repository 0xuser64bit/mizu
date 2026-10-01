import type { Metadata } from "next";
import { ExampleShell } from "@/components/examples/ExampleShell";
import { AutomationBuilder } from "@/components/examples/AutomationBuilder";

export const metadata: Metadata = {
  title: "Automation builder example",
  description:
    "Wire a flow, write its condition as a query, and see which records take which path before anything runs.",
  alternates: { canonical: "/examples/automation" },
};

export default function AutomationPage() {
  return (
    <ExampleShell
      number="03"
      title="Automation builder"
      systems={["FlowGraph", "QueryBuilder", "SplitFlap"]}
      lede={
        <p>
          A harbour routes each new berth booking: big commercial vessels get a
          crane berth, everything else queues. Edit the condition and the
          flow&apos;s description, the count and every row&apos;s route update
          at once; run the flow to watch a booking take its path. Rewire or
          rearrange the steps as you like. Invented vessels and agents.
        </p>
      }
    >
      <AutomationBuilder />
    </ExampleShell>
  );
}
