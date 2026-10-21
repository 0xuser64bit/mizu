"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MotionPreferences } from "@/mizu";
import { DemoSlot } from "./DemoSlot";
import type { PlaygroundPiece } from "@/components/workshop/playground";
const PropsPlayground = dynamic(() =>
  import("@/components/workshop/PropsPlayground").then(
    (module) => module.PropsPlayground,
  ),
);
const editable = new Set(["button", "badge", "text-field", "alert", "slider"]);
export function PreviewStage({
  slug,
  usage = false,
}: {
  slug: string;
  usage?: boolean;
}) {
  const [reduced, setReduced] = useState(false);
  const [editing, setEditing] = useState(false);
  const [narrow, setNarrow] = useState(false),
    [theme, setTheme] = useState<"inherit" | "light" | "dark">("inherit"),
    [replay, setReplay] = useState(0);
  return (
    <div className="mizu-preview">
      <div className="mizu-preview-tools">
        <button
          type="button"
          aria-pressed={narrow}
          onClick={() => setNarrow(!narrow)}
        >
          {narrow ? "Full width" : "Narrow preview"}
        </button>
        <label>
          <span className="mizu-sr-only">Preview theme</span>
          <select
            aria-label="Preview theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as typeof theme)}
          >
            <option value="inherit">Page theme</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <button
          type="button"
          aria-pressed={reduced}
          onClick={() => setReduced(!reduced)}
        >
          Reduce motion
        </button>
        <button type="button" onClick={() => setReplay((v) => v + 1)}>
          Reset demo
        </button>
        {!usage && editable.has(slug) && (
          <button
            type="button"
            aria-expanded={editing}
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Close prop controls" : "Edit props & copy JSX"}
          </button>
        )}
      </div>
      <div
        data-theme={theme === "inherit" ? undefined : theme}
        className="mizu-preview-stage mizu-root"
        style={{ maxWidth: narrow ? 320 : undefined }}
      >
        <MotionPreferences reduced={reduced ? true : undefined}>
          <DemoSlot key={replay} slug={slug} usage={usage} />
        </MotionPreferences>
      </div>
      {editing && (
        <div className="mizu-inline-playground">
          <PropsPlayground initialPiece={slug as PlaygroundPiece} />
        </div>
      )}
    </div>
  );
}
