"use client";

import { useState } from "react";
import Link from "next/link";
import { Fader, Frame, Knob, SplitFlap } from "@/mizu";
import { Arrow } from "./Arrow";

const hz = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${Math.round(v)}`;
const db = (v: number) => `${v > 0 ? "+" : ""}${Math.round(v)}`;

/**
 * Three pieces of the archive working together, there to be handled: a knob
 * and a fader, and a split-flap board that settles on what they were set to.
 */
export function ProofBoard() {
  const [cutoff, setCutoff] = useState(1200);
  const [level, setLevel] = useState(-6);
  // The board flips when a control lets go, not on every step of a drag.
  const [board, setBoard] = useState({ cutoff, level });

  return (
    <div className="work-proof-board">
      <Frame label="Live, from the archive" tone="line-bright">
        <SplitFlap
          value={`${hz(board.cutoff)}HZ ${db(board.level)}DB`}
          length={13}
          label="Settings"
        />
        <div className="work-proof-rack">
          <Knob
            label="Cutoff"
            min={40}
            max={16000}
            taper="log"
            size={88}
            value={cutoff}
            resetValue={1200}
            onValueChange={setCutoff}
            onValueCommit={(v) => setBoard((b) => ({ ...b, cutoff: v }))}
            format={(v) => `${hz(v)} Hz`}
          />
          <Fader
            label="Level"
            min={-48}
            max={6}
            height={140}
            marks={[0, -24, -48]}
            value={level}
            resetValue={-6}
            onValueChange={setLevel}
            onValueCommit={(v) => setBoard((b) => ({ ...b, level: v }))}
            format={(v) => `${db(v)} dB`}
          />
          <p>
            Drag them, use the arrow keys, double-click to reset. This is the
            standard every commission is held to.
          </p>
        </div>
      </Frame>
      <div className="work-proof-board-bar">
        <Link href="/components/knob">
          Open Knob <Arrow />
        </Link>
        <Link href="/components/fader">
          Open Fader <Arrow />
        </Link>
        <Link href="/components/split-flap">
          Open SplitFlap <Arrow />
        </Link>
      </div>
    </div>
  );
}
