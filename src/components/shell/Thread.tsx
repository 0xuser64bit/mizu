"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import { NavigatorLink } from "./Navigator";
import { Wordmark } from "@/components/ui/Wordmark";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/lab", label: "Lab" },
  { href: "/studio", label: "Standpoint" },
];

export function Thread() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  const nodeLeft = useTransform(scaleX, (v) => `calc(${(v * 100).toFixed(3)}% - 3px)`);
  const [chapter, setChapter] = useState("Mizu");
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("[data-chapter]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setChapter(e.target.getAttribute("data-chapter") ?? "Mizu");
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[80]">
        <div className="bg-ink/85 backdrop-blur-md">
          <div className="relative flex h-16 items-center justify-between px-5 md:px-10">
            <NavigatorLink href="/" label="Mizu" className="flex items-baseline gap-3">
              <Wordmark />
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.32em] text-faint sm:inline">
                Interface archive
              </span>
            </NavigatorLink>

            <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={chapter}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[10px] uppercase tracking-[0.34em] text-faint"
                >
                  {chapter}
                </motion.span>
              </AnimatePresence>
            </div>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
              {LINKS.map((l) => {
                const active = pathname === l.href;
                return (
                  <NavigatorLink
                    key={l.href}
                    href={l.href}
                    label={l.label}
                    className="group flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em]"
                  >
                    <span
                      className={`h-1 w-1 rotate-45 transition-colors duration-300 ${
                        active ? "bg-accent" : "bg-line-bright group-hover:bg-muted"
                      }`}
                    />
                    <span className={active ? "text-paper" : "text-muted transition-colors group-hover:text-paper"}>
                      {l.label}
                    </span>
                  </NavigatorLink>
                );
              })}
            </nav>

            <button
              onClick={() => setOpen(true)}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-paper md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              Menu
            </button>
          </div>
        </div>

        <div className="relative h-px w-full bg-line">
          <motion.div className="absolute inset-0 origin-left bg-accent" style={{ scaleX }} />
          <motion.div
            aria-hidden
            className="absolute -top-[3px] h-[7px] w-[7px] rotate-45 bg-accent"
            style={{ left: nodeLeft }}
          />
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[85] flex flex-col bg-ink px-6 py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-16 items-center justify-between">
              <Wordmark />
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-paper"
              >
                Close
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center" aria-label="Menu">
              {LINKS.map((l, i) => (
                <NavigatorLink
                  key={l.href}
                  href={l.href}
                  label={l.label}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-5 border-b border-line py-6"
                >
                  <span className="font-mono text-xs text-accent">0{i + 1}</span>
                  <span className="font-display text-5xl font-black font-wide tracking-tight text-paper transition-transform duration-500 ease-out group-hover:translate-x-3">
                    {l.label}
                  </span>
                </NavigatorLink>
              ))}
            </nav>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-faint">
              Mizu — Interface Archive
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
