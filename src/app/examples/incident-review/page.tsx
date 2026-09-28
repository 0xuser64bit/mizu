import { ExampleShell } from "@/components/examples/ExampleShell";
import { IncidentReview } from "@/components/examples/IncidentReview";

export const metadata = {
  title: "Incident review — Mizu examples",
  description:
    "A post-incident review where a timeline, two charts and the logs share one moment and one window.",
};

export default function IncidentReviewPage() {
  return (
    <ExampleShell
      number="01"
      title="Incident review"
      systems={["Chronicle", "TrendChart", "LogStream", "SplitFlap"]}
      lede={
        <p>
          INC-2231, berth sync outage. A deploy shrank a connection pool from 40
          to 8 and schedules stopped loading for ten minutes. The timeline, the
          charts and the logs share one moment and one window: drag the
          playhead, pick an event or open a log line and the others follow; zoom
          any of them and the rest keep pace. Invented service, invented people.
        </p>
      }
    >
      <IncidentReview />
    </ExampleShell>
  );
}
