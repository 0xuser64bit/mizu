"use client";

import { useEffect, useRef, useState } from "react";

async function copyFrom(url: string) {
  const text = fetch(url).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.text();
  });
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write)
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })),
      }),
    ]);
  else await navigator.clipboard.writeText(await text);
}

export function PageActions({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const markdown = `/components/${slug}.md`;
  return (
    <p className="mizu-page-actions">
      <button
        type="button"
        className="mizu-copy-button"
        data-copied={state === "copied" || undefined}
        onClick={() => {
          window.clearTimeout(timer.current);
          copyFrom(markdown)
            .then(
              () => "copied" as const,
              () => "failed" as const,
            )
            .then((next) => {
              setState(next);
              timer.current = window.setTimeout(() => setState("idle"), 1800);
            });
        }}
      >
        <span aria-live="polite">
          {state === "copied"
            ? "Copied as Markdown"
            : state === "failed"
              ? "Copy failed. Try again."
              : "Copy as Markdown"}
        </span>
      </button>
      <a href={markdown} className="mizu-copy-button">
        View .md
      </a>
    </p>
  );
}
