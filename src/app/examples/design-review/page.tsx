import type { Metadata } from "next";
import { ExampleShell } from "@/components/examples/ExampleShell";
import { DesignReview } from "@/components/examples/DesignReview";

export const metadata: Metadata = {
  title: "Design review example",
  description:
    "Triage submissions at the speed of a gesture, pin comments where they belong, and arrange the decisions on a board.",
  alternates: { canonical: "/examples/design-review" },
};

export default function DesignReviewPage() {
  return (
    <ExampleShell
      number="02"
      title="Design review"
      systems={["TriageDeck", "Annotator", "Board", "Gallery"]}
      lede={
        <p>
          Eight key-art submissions for a harbour app. Pin comments on the one
          in front of you, then fling it toward Ship, Revise or Discuss — each
          decision lands on the board, where you can still move it. Open any
          card to see its submission large. Invented work by invented designers.
        </p>
      }
    >
      <DesignReview />
    </ExampleShell>
  );
}
