"use client";

import { useRef, useState } from "react";
import {
  TransferQueue,
  type TransferFunction,
  type TransferQueueHandle,
} from "@/mizu";
import { Scenarios } from "./shared";

/** A named file with a declared size and no contents, so samples cost no memory. */
class SampleFile extends File {
  #size: number;
  constructor(name: string, size: number, type = "") {
    super([], name, { type });
    this.#size = size;
  }
  override get size() {
    return this.#size;
  }
}
const MB = 1024 * 1024;
const samples = () => [
  new SampleFile("launch-film.mp4", 48 * MB, "video/mp4"),
  new SampleFile("press-kit.zip", 12 * MB, "application/zip"),
  new SampleFile("cover.png", 3.2 * MB, "image/png"),
  new SampleFile("transcript.pdf", 0.8 * MB, "application/pdf"),
  new SampleFile("raw-footage.mov", 96 * MB, "video/quicktime"),
];

type Scenario = "steady" | "flaky";

export function TransferQueueShowcase() {
  const [scenario, setScenario] = useState<Scenario>("steady");
  const [finished, setFinished] = useState<string[]>([]);
  const queue = useRef<TransferQueueHandle>(null);
  // A simulated network: nothing leaves the browser. It honours the abort signal like a real upload.
  const simulate: TransferFunction = (file, { signal, onProgress }) =>
    new Promise((resolve, reject) => {
      const rate = (3 + Math.random() * 7) * MB;
      let loaded = 0;
      const timer = window.setInterval(() => {
        loaded = Math.min(
          file.size,
          loaded + rate * 0.1 * (0.5 + Math.random()),
        );
        if (
          scenario === "flaky" &&
          file.name.startsWith("raw") &&
          loaded > file.size * 0.6
        ) {
          window.clearInterval(timer);
          reject(new Error("Connection reset by the server"));
          return;
        }
        onProgress(loaded);
        if (loaded >= file.size) {
          window.clearInterval(timer);
          resolve(undefined);
        }
      }, 100);
      signal.addEventListener("abort", () => {
        window.clearInterval(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Network"
        value={scenario}
        onChange={(v) => {
          setScenario(v);
          setFinished([]);
        }}
        options={[
          { value: "steady", label: "Steady" },
          { value: "flaky", label: "Drops the large video" },
        ]}
        note="Simulated network: files you drop never leave your browser. Pause restarts a transfer unless your function resumes from an offset."
      />
      <div className="mizu-showcase-readout">
        <span>Handle</span>
        <button
          type="button"
          className="mizu-text-button"
          onClick={() => queue.current?.add(samples())}
        >
          Add five sample files
        </button>
        {finished.length > 0 && (
          <output>onComplete → {finished.slice(-2).join(", ")}</output>
        )}
      </div>
      <TransferQueue
        key={scenario}
        ref={queue}
        label="Uploads"
        transfer={simulate}
        concurrency={2}
        maxSize={200 * MB}
        onComplete={(item) => setFinished((f) => [...f, item.file.name])}
      />
    </div>
  );
}
