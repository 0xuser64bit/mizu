"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "../motion/Preferences";
import { EASE_EXPO } from "../motion/easings";
import { Avatar } from "../content/Media";
import { Button } from "../ui/Button";
import {
  clamp,
  useAnnouncer,
  useControllable,
  useElementSize,
  useIsoLayoutEffect,
} from "./internal";

export type AnnotationReply = {
  id: string;
  author: string;
  body: string;
  time?: string;
};
export type Annotation = {
  id: string;
  /** Position as a fraction of the surface, 0–1. */
  x: number;
  y: number;
  author: string;
  body: string;
  time?: string;
  resolved?: boolean;
  replies?: readonly AnnotationReply[];
};

const makeId = () => `n${Math.random().toString(36).slice(2, 9)}`;
/** Positions stay inside the surface and free of float noise. */
const spot = (n: number) => Math.round(clamp(n, 0.01, 0.99) * 1e4) / 1e4;

/**
 * Review pins on anything: drop a numbered pin, discuss it in a thread,
 * resolve it, and find every conversation in the list beside the work.
 */
export function Annotator({
  label,
  children,
  annotations,
  defaultAnnotations = [],
  onAnnotationsChange,
  author,
  now = "Just now",
  selected,
  defaultSelected = null,
  onSelectedChange,
  createId = makeId,
  className = "",
  style,
}: {
  label: string;
  /** The surface under review: an image, a page, a design. */
  children: ReactNode;
  annotations?: readonly Annotation[];
  defaultAnnotations?: readonly Annotation[];
  onAnnotationsChange?: (annotations: Annotation[]) => void;
  /** Name used for new comments and replies. Omit for a read-only review. */
  author?: string;
  /** Time label for new comments. */
  now?: string;
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (id: string | null) => void;
  createId?: () => string;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const [message, announce] = useAnnouncer();
  const [list, setList] = useControllable<readonly Annotation[]>(
    annotations,
    defaultAnnotations,
    onAnnotationsChange &&
      ((next) => onAnnotationsChange(next as Annotation[])),
  );
  const [open, setOpen] = useControllable<string | null>(
    selected,
    defaultSelected,
    onSelectedChange,
  );
  const [commenting, setCommenting] = useState(false);
  const [draft, setDraft] = useState<{
    x: number;
    y: number;
    body: string;
  } | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [surfaceRef, surface] = useElementSize<HTMLDivElement>();
  const pinRefs = useRef(new Map<string, HTMLButtonElement>());
  const returnFocus = useRef<string | null>(null);
  const editable = !!author;

  const numbered = list.map((a, i) => ({ ...a, number: i + 1 }));
  const shown = numbered.filter(
    (a) => showResolved || !a.resolved || a.id === open,
  );
  const active = numbered.find((a) => a.id === open);
  const openCount = numbered.filter((a) => !a.resolved).length;

  const patch = (
    target: string,
    change: (a: Annotation) => Annotation | null,
  ) =>
    setList(
      list.flatMap((a) =>
        a.id === target ? [change(a)].filter(Boolean) : [a],
      ) as Annotation[],
    );
  const close = () => {
    const target = open ?? returnFocus.current;
    setOpen(null);
    if (target) returnFocus.current = target;
  };
  useIsoLayoutEffect(() => {
    const target = returnFocus.current;
    if (!target || open) return;
    returnFocus.current = null;
    pinRefs.current.get(target)?.focus();
  });

  const place = (x: number, y: number) => {
    setOpen(null);
    setDraft({ x: spot(x), y: spot(y), body: "" });
    announce(
      "New comment. Arrow keys move the pin; type, then press Control or Command Enter to post.",
    );
  };
  const post = () => {
    if (!draft || !draft.body.trim() || !author) return;
    const created: Annotation = {
      id: createId(),
      x: draft.x,
      y: draft.y,
      author,
      body: draft.body.trim(),
      time: now,
    };
    setList([...list, created]);
    setDraft(null);
    setCommenting(false);
    setOpen(created.id);
    announce(`Comment ${list.length + 1} posted.`);
  };

  const onSurfaceDown = (e: PointerEvent<HTMLDivElement>) => {
    if (
      !commenting ||
      e.button !== 0 ||
      (e.target as HTMLElement).closest(
        ".mizu-annotator-pin, .mizu-annotator-thread",
      )
    )
      return;
    const r = e.currentTarget.getBoundingClientRect();
    if (!r.width || !r.height) return;
    // Keep the surface from taking focus back from the composer that opens next.
    e.preventDefault();
    place((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };

  // Keyboard shortcuts while focus is inside the annotator.
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    const typing = (e.target as HTMLElement).closest("textarea, input");
    if (e.key === "Escape") {
      if (draft) {
        e.preventDefault();
        setDraft(null);
        announce("Comment discarded.");
      } else if (open) {
        e.preventDefault();
        close();
      } else if (commenting) setCommenting(false);
      return;
    }
    if (typing) return;
    if (
      (e.key === "c" || e.key === "C") &&
      editable &&
      !e.metaKey &&
      !e.ctrlKey
    ) {
      e.preventDefault();
      setCommenting(!commenting);
      announce(
        commenting
          ? "Comment mode off."
          : "Comment mode: click the work, or press Enter to place a pin.",
      );
    }
  };

  const drag = useRef<{ id: string; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const movePin = (target: string, x: number, y: number) =>
    patch(target, (a) => ({ ...a, x: spot(x), y: spot(y) }));

  const popoverSide = (x: number) =>
    surface.width && x * surface.width + 340 > surface.width ? "left" : "right";
  // Threads open beside their pin, and upward from pins in the lower part of the work.
  const anchor = ({ x, y }: { x: number; y: number }): CSSProperties => ({
    ...(popoverSide(x) === "right"
      ? { left: `${x * 100}%` }
      : { right: `${(1 - x) * 100}%` }),
    ...(y > 0.55 ? { bottom: `${(1 - y) * 100}%` } : { top: `${y * 100}%` }),
  });
  const docked = surface.width > 0 && surface.width < 560;
  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.32, ease: EASE_EXPO };

  return (
    <section
      className={`mizu-annotator ${className}`}
      style={style}
      aria-label={label}
      data-commenting={commenting || undefined}
      onKeyDown={onKey}
    >
      <header className="mizu-annotator-bar">
        <h3>{label}</h3>
        <p>
          {openCount} open
          {list.length - openCount > 0 &&
            ` · ${list.length - openCount} resolved`}
        </p>
        <label className="mizu-annotator-toggle">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
          />
          <span>Show resolved</span>
        </label>
        {editable && (
          <button
            type="button"
            className="mizu-annotator-mode"
            aria-pressed={commenting}
            onClick={() => {
              setCommenting(!commenting);
              setDraft(null);
            }}
          >
            <span aria-hidden="true" />
            {commenting ? "Commenting" : "Comment"}
            <kbd>C</kbd>
          </button>
        )}
      </header>

      <div className="mizu-annotator-body">
        <div
          ref={surfaceRef}
          className="mizu-annotator-surface"
          role="group"
          aria-label={`${label}, ${list.length} comments`}
          aria-describedby={`${id}-help`}
          tabIndex={commenting ? 0 : -1}
          onPointerDown={onSurfaceDown}
          onKeyDown={(e) => {
            if (
              commenting &&
              !draft &&
              e.target === e.currentTarget &&
              e.key === "Enter"
            ) {
              e.preventDefault();
              place(0.5, 0.5);
            }
          }}
        >
          <div className="mizu-annotator-work">{children}</div>
          <ol className="mizu-annotator-pins" aria-label="Comment pins">
            <AnimatePresence initial={false}>
              {shown.map((a) => (
                <motion.li
                  key={a.id}
                  className="mizu-annotator-pin"
                  style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%` }}
                  initial={reduce ? false : { y: -26, opacity: 0, scale: 0.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={
                    reduce
                      ? { opacity: 0, transition: { duration: 0 } }
                      : { opacity: 0, scale: 0.4 }
                  }
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 22 }
                  }
                  data-resolved={a.resolved || undefined}
                  data-open={a.id === open || undefined}
                >
                  <button
                    ref={(el) => {
                      if (el) pinRefs.current.set(a.id, el);
                      else pinRefs.current.delete(a.id);
                    }}
                    type="button"
                    aria-label={`Comment ${a.number} by ${a.author}${a.resolved ? ", resolved" : ""}: ${a.body}`}
                    aria-expanded={a.id === open}
                    aria-controls={a.id === open ? `${id}-thread` : undefined}
                    onPointerDown={(e) => {
                      if (!editable || e.button !== 0) return;
                      e.stopPropagation();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      drag.current = { id: a.id, moved: false };
                    }}
                    onPointerMove={(e) => {
                      const d = drag.current;
                      if (!d || d.id !== a.id || !surfaceRef.current) return;
                      const r = surfaceRef.current.getBoundingClientRect();
                      const x = (e.clientX - r.left) / r.width,
                        y = (e.clientY - r.top) / r.height;
                      if (
                        !d.moved &&
                        Math.hypot((x - a.x) * r.width, (y - a.y) * r.height) <
                          4
                      )
                        return;
                      d.moved = true;
                      movePin(a.id, x, y);
                    }}
                    onPointerUp={() => {
                      const d = drag.current;
                      drag.current = null;
                      dragged.current = !!d?.moved;
                      if (d?.moved) announce(`Moved comment ${a.number}.`);
                    }}
                    onClick={() => {
                      if (dragged.current) {
                        dragged.current = false;
                        return;
                      }
                      setOpen(a.id === open ? null : a.id);
                    }}
                    onKeyDown={(e) => {
                      if (!editable || !e.key.startsWith("Arrow")) return;
                      e.preventDefault();
                      const step = e.shiftKey ? 0.05 : 0.01;
                      const dx =
                          e.key === "ArrowLeft"
                            ? -step
                            : e.key === "ArrowRight"
                              ? step
                              : 0,
                        dy =
                          e.key === "ArrowUp"
                            ? -step
                            : e.key === "ArrowDown"
                              ? step
                              : 0;
                      movePin(a.id, a.x + dx, a.y + dy);
                    }}
                  >
                    <span>{a.number}</span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
            {draft && (
              <li
                className="mizu-annotator-pin"
                data-draft=""
                style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%` }}
              >
                <span className="mizu-annotator-draft-pin" aria-hidden="true">
                  {list.length + 1}
                </span>
              </li>
            )}
          </ol>

          <AnimatePresence>
            {(draft || active) && (
              <motion.div
                key={draft ? "draft" : active!.id}
                id={`${id}-thread`}
                className="mizu-annotator-thread"
                role="dialog"
                aria-label={draft ? "New comment" : `Comment ${active!.number}`}
                data-side={docked ? "dock" : popoverSide((draft ?? active)!.x)}
                data-rise={
                  !docked && (draft ?? active)!.y > 0.55 ? "" : undefined
                }
                style={docked ? undefined : anchor((draft ?? active)!)}
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  reduce
                    ? { opacity: 0, transition: { duration: 0 } }
                    : { opacity: 0, scale: 0.97 }
                }
                transition={transition}
              >
                {draft ? (
                  <Composer
                    label={`Comment ${list.length + 1}`}
                    value={draft.body}
                    onChange={(body) => setDraft({ ...draft, body })}
                    onSubmit={post}
                    onCancel={() => setDraft(null)}
                    onNudge={(dx, dy) =>
                      setDraft({
                        ...draft,
                        x: spot(draft.x + dx),
                        y: spot(draft.y + dy),
                      })
                    }
                    submitLabel="Post"
                  />
                ) : (
                  <Thread
                    annotation={active!}
                    number={active!.number}
                    editable={editable}
                    onReply={(body) => {
                      patch(active!.id, (a) => ({
                        ...a,
                        replies: [
                          ...(a.replies ?? []),
                          { id: createId(), author: author!, body, time: now },
                        ],
                      }));
                      announce("Reply posted.");
                    }}
                    onResolve={() => {
                      patch(active!.id, (a) => ({
                        ...a,
                        resolved: !a.resolved,
                      }));
                      announce(
                        active!.resolved
                          ? `Comment ${active!.number} reopened.`
                          : `Comment ${active!.number} resolved.`,
                      );
                      if (!active!.resolved && !showResolved) close();
                    }}
                    onDelete={() => {
                      patch(active!.id, () => null);
                      setOpen(null);
                      announce(`Comment ${active!.number} deleted.`);
                    }}
                    onClose={close}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="mizu-annotator-list" aria-label="Comments">
          {shown.length ? (
            <ol>
              {shown.map((a) => (
                <li key={a.id} data-resolved={a.resolved || undefined}>
                  <button
                    type="button"
                    aria-current={a.id === open ? "true" : undefined}
                    onClick={() => setOpen(a.id === open ? null : a.id)}
                  >
                    <span className="mizu-annotator-number">{a.number}</span>
                    <span>
                      <strong>{a.author}</strong>
                      <span className="mizu-annotator-excerpt">{a.body}</span>
                      <small>
                        {a.time}
                        {a.replies?.length
                          ? ` · ${a.replies.length} ${a.replies.length === 1 ? "reply" : "replies"}`
                          : ""}
                        {a.resolved ? " · resolved" : ""}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mizu-annotator-empty">
              {list.length
                ? "Every comment is resolved."
                : editable
                  ? "No comments yet. Press C, then click the work."
                  : "No comments."}
            </p>
          )}
        </aside>
      </div>
      <p id={`${id}-help`} className="mizu-sr-only">
        {editable
          ? "Press C for comment mode, then click the work or press Enter to place a pin. Arrow keys move a focused pin."
          : ""}
      </p>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </section>
  );
}

function Composer({
  label,
  value,
  onChange,
  onSubmit,
  onCancel,
  onNudge,
  submitLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onNudge?: (dx: number, dy: number) => void;
  submitLabel: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => ref.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <form
      className="mizu-annotator-composer"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <textarea
        ref={ref}
        className="mizu-input"
        rows={3}
        aria-label={label}
        placeholder="Say what you see…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
          } else if (onNudge && e.altKey && e.key.startsWith("Arrow")) {
            e.preventDefault();
            const step = e.shiftKey ? 0.05 : 0.01;
            onNudge(
              e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0,
              e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0,
            );
          }
        }}
      />
      <div className="mizu-annotator-actions">
        <button type="button" className="mizu-text-button" onClick={onCancel}>
          Cancel
        </button>
        <Button type="submit" size="sm" disabled={!value.trim()} arrow={false}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Thread({
  annotation,
  number,
  editable,
  onReply,
  onResolve,
  onDelete,
  onClose,
}: {
  annotation: Annotation;
  number: number;
  editable: boolean;
  onReply: (body: string) => void;
  onResolve: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [reply, setReply] = useState("");
  const messages = [
    {
      id: annotation.id,
      author: annotation.author,
      body: annotation.body,
      time: annotation.time,
    },
    ...(annotation.replies ?? []),
  ];
  return (
    <>
      <div className="mizu-annotator-thread-head">
        <span className="mizu-annotator-number">{number}</span>
        {editable && (
          <button
            type="button"
            className="mizu-text-button"
            onClick={onResolve}
          >
            {annotation.resolved ? "Reopen" : "Resolve"}
          </button>
        )}
        <button
          type="button"
          className="mizu-annotator-close"
          aria-label="Close comment"
          onClick={onClose}
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      </div>
      <ol className="mizu-annotator-messages">
        {messages.map((m) => (
          <li key={m.id}>
            <Avatar name={m.author} size={28} />
            <div>
              <p>
                <strong>{m.author}</strong>
                {m.time && <time>{m.time}</time>}
              </p>
              <p>{m.body}</p>
            </div>
          </li>
        ))}
      </ol>
      {editable && (
        <>
          <form
            className="mizu-annotator-composer"
            onSubmit={(e) => {
              e.preventDefault();
              if (!reply.trim()) return;
              onReply(reply.trim());
              setReply("");
            }}
          >
            <textarea
              className="mizu-input"
              rows={2}
              aria-label={`Reply to comment ${number}`}
              placeholder="Reply…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  (e.metaKey || e.ctrlKey) &&
                  reply.trim()
                ) {
                  e.preventDefault();
                  onReply(reply.trim());
                  setReply("");
                }
              }}
            />
            <div className="mizu-annotator-actions">
              <button
                type="button"
                className="mizu-text-button mizu-annotator-delete"
                onClick={onDelete}
              >
                Delete
              </button>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                disabled={!reply.trim()}
                arrow={false}
              >
                Reply
              </Button>
            </div>
          </form>
        </>
      )}
    </>
  );
}
