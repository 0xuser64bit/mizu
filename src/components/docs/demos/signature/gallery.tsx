"use client";

import { useState } from "react";
import { Gallery, SegmentedControl } from "@/mizu";
import { PLATES } from "./plates";
import { Scenarios } from "./shared";

type Scenario = "plates" | "loading" | "empty";

export function GalleryShowcase() {
  const [scenario, setScenario] = useState<Scenario>("plates");
  const [rowHeight, setRowHeight] = useState("220");
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="State"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setOpen(null);
        }}
        options={[
          { value: "plates", label: "Collection" },
          { value: "loading", label: "Loading" },
          { value: "empty", label: "Empty" },
        ]}
        note="Open a plate and it lifts out of the grid. Swipe or use ← → to travel, pull down or press Esc to put it back; pinch, Ctrl-scroll or double-tap to zoom. Plates are drawn in the browser."
      />
      <Gallery
        label="Plates — generated landscapes"
        items={scenario === "empty" ? [] : PLATES}
        loading={scenario === "loading"}
        empty="No plates in this collection yet."
        rowHeight={Number(rowHeight)}
        index={open}
        onIndexChange={setOpen}
      />
      <div className="mizu-showcase-readout">
        <span>index · rowHeight</span>
        {open === null ? "Viewer closed" : `Open: ${PLATES[open]?.caption}`}
        <SegmentedControl
          label="Row height"
          value={rowHeight}
          onValueChange={setRowHeight}
          options={[
            { value: "150", label: "150" },
            { value: "220", label: "220" },
            { value: "300", label: "300" },
          ]}
        />
      </div>
    </div>
  );
}
