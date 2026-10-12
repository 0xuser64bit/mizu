"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { Frame, SplitFlap } from "@/mizu";
import { Arrow } from "./Arrow";

type Piece = { name: string; slug: string; line: string };

/**
 * One piece of the archive, working: a split-flap board that turns through
 * the signature systems, each one a link away. Turns only on screen, and
 * only by hand under reduced motion.
 */
export function ProofBoard({ pieces }: { pieces: Piece[] }) {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const cells = Math.max(...pieces.map((p) => p.name.length));
  const next = () => setN((v) => (v + 1) % pieces.length);

  useEffect(() => {
    if (reduce) return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => (seen = !!e?.isIntersecting));
    io.observe(root.current!);
    const id = window.setInterval(() => {
      if (seen && !document.hidden) setN((v) => (v + 1) % pieces.length);
    }, 2800);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [reduce, pieces.length]);

  const piece = pieces[n]!;
  return (
    <div ref={root} className="work-proof-board">
      <Frame label="Live, from the archive" tone="line-bright">
        <SplitFlap value={piece.name} length={cells} label="Signature system" />
        <p>{piece.line}</p>
      </Frame>
      <div className="work-proof-board-bar">
        <Link href={`/components/${piece.slug}`}>
          Open {piece.name} <Arrow />
        </Link>
        <button type="button" onClick={next}>
          Next system
        </button>
      </div>
    </div>
  );
}
