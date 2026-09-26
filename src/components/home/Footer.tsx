"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { NavigatorLink } from "@/components/shell/Navigator";
import { GhostWord } from "@/mizu";

export function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer data-chapter="Colophon" className="relative overflow-hidden border-t border-line px-5 pb-10 pt-20 md:px-10 md:pt-28">
      <h2 className="sr-only">Mizu — Interface Archive</h2>
      <div
        className="select-none text-center font-display text-[clamp(4rem,17.5vw,15rem)] font-black font-wide leading-none tracking-[-0.02em]"
      >
        <GhostWord text="MIZU." />
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Wordmark />
          <p className="mt-5 max-w-xs leading-relaxed text-muted">
            An archive of interface craft — surfaces, motion and systems, made slowly.
          </p>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            © 2026 Mizu Studio
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faint">Index</p>
          <ul className="mt-5 space-y-3">
            {[
              { href: "/", label: "Home" },
              { href: "/lab", label: "Lab" },
              { href: "/studio", label: "Standpoint" },
            ].map((l) => (
              <li key={l.href}>
                <NavigatorLink
                  href={l.href}
                  label={l.label}
                  className="text-sm text-muted transition-colors hover:text-paper"
                >
                  {l.label}
                </NavigatorLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faint">Colophon</p>
          <ul className="mt-5 space-y-3 font-mono text-[11px] leading-relaxed tracking-[0.06em] text-muted">
            <li>Set in Archivo, Instrument Serif</li>
            <li>& JetBrains Mono</li>
            <li>Built with Next.js & motion</li>
            <li className="text-paper">
              Local time — <span className="tabular-nums text-accent">{time || "––:––:––"}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 flex items-center justify-between border-t border-line pt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
          Independent — no tracking, no cookies
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-paper"
        >
          Back to top
          <span className="inline-block transition-transform duration-300 group-hover:-translate-y-1">↑</span>
        </button>
      </div>
    </footer>
  );
}
