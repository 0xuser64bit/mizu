import type { Metadata } from "next";
import { ExampleShell } from "@/components/examples/ExampleShell";
import { AudioWorkbench } from "@/components/examples/AudioWorkbench";

export const metadata: Metadata = {
  title: "Audio workbench example",
  description:
    "Listen, select a passage, and turn an audio recording into a structured review with timestamped notes.",
  alternates: { canonical: "/examples/audio-workbench" },
};

export default function AudioWorkbenchPage() {
  return (
    <ExampleShell
      number="04"
      title="Audio workbench"
      systems={["Waveform", "RangeSelector", "Outliner", "SplitPane"]}
      lede={
        <p>
          Listen closely. Select the part worth keeping, collect your
          observations, and take the notes with you. A real recording, its
          transcript, and an editable outline share one working surface. The
          sample voice and script are synthetic.
        </p>
      }
    >
      <AudioWorkbench />
    </ExampleShell>
  );
}
