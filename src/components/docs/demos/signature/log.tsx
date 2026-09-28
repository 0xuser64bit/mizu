"use client";

import { useEffect, useRef, useState } from "react";
import { LogStream, SegmentedControl, type LogLine } from "@/mizu";
import { harbourLine, harbourReplay } from "./harbour";
import { Scenarios, seeded } from "./shared";

type Scenario = "live" | "replay" | "loading" | "empty";
type Rate = "calm" | "busy" | "incident";

const REPLAY = harbourReplay();
const KEEP = 2000;
const TROUBLE: Record<Rate, number> = { calm: 0, busy: 0.15, incident: 0.8 };
const EVERY: Record<Rate, number> = { calm: 700, busy: 180, incident: 90 };

function Live() {
  const [rate, setRate] = useState<Rate>("calm");
  const [lines, setLines] = useState<LogLine[]>([]);
  const nextRef = useRef(0);
  const randRef = useRef(seeded(7));
  useEffect(() => {
    const tick = setInterval(() => {
      const burst =
        1 + Math.floor(randRef.current() * (rate === "calm" ? 1.4 : 3));
      const fresh = Array.from({ length: burst }, () =>
        harbourLine(
          randRef.current,
          nextRef.current++,
          Date.now(),
          TROUBLE[rate],
        ),
      );
      // Keep a bounded window, as a real tail would.
      setLines((l) => [...l, ...fresh].slice(-KEEP));
    }, EVERY[rate]);
    return () => clearInterval(tick);
  }, [rate]);
  return (
    <>
      <LogStream
        label="harbour-api"
        lines={lines}
        empty="Waiting for the first line…"
      />
      <div className="mizu-showcase-readout">
        <span>Source rate · keeps the last {KEEP} lines</span>
        <SegmentedControl
          label="Rate"
          value={rate}
          onValueChange={(v) => setRate(v as Rate)}
          options={[
            { value: "calm", label: "Calm" },
            { value: "busy", label: "Busy" },
            { value: "incident", label: "Incident" },
          ]}
        />
        <output>{lines.length} lines</output>
      </div>
    </>
  );
}

export function LogStreamShowcase() {
  const [scenario, setScenario] = useState<Scenario>("live");
  const [picked, setPicked] = useState<LogLine["id"] | null>(null);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Source"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setPicked(null);
        }}
        options={[
          { value: "live", label: "Live tail" },
          { value: "replay", label: "Incident replay" },
          { value: "loading", label: "Loading" },
          { value: "empty", label: "Empty" },
        ]}
        note="It follows new lines until you scroll up, then counts what you missed. Filter by level, search with Enter to step through matches, and pick a line to read it whole. The overview above the lines is clickable. The service is invented."
      />
      {scenario === "live" ? (
        <Live />
      ) : scenario === "replay" ? (
        <>
          <LogStream
            label="harbour-api, 14 Sep 09:00–10:00 UTC"
            lines={REPLAY}
            utc
            selected={picked}
            onSelectedChange={setPicked}
          />
          <p className="mizu-showcase-readout">
            <span>selected · onSelectedChange</span>
            {picked === null ? "No line selected" : `Line ${picked}`}
          </p>
        </>
      ) : (
        <LogStream
          key={scenario}
          label="harbour-api"
          lines={[]}
          loading={scenario === "loading"}
          empty="No lines in this window."
        />
      )}
    </div>
  );
}
