"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "../motion/Preferences.tsx";
import { EASE_EXPO } from "../motion/easings.ts";
import { FileDropzone } from "../forms/FileDropzone.tsx";
import { Sparkline } from "../data/Charts.tsx";
import { useAnnouncer, useLatest } from "./internal.ts";
import { formatDuration } from "./time.ts";

export type TransferStatus = "queued" | "active" | "paused" | "done" | "failed";
export type TransferItem = {
  id: string;
  file: File;
  status: TransferStatus;
  loaded: number;
  /** Bytes per second, smoothed. */
  speed: number;
  error?: string;
};
export type TransferFunction = (
  file: File,
  context: {
    signal: AbortSignal;
    onProgress: (loaded: number, total?: number) => void;
  },
) => Promise<unknown>;

const units = ["B", "KB", "MB", "GB", "TB"];
const formatBytes = (n: number) => {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(n) / Math.log(1024)),
  );
  const v = n / 1024 ** i;
  return `${v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
};
const extension = (name: string) =>
  name.includes(".")
    ? name.split(".").pop()!.slice(0, 4).toUpperCase()
    : "FILE";
let sequence = 0;
export type TransferQueueHandle = { add: (files: readonly File[]) => void };

/**
 * Transfers you can watch and steer: a concurrency-limited queue around your
 * own transfer function, with live speed, time left, pause, retry and cancel.
 */
export const TransferQueue = forwardRef<
  TransferQueueHandle,
  {
    label: string;
    /** Your upload (or any transfer). Honour the signal; report progress in bytes. */
    transfer: TransferFunction;
    concurrency?: number;
    accept?: string;
    maxSize?: number;
    onComplete?: (item: TransferItem) => void;
    onItemsChange?: (items: readonly TransferItem[]) => void;
    className?: string;
    style?: CSSProperties;
  }
>(function TransferQueue(
  {
    label,
    transfer,
    concurrency = 2,
    accept,
    maxSize,
    onComplete,
    onItemsChange,
    className = "",
    style,
  },
  ref,
) {
  const reduce = useReducedMotion();
  const [message, announce] = useAnnouncer();
  const [items, setItems] = useState<readonly TransferItem[]>([]);
  const [trace, setTrace] = useState<number[]>([]);
  const controllers = useRef(new Map<string, AbortController>());
  const progress = useRef(
    new Map<string, { loaded: number; at: number; speed: number }>(),
  );
  const flush = useRef(0);
  const transferRef = useLatest(transfer);
  const completeRef = useLatest(onComplete);
  const changeRef = useLatest(onItemsChange);

  const update = setItems;
  useEffect(() => {
    changeRef.current?.(items);
  }, [items, changeRef]);

  // Progress arrives far more often than frames; apply it once per frame.
  const schedule = () => {
    if (flush.current) return;
    flush.current = requestAnimationFrame(() => {
      flush.current = 0;
      update((all) =>
        all.map((item) => {
          const p = progress.current.get(item.id);
          return p &&
            item.status === "active" &&
            (p.loaded !== item.loaded || p.speed !== item.speed)
            ? { ...item, loaded: p.loaded, speed: p.speed }
            : item;
        }),
      );
    });
  };
  useEffect(
    () => () => {
      cancelAnimationFrame(flush.current);
      for (const c of controllers.current.values()) c.abort();
    },
    [],
  );

  const start = (item: TransferItem) => {
    const controller = new AbortController();
    controllers.current.set(item.id, controller);
    progress.current.set(item.id, {
      loaded: 0,
      at: performance.now(),
      speed: 0,
    });
    transferRef
      .current(item.file, {
        signal: controller.signal,
        onProgress: (loaded) => {
          const p = progress.current.get(item.id);
          if (!p || controller.signal.aborted) return;
          const now = performance.now();
          const dt = (now - p.at) / 1000;
          if (dt > 0.05) {
            const instant = Math.max(0, (loaded - p.loaded) / dt);
            p.speed = p.speed ? p.speed * 0.7 + instant * 0.3 : instant;
            p.at = now;
          }
          p.loaded = Math.min(loaded, item.file.size);
          schedule();
        },
      })
      .then(
        () => {
          if (controller.signal.aborted) return;
          controllers.current.delete(item.id);
          const finished = {
            ...item,
            status: "done" as const,
            loaded: item.file.size,
            speed: 0,
          };
          update((all) => all.map((i) => (i.id === item.id ? finished : i)));
          completeRef.current?.(finished);
          announce(`${item.file.name} finished.`);
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          controllers.current.delete(item.id);
          const reason =
            error instanceof Error && error.message
              ? error.message
              : "Transfer failed";
          update((all) =>
            all.map((i) =>
              i.id === item.id
                ? { ...i, status: "failed", speed: 0, error: reason }
                : i,
            ),
          );
          announce(`${item.file.name} failed: ${reason}.`);
        },
      );
  };

  // The runner: keep up to `concurrency` transfers active.
  useEffect(() => {
    const active = items.filter((i) => i.status === "active").length;
    const waiting = items.filter(
      (i) => i.status === "active" && !controllers.current.has(i.id),
    );
    for (const item of waiting) start(item);
    const free = Math.max(0, concurrency - active);
    if (!free) return;
    const next = items.filter((i) => i.status === "queued").slice(0, free);
    if (next.length)
      update((all) =>
        all.map((i) =>
          next.some((n) => n.id === i.id)
            ? { ...i, status: "active", loaded: 0 }
            : i,
        ),
      );
    // start() is stable enough: it reads the latest transfer through a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, concurrency]);

  // A throughput trace for the whole queue, sampled twice a second while anything moves.
  const busy = items.some((i) => i.status === "active");
  const speedRef = useLatest(
    items.reduce((s, i) => s + (i.status === "active" ? i.speed : 0), 0),
  );
  useEffect(() => {
    if (!busy) return;
    const timer = window.setInterval(
      () => setTrace((t) => [...t.slice(-39), speedRef.current]),
      500,
    );
    return () => window.clearInterval(timer);
  }, [busy, speedRef]);

  const stop = (id: string, status: TransferStatus | null) => {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    progress.current.delete(id);
    update((all) =>
      status === null
        ? all.filter((i) => i.id !== id)
        : all.map((i) => (i.id === id ? { ...i, status, speed: 0 } : i)),
    );
  };
  const add = (files: readonly File[]) => {
    if (!files.length) return;
    const fresh = files.map((file) => ({
      id: `t${++sequence}`,
      file,
      status: "queued" as const,
      loaded: 0,
      speed: 0,
    }));
    update((all) => [...all, ...fresh]);
    announce(
      `${fresh.length} ${fresh.length === 1 ? "file" : "files"} queued.`,
    );
  };
  useImperativeHandle(ref, () => ({ add }));

  const total = items
    .filter((i) => i.status !== "failed")
    .reduce((s, i) => s + i.file.size, 0);
  const loaded = items
    .filter((i) => i.status !== "failed")
    .reduce((s, i) => s + (i.status === "done" ? i.file.size : i.loaded), 0);
  const speed = items.reduce(
    (s, i) => s + (i.status === "active" ? i.speed : 0),
    0,
  );
  const done = items.filter((i) => i.status === "done").length;
  const failed = items.filter((i) => i.status === "failed").length;
  const eta = speed > 0 ? ((total - loaded) / speed) * 1000 : NaN;
  const share = total ? loaded / total : 0;
  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.34, ease: EASE_EXPO };

  return (
    <section
      className={`mizu-transfer ${className}`}
      style={style}
      aria-label={label}
    >
      <header className="mizu-transfer-summary">
        <div>
          <p className="mizu-transfer-figure">
            {Math.round(share * 100)}
            <small>%</small>
          </p>
          <p className="mizu-transfer-counts">
            {done} of {items.length} done{failed ? ` · ${failed} failed` : ""}
          </p>
        </div>
        <div className="mizu-transfer-rate">
          <Sparkline
            label="Throughput"
            values={trace.length > 1 ? trace : [0, 0]}
          />
          <p>
            <span>{busy ? `${formatBytes(speed)}/s` : "Idle"}</span>
            <span>
              {busy && Number.isFinite(eta)
                ? `${formatDuration(eta)} left`
                : `${formatBytes(loaded)} of ${formatBytes(total)}`}
            </span>
          </p>
        </div>
        <div
          className="mizu-transfer-bar"
          role="progressbar"
          aria-label={`${label} overall`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(share * 100)}
        >
          <span style={{ transform: `scaleX(${share})` }} />
        </div>
      </header>

      <FileDropzone
        label={`Add files to ${label.toLowerCase()}`}
        multiple
        accept={accept}
        maxSize={maxSize}
        onFilesChange={add}
      />

      {items.length > 0 && (
        <ol className="mizu-transfer-list">
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const pct = item.file.size ? item.loaded / item.file.size : 1;
              const left =
                item.speed > 0
                  ? ((item.file.size - item.loaded) / item.speed) * 1000
                  : NaN;
              const state: ReactNode =
                item.status === "active"
                  ? `${Math.round(pct * 100)}% · ${formatBytes(item.speed)}/s${Number.isFinite(left) ? ` · ${formatDuration(left)} left` : ""}`
                  : item.status === "queued"
                    ? "Waiting"
                    : item.status === "paused"
                      ? `Paused at ${Math.round(pct * 100)}%`
                      : item.status === "done"
                        ? "Done"
                        : item.error;
              return (
                <motion.li
                  key={item.id}
                  layout="position"
                  initial={reduce ? false : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reduce
                      ? { opacity: 0, transition: { duration: 0 } }
                      : { opacity: 0, height: 0 }
                  }
                  transition={transition}
                  className="mizu-transfer-item"
                  data-status={item.status}
                >
                  <span className="mizu-transfer-type" aria-hidden="true">
                    {extension(item.file.name)}
                  </span>
                  <div className="mizu-transfer-main">
                    <p className="mizu-transfer-name">
                      <span>{item.file.name}</span>
                      <small>{formatBytes(item.file.size)}</small>
                    </p>
                    <div
                      className="mizu-transfer-line"
                      role="progressbar"
                      aria-label={item.file.name}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(pct * 100)}
                      aria-valuetext={
                        typeof state === "string" ? state : undefined
                      }
                    >
                      <span
                        style={{
                          transform: `scaleX(${item.status === "queued" ? 0 : pct})`,
                        }}
                      />
                    </div>
                    <p
                      className="mizu-transfer-state"
                      role={item.status === "failed" ? "alert" : undefined}
                    >
                      {item.status === "done" && <i aria-hidden="true" />}
                      {state}
                    </p>
                  </div>
                  <div className="mizu-transfer-actions">
                    {item.status === "active" && (
                      <button
                        type="button"
                        onClick={() => stop(item.id, "paused")}
                        aria-label={`Pause ${item.file.name}`}
                      >
                        Pause
                      </button>
                    )}
                    {item.status === "paused" && (
                      <button
                        type="button"
                        onClick={() =>
                          update((all) =>
                            all.map((i) =>
                              i.id === item.id
                                ? { ...i, status: "queued", loaded: 0 }
                                : i,
                            ),
                          )
                        }
                        aria-label={`Resume ${item.file.name}`}
                      >
                        Resume
                      </button>
                    )}
                    {item.status === "failed" && (
                      <button
                        type="button"
                        onClick={() =>
                          update((all) =>
                            all.map((i) =>
                              i.id === item.id
                                ? {
                                    ...i,
                                    status: "queued",
                                    loaded: 0,
                                    error: undefined,
                                  }
                                : i,
                            ),
                          )
                        }
                        aria-label={`Retry ${item.file.name}`}
                      >
                        Retry
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        stop(item.id, null);
                        announce(
                          `${item.file.name} ${item.status === "done" ? "cleared" : "cancelled"}.`,
                        );
                      }}
                      aria-label={`${item.status === "done" ? "Clear" : "Cancel"} ${item.file.name}`}
                    >
                      {item.status === "done" ? "Clear" : "Cancel"}
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      )}
      {done > 0 && (
        <button
          type="button"
          className="mizu-text-button mizu-transfer-clear"
          onClick={() =>
            update((all) => all.filter((i) => i.status !== "done"))
          }
        >
          Clear finished
        </button>
      )}
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </section>
  );
});
