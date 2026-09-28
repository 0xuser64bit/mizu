"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useReducedMotion } from "../motion/Preferences";
import { useElementSize, useIsoLayoutEffect } from "./internal";

/** The container width where notes move into the margin; mirrored in folio.css. */
const MARGIN_AT = 880;
const WORDS_PER_MINUTE = 230;
const NOTE_GAP = 18;

type Heading = { id: string; text: string; level: 2 | 3 };
const Placement = createContext<"margin" | "inline">("inline");

/**
 * A long-form reading surface: sidenotes sit in the margin beside their
 * marks and fold into the text on narrow screens, while a contents rail and
 * a progress line keep your place. Headings with an id become the contents.
 */
export function Folio({
  label,
  children,
  contents = true,
  className = "",
  style,
}: {
  label: string;
  /** Prose: paragraphs, h2 and h3 headings, blockquotes — and Sidenotes inside them. */
  children: ReactNode;
  /** Show the contents rail, built from headings with an id, when there is room. */
  contents?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const [rootRef, { width }] = useElementSize<HTMLElement>();
  const bodyRef = useRef<HTMLDivElement>(null);
  const placement = width >= MARGIN_AT ? "margin" : "inline";
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(0);
  const [progress, setProgress] = useState(0);
  // Progress only counts once the reader has scrolled; a short article starts unread.
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setProgress(Math.round(p * 100) / 100),
  );

  // Margin notes start level with their mark; later ones step down rather than overlap.
  useIsoLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const place = () => {
      let floor = -Infinity;
      for (const note of body.querySelectorAll<HTMLElement>(
        ".mizu-sidenote-note",
      )) {
        if (placement !== "margin") {
          note.style.translate = "";
          continue;
        }
        const top = note.offsetTop,
          shift = Math.max(0, floor - top);
        note.style.translate = shift ? `0 ${Math.round(shift)}px` : "";
        floor = top + shift + note.offsetHeight + NOTE_GAP;
      }
      body.style.minHeight = floor > 0 ? `${Math.ceil(floor)}px` : "";
    };
    place();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(body);
    // Web fonts change line breaks; a superseded pass must not undo a newer one.
    let live = true;
    void document.fonts?.ready.then(() => live && place());
    return () => {
      live = false;
      observer?.disconnect();
    };
  }, [placement, children]);

  // Contents from the headings, the section in view, and the reading time.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    let frame = 0;
    const nodes = () => [
      ...body.querySelectorAll<HTMLElement>("h2[id], h3[id]"),
    ];
    const collect = () => {
      setHeadings(
        nodes().map((h) => ({
          id: h.id,
          text: h.textContent ?? "",
          level: h.tagName === "H3" ? 3 : 2,
        })),
      );
      const words = (body.textContent ?? "").split(/\s+/).filter(Boolean);
      setMinutes(Math.max(1, Math.round(words.length / WORDS_PER_MINUTE)));
    };
    const spy = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const h of nodes())
        if (h.getBoundingClientRect().top <= line) current = h.id;
      setActive(current);
    };
    const onScroll = () => {
      setScrolled(true);
      if (!frame) frame = requestAnimationFrame(spy);
    };
    const observer = new MutationObserver(collect);
    observer.observe(body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    frame = requestAnimationFrame(() => {
      collect();
      spy();
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, []);

  const jump = (e: MouseEvent<HTMLAnchorElement>, target: string) => {
    const heading = document.getElementById(target);
    if (!heading) return;
    e.preventDefault();
    heading.scrollIntoView?.({
      block: "start",
      behavior: reduce ? "auto" : "smooth",
    });
    // Continue keyboard navigation and screen reading from the section.
    if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    history.replaceState(null, "", `#${target}`);
  };

  const remaining = Math.ceil(minutes * (1 - progress));
  return (
    <Placement.Provider value={placement}>
      <article
        ref={rootRef}
        className={`mizu-folio ${className}`}
        style={style}
        aria-label={label}
        data-contents={contents ? undefined : "none"}
      >
        <div className="mizu-folio-frame">
          <div className="mizu-folio-progress" aria-hidden="true">
            <motion.span style={{ scaleX: scrollYProgress }} />
          </div>
          {contents && headings.length > 0 && (
            <nav className="mizu-folio-rail" aria-label={`Contents: ${label}`}>
              <p className="mizu-folio-rail-head">
                Contents
                <output>
                  {!scrolled ? (
                    `${minutes} min`
                  ) : progress >= 0.99 ? (
                    <>
                      Read <i aria-hidden="true" />
                    </>
                  ) : (
                    `${remaining} min left`
                  )}
                </output>
              </p>
              <ol>
                <motion.span
                  className="mizu-folio-rail-fill"
                  style={{ scaleY: scrollYProgress }}
                  aria-hidden="true"
                />
                {headings.map((h) => (
                  <li key={h.id} data-level={h.level}>
                    {active === h.id && (
                      <motion.span
                        layoutId={`${id}-here`}
                        className="mizu-folio-rail-here"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 380, damping: 34 }
                        }
                        aria-hidden="true"
                      />
                    )}
                    <a
                      href={`#${h.id}`}
                      aria-current={active === h.id ? "location" : undefined}
                      onClick={(e) => jump(e, h.id)}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div ref={bodyRef} className="mizu-folio-body">
            {children}
          </div>
        </div>
      </article>
    </Placement.Provider>
  );
}

/**
 * A numbered note on the text around it. Inside a wide Folio it sits in the
 * margin level with its mark; otherwise the mark unfolds it in place.
 * Notes are phrasing content, like the paragraph they belong to.
 */
export function Sidenote({ children }: { children: ReactNode }) {
  const id = useId();
  const placement = useContext(Placement);
  const [open, setOpen] = useState(false);
  const noteRef = useRef<HTMLSpanElement>(null);
  const inline = placement === "inline";
  return (
    <span className="mizu-sidenote" data-open={(inline && open) || undefined}>
      <button
        type="button"
        className="mizu-sidenote-mark"
        aria-controls={id}
        aria-expanded={inline ? open : undefined}
        onClick={() => {
          if (inline) return setOpen((o) => !o);
          // Already visible in the margin: point to it.
          const note = noteRef.current;
          if (!note) return;
          note.removeAttribute("data-flash");
          void note.offsetWidth;
          note.setAttribute("data-flash", "");
        }}
      >
        <span className="mizu-sr-only">Note</span>
      </button>
      <span ref={noteRef} id={id} className="mizu-sidenote-note" role="note">
        <span>
          <span className="mizu-sidenote-body">{children}</span>
        </span>
      </span>
    </span>
  );
}
