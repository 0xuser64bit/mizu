"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, SplitFlap, TextField, type SignatureTone } from "@/mizu";
import { Scenarios } from "./shared";

type Scenario = "departures" | "message" | "clock";
type Status = "ON TIME" | "BOARDING" | "DELAYED" | "DEPARTED";
type Departure = { time: string; to: string; platform: string; status: Status };

const TONES: Record<Status, SignatureTone | undefined> = {
  "ON TIME": undefined,
  BOARDING: "accent",
  DELAYED: "warning",
  DEPARTED: "muted",
};
// An invented timetable that loops.
const TIMETABLE: Omit<Departure, "status">[] = [
  { time: "08:42", to: "KANAZAWA", platform: "4" },
  { time: "08:50", to: "NAGANO", platform: "11" },
  { time: "09:03", to: "SENDAI", platform: "7" },
  { time: "09:15", to: "NIIGATA", platform: "2" },
  { time: "09:21", to: "HAKODATE", platform: "9" },
  { time: "09:34", to: "KYOTO", platform: "14" },
  { time: "09:40", to: "MATSUMOTO", platform: "5" },
  { time: "09:52", to: "TOYAMA", platform: "3" },
];
const ROWS = 5;
const initialBoard = (start: number): Departure[] =>
  Array.from({ length: ROWS }, (_, i) => ({
    ...TIMETABLE[(start + i) % TIMETABLE.length]!,
    status: i === 2 ? "DELAYED" : "ON TIME",
  }));

/** One tick of the board: the first train boards, departs, then makes way. */
type BoardState = { board: Departure[]; next: number; news: string };
function advance(state: BoardState): BoardState {
  const [first, ...rest] = state.board;
  if (!first) return state;
  if (first.status === "DEPARTED") {
    const arriving = TIMETABLE[state.next % TIMETABLE.length]!;
    return {
      board: [
        ...rest.map((r) =>
          r.status === "DELAYED" ? { ...r, status: "ON TIME" as const } : r,
        ),
        {
          ...arriving,
          status:
            state.next % 3 === 0 ? ("DELAYED" as const) : ("ON TIME" as const),
        },
      ],
      next: state.next + 1,
      news: `${arriving.time} to ${arriving.to} added.`,
    };
  }
  const status: Status = first.status === "BOARDING" ? "DEPARTED" : "BOARDING";
  return {
    ...state,
    board: [{ ...first, status }, ...rest],
    news: `${first.time} to ${first.to}: ${status.toLowerCase()}.`,
  };
}

function Departures() {
  const [{ board, news }, setState] = useState(() => ({
    board: initialBoard(0),
    next: ROWS,
    news: "",
  }));
  useEffect(() => {
    const tick = setInterval(() => setState(advance), 3200);
    return () => clearInterval(tick);
  }, []);
  return (
    <>
      <table className="mizu-demo-board">
        <caption className="mizu-sr-only">Departures</caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Destination</th>
            <th scope="col">Plat.</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {board.map((row, i) => (
            // Rows are board positions: a departure moving up re-flips the row it lands on.
            <tr key={i}>
              <td>
                <SplitFlap value={row.time} length={5} />
              </td>
              <td>
                <SplitFlap value={row.to} length={10} />
              </td>
              <td>
                <SplitFlap value={row.platform} length={2} align="right" />
              </td>
              <td>
                <SplitFlap
                  value={row.status}
                  length={8}
                  tone={TONES[row.status]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mizu-sr-only" role="status">
        {news}
      </p>
    </>
  );
}

function Message() {
  const [draft, setDraft] = useState("");
  const [shown, setShown] = useState("MIND THE GAP");
  const [settled, setSettled] = useState(true);
  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSettled(false);
    setShown(draft.trim());
  };
  return (
    <div className="mizu-demo-flap-message">
      <SplitFlap
        value={shown}
        length={16}
        label="Board"
        live
        onSettle={() => setSettled(true)}
        style={{ ["--mizu-flap-size" as string]: "clamp(20px, 4.4vw, 40px)" }}
      />
      <form onSubmit={send}>
        <TextField
          label="Message"
          value={draft}
          maxLength={16}
          placeholder="Up to 16 characters"
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" disabled={!draft.trim()}>
          Send to board
        </Button>
      </form>
      <p className="mizu-showcase-readout">
        <span>onSettle</span>
        {settled ? `Settled on “${shown.toUpperCase()}”` : "Flipping…"}
      </p>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const every = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, []);
  const time = now
    ? now.toLocaleTimeString("en-GB", { hour12: false })
    : "--:--:--";
  const day = now
    ? now
        .toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
        .replace(/,/g, "")
    : "";
  return (
    <div className="mizu-demo-flap-clock">
      <SplitFlap
        value={time}
        label="Time"
        stagger={20}
        style={{ ["--mizu-flap-size" as string]: "clamp(32px, 8vw, 76px)" }}
      />
      <SplitFlap value={day} length={10} tone="accent" label="Date" />
    </div>
  );
}

export function SplitFlapShowcase() {
  const [scenario, setScenario] = useState<Scenario>("departures");
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Board"
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "departures", label: "Departures" },
          { value: "message", label: "Message" },
          { value: "clock", label: "Clock" },
        ]}
        note="Every character falls forward through the drum, cell after cell, and lands with a slap. Screen readers get the settled text. The timetable is invented."
      />
      {scenario === "departures" ? (
        <Departures />
      ) : scenario === "message" ? (
        <Message />
      ) : (
        <Clock />
      )}
    </div>
  );
}
