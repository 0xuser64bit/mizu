"use client";
import { useReducedMotion } from "../motion/Preferences.tsx";

import { useEffect, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { Dialog } from "./Dialog.tsx";

export type NavLink = { href: string; label: string };

export function Nav({
  brand,
  links,
  currentPath,
  trackChapters = true,
  className = "",
}: {
  brand: ReactNode;
  links: NavLink[];
  currentPath?: string;
  trackChapters?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const path =
    currentPath ??
    (typeof window !== "undefined" ? window.location.pathname : "");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.4,
  });
  const progress = reduce ? scrollYProgress : scaleX;
  const nodeLeft = useTransform(
    progress,
    (v) => `calc(${(v * 100).toFixed(3)}% - 3px)`,
  );
  const [chapter, setChapter] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!trackChapters) return;
    const sections = Array.from(document.querySelectorAll("[data-chapter]"));
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting)
            setChapter(e.target.getAttribute("data-chapter") ?? "");
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [trackChapters]);

  return (
    <>
      <header
        className={className}
        style={{ position: "fixed", insetInline: 0, top: 0, zIndex: 80 }}
      >
        <div
          style={{
            background: "color-mix(in srgb, var(--mizu-ink) 85%, transparent)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              height: 64,
              alignItems: "center",
              justifyContent: "space-between",
              paddingInline: "var(--mizu-space-5)",
            }}
            className="mizu-nav-inner"
          >
            <span style={{ display: "inline-flex" }}>{brand}</span>

            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
              className="mizu-nav-chapter"
            >
              {chapter && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={chapter}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: reduce ? 0 : 0.3 }}
                    style={{
                      fontFamily: "var(--mizu-font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.34em",
                      textTransform: "uppercase",
                      color: "var(--mizu-faint)",
                    }}
                  >
                    {chapter}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>

            <nav aria-label="Primary" className="mizu-nav-links">
              {links.map((l) => {
                const active = path === l.href;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      columnGap: 10,
                      fontFamily: "var(--mizu-font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      color: active ? "var(--mizu-paper)" : "var(--mizu-muted)",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: "4px",
                        height: "4px",
                        transform: "rotate(45deg)",
                        background: active
                          ? "var(--mizu-accent)"
                          : "var(--mizu-line-bright)",
                        transitionProperty: "background",
                        transitionDuration: "300ms",
                        transitionTimingFunction: "ease",
                        transitionDelay: "0s",
                        transitionBehavior: "normal",
                      }}
                    />
                    {l.label}
                  </a>
                );
              })}
            </nav>

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="mizu-nav-burger"
              type="button"
              style={{
                background: "transparent",
                border: "none",
                fontFamily: "var(--mizu-font-mono)",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--mizu-muted)",
                cursor: "pointer",
              }}
            >
              Menu
            </button>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            height: 1,
            width: "100%",
            background: "var(--mizu-line)",
          }}
        >
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              originX: 0,
              background: "var(--mizu-accent)",
              scaleX: progress,
            }}
          />
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              top: -3,
              left: nodeLeft,
              width: 7,
              height: 7,
              rotate: 45,
              background: "var(--mizu-accent)",
            }}
          />
        </div>
      </header>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        label="Navigation menu"
        style={{
          width: "100%",
          maxWidth: "none",
          height: "100dvh",
          maxHeight: "none",
          margin: 0,
          padding: 0,
          border: 0,
        }}
      >
        <div
          className="mizu-nav-overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 85,
            display: "flex",
            flexDirection: "column",
            background: "var(--mizu-ink)",
            padding: "20px var(--mizu-space-5)",
          }}
        >
          <div
            style={{
              display: "flex",
              height: 64,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {brand}
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                fontFamily: "var(--mizu-font-mono)",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--mizu-muted)",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
          <nav
            aria-label="Menu"
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 20,
                  borderBottom: "1px solid var(--mizu-line)",
                  padding: "24px 0",
                  textDecoration: "none",
                  color: "var(--mizu-paper)",
                  fontFamily: "var(--mizu-font-display)",
                }}
                className="mizu-nav-overlay-link"
              >
                <span
                  style={{
                    fontFamily: "var(--mizu-font-mono)",
                    fontSize: 12,
                    color: "var(--mizu-accent)",
                  }}
                >
                  0{i + 1}
                </span>
                <span
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    fontStretch: "118%",
                    letterSpacing: "-0.01em",
                    transition: "transform 500ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  {l.label}
                </span>
              </a>
            ))}
          </nav>
          <p
            style={{
              fontFamily: "var(--mizu-font-mono)",
              fontSize: 10,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "var(--mizu-faint)",
            }}
          >
            Mizu — Interface Archive
          </p>
        </div>
      </Dialog>
    </>
  );
}
