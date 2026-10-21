"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Button,
  CopyButton,
  Outliner,
  RangeSelector,
  SplitPane,
  Waveform,
  type OutlineItem,
  type WaveformHandle,
} from "@/mizu";
import recording from "../../../public/audio/interface-field-notes.json";
import "./audio-workbench.css";

type ExcerptNote = {
  id: string;
  start: number;
  end: number;
  items: OutlineItem[];
};

const SOURCE = "/audio/interface-field-notes.mp3";
const CHAPTERS = recording.chapters;
const MARKERS = CHAPTERS.map(({ id, start, title }) => ({
  id,
  time: start,
  label: title,
}));
const INITIAL_RANGE: [number, number] = [CHAPTERS[2].start, CHAPTERS[2].end];
const INITIAL_NOTES: ExcerptNote[] = [
  {
    id: "first-listen",
    start: INITIAL_RANGE[0],
    end: INITIAL_RANGE[1],
    items: [
      {
        id: "keep-readout",
        text: "Keep the readout still.",
        children: [
          {
            id: "readout-detail",
            text: "A useful principle to carry into the next interaction study.",
          },
        ],
      },
    ],
  },
];

function clock(seconds: number) {
  const tenths = Math.round(seconds * 10);
  return `${Math.floor(tenths / 600)}:${String(Math.floor(tenths / 10) % 60).padStart(2, "0")}.${tenths % 10}`;
}

function outlineMarkdown(items: readonly OutlineItem[], depth = 0): string {
  return items
    .map(
      (item) =>
        `${"  ".repeat(depth)}- ${item.done ? "[x] " : ""}${item.text.replace(/\n/g, " ")}${item.children?.length ? `\n${outlineMarkdown(item.children, depth + 1)}` : ""}`,
    )
    .join("\n");
}

export function AudioWorkbench() {
  const id = useId();
  const player = useRef<WaveformHandle>(null);
  const noteEditor = useRef<HTMLDivElement>(null);
  const focusNote = useRef(false);
  const noteNumber = useRef(0);
  const playUntil = useRef<number | null>(null);
  const [time, setTime] = useState(0);
  const [range, setRange] = useState<[number, number]>(INITIAL_RANGE);
  const [split, setSplit] = useState(62);
  const [excerptPlaying, setExcerptPlaying] = useState(false);
  const [notes, setNotes] = useState<ExcerptNote[]>(INITIAL_NOTES);
  const [selected, setSelected] = useState<string | null>("first-listen");
  const [deleted, setDeleted] = useState<ExcerptNote | null>(null);
  const [message, setMessage] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const currentChapter =
    [...CHAPTERS].reverse().find((chapter) => chapter.start <= time) ??
    CHAPTERS[0];
  const activeNote = notes.find((note) => note.id === selected);
  const markdown = `# ${recording.title}\n\nSynthetic Mizu recording. Notes from the Audio Workbench.\n\n${notes
    .map(
      (note, index) =>
        `## Excerpt ${index + 1} · ${clock(note.start)}–${clock(note.end)}\n\n${outlineMarkdown(note.items) || "No notes yet."}`,
    )
    .join("\n\n")}\n`;

  useEffect(() => {
    if (!focusNote.current) return;
    noteEditor.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
    focusNote.current = false;
  }, [selected]);

  const stopExcerpt = () => {
    playUntil.current = null;
    setExcerptPlaying(false);
  };
  const chooseRange = (next: [number, number]) => {
    if (playUntil.current !== null) player.current?.pause();
    stopExcerpt();
    setRange(next);
  };
  const seek = (next: number) => {
    stopExcerpt();
    player.current?.seek(next);
  };
  const playExcerpt = async () => {
    if (excerptPlaying) {
      player.current?.pause();
      stopExcerpt();
      return;
    }
    setPlaybackError("");
    player.current?.seek(range[0]);
    playUntil.current = range[1];
    try {
      await player.current?.play();
      if (playUntil.current !== null) setExcerptPlaying(true);
    } catch {
      stopExcerpt();
      setPlaybackError(
        "Playback could not start. Try the recording’s Play button, then select your excerpt again.",
      );
    }
  };
  const addNote = () => {
    const nextId = `excerpt-${++noteNumber.current}`;
    const note = {
      id: nextId,
      start: range[0],
      end: range[1],
      items: [{ id: `${nextId}-line`, text: "" }],
    };
    focusNote.current = true;
    setNotes((previous) => [...previous, note]);
    setSelected(nextId);
    setMessage(
      `Excerpt note added, ${clock(range[0])} to ${clock(range[1])}. Write your note in the outline.`,
    );
  };
  const download = () => {
    try {
      const url = URL.createObjectURL(
        new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "mizu-audio-notes.md";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Notes downloaded as Markdown.");
    } catch {
      setMessage(
        "The download could not start. Use Copy notes to keep your work.",
      );
    }
  };

  const transcript = (
    <section
      className="mizu-audio-transcript"
      aria-labelledby={`${id}-transcript`}
    >
      <div className="mizu-audio-panel-head">
        <h2 id={`${id}-transcript`}>Transcript</h2>
        <span>Six passages · click to seek</span>
      </div>
      <ol className="mizu-audio-passages" aria-label="Recording transcript">
        {CHAPTERS.map((chapter) => (
          <li
            key={chapter.id}
            data-current={currentChapter.id === chapter.id || undefined}
          >
            <button
              type="button"
              className="mizu-audio-passage"
              aria-label={`Seek to ${chapter.title}`}
              aria-current={
                currentChapter.id === chapter.id ? "true" : undefined
              }
              onClick={() => seek(chapter.start)}
            >
              <time>{clock(chapter.start)}</time>
              <span>
                <strong>{chapter.title}</strong>
                <span>{chapter.text}</span>
              </span>
            </button>
            <button
              type="button"
              className="mizu-audio-select"
              aria-label={`Select excerpt: ${chapter.title}`}
              aria-pressed={
                range[0] === chapter.start && range[1] === chapter.end
              }
              onClick={() => {
                chooseRange([chapter.start, chapter.end]);
                player.current?.seek(chapter.start);
                setMessage(`Selected ${chapter.title}.`);
              }}
            >
              Select passage
            </button>
          </li>
        ))}
      </ol>
    </section>
  );

  const review = (
    <section className="mizu-audio-review" aria-labelledby={`${id}-notes`}>
      <div className="mizu-audio-panel-head">
        <h2 id={`${id}-notes`}>Review notes</h2>
        <span>
          {notes.length} {notes.length === 1 ? "excerpt" : "excerpts"}
        </span>
      </div>
      <div className="mizu-audio-note-index">
        {notes.length ? (
          <ul aria-label="Excerpt notes">
            {notes.map((note, index) => (
              <li key={note.id}>
                <button
                  type="button"
                  aria-pressed={note.id === selected}
                  onClick={() => {
                    setSelected(note.id);
                    chooseRange([note.start, note.end]);
                    player.current?.seek(note.start);
                  }}
                >
                  <span>Excerpt {String(index + 1).padStart(2, "0")}</span>
                  <span>
                    {clock(note.start)}–{clock(note.end)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mizu-audio-empty">
            Select a passage, then add an excerpt note. Your first observation
            starts here.
          </p>
        )}
      </div>
      {activeNote && (
        <div className="mizu-audio-note-editor" ref={noteEditor}>
          <div className="mizu-audio-note-heading">
            <p>
              {clock(activeNote.start)}–{clock(activeNote.end)}
            </p>
            <button
              type="button"
              className="mizu-text-button"
              onClick={() => {
                setDeleted(activeNote);
                const remaining = notes.filter(
                  (note) => note.id !== activeNote.id,
                );
                setNotes(remaining);
                setSelected(remaining[0]?.id ?? null);
                setMessage("Excerpt note deleted. Undo is available below.");
              }}
            >
              Delete excerpt note
            </button>
          </div>
          <Outliner
            key={activeNote.id}
            label="Excerpt outline"
            items={activeNote.items}
            placeholder="What should we keep or change?"
            onItemsChange={(items) =>
              setNotes((previous) =>
                previous.map((note) =>
                  note.id === activeNote.id ? { ...note, items } : note,
                ),
              )
            }
          />
          <p className="mizu-audio-help">
            Enter adds a line. Tab nests it. ⌘/Ctrl + Enter marks it done.
          </p>
        </div>
      )}
      {deleted && (
        <button
          type="button"
          className="mizu-text-button mizu-audio-undo"
          onClick={() => {
            setNotes((previous) => [...previous, deleted]);
            setSelected(deleted.id);
            setDeleted(null);
            setMessage("Excerpt note restored.");
          }}
        >
          Undo delete
        </button>
      )}
      <div className="mizu-audio-export">
        <Button
          variant="ghost"
          size="sm"
          arrow={false}
          disabled={!notes.length}
          onClick={download}
        >
          Download notes
        </Button>
        <CopyButton
          text={markdown}
          aria-label="Copy notes"
          disabled={!notes.length}
        >
          Copy notes
        </CopyButton>
      </div>
      <p className="mizu-audio-help">
        Notes stay in this tab. Export them before leaving.
      </p>
    </section>
  );

  return (
    <div className="mizu-audio">
      <section
        className="mizu-audio-player"
        aria-label="Recording and excerpt controls"
      >
        <div className="mizu-audio-recording">
          <div>
            <h2>{recording.title}</h2>
            <p>An original field note on interface craft.</p>
          </div>
          <span>{clock(recording.duration)} / MONO / SYNTHETIC VOICE</span>
        </div>
        <Waveform
          ref={player}
          src={SOURCE}
          label="Interface field notes"
          duration={recording.duration}
          peaks={recording.peaks}
          markers={MARKERS}
          height={100}
          onTimeUpdate={(next) => {
            setTime(next);
            if (playUntil.current !== null && next >= playUntil.current) {
              const end = playUntil.current;
              stopExcerpt();
              player.current?.pause();
              player.current?.seek(end);
            }
          }}
          onPlayingChange={(playing) => {
            if (!playing) stopExcerpt();
          }}
        />
        <div className="mizu-audio-excerpt">
          <div className="mizu-audio-range">
            <RangeSelector
              label="Selected excerpt"
              min={0}
              max={recording.duration}
              step={0.01}
              value={range}
              onValueChange={chooseRange}
              format={clock}
            />
            <div className="mizu-audio-selection-ruler" aria-hidden="true">
              <span
                style={{
                  left: `${(range[0] / recording.duration) * 100}%`,
                  width: `${((range[1] - range[0]) / recording.duration) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="mizu-audio-actions">
            <Button
              size="sm"
              variant="ghost"
              arrow={false}
              disabled={range[1] <= range[0]}
              onClick={() => void playExcerpt()}
            >
              {excerptPlaying ? "Pause excerpt" : "Play excerpt"}
            </Button>
            <Button
              size="sm"
              arrow={false}
              disabled={range[1] <= range[0]}
              onClick={addNote}
            >
              Add excerpt note
            </Button>
          </div>
        </div>
        {playbackError && (
          <p className="mizu-audio-error" role="alert">
            {playbackError}
          </p>
        )}
      </section>
      <SplitPane
        label="Resize transcript and review notes"
        value={split}
        onValueChange={setSplit}
        min={45}
        max={72}
        first={transcript}
        second={review}
      />
      <p className="mizu-audio-provenance">
        A synthetic recording made for Mizu, voiced by the macOS Daniel system
        voice. Passage timings and waveform amplitudes come from the bundled
        audio. No recording or notes leave your browser.
      </p>
      <p className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
