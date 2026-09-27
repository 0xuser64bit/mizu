"use client";

import { useState } from "react";
import { MotionPreferences } from "@/mizu";
import { DemoSlot } from "./DemoSlot";
export function PreviewStage({ slug }: { slug: string }) {
  const [reduced, setReduced] = useState(false);
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
      </div>
      <div
        data-theme={theme === "inherit" ? undefined : theme}
        className="mizu-preview-stage mizu-root"
        style={{ maxWidth: narrow ? 320 : undefined }}
      >
        <MotionPreferences reduced={reduced ? true : undefined}>
          <DemoSlot key={replay} slug={slug} />
        </MotionPreferences>
      </div>
    </div>
  );
}
