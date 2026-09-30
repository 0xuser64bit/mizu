"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "../motion/Preferences";
import { EASE_EXPO } from "../motion/easings";
import { clamp, useAnnouncer, useElementSize, useLatest } from "./internal";
import { formatClock } from "./time";

export type WaveformMarker = { id: string; time: number; label: string };
export type WaveformHandle = {
  play: () => Promise<void>;
  pause: () => void;
  seek: (seconds: number) => void;
};

const BAR = 4;
const PLAY = "M5 4L10.5 7L10.5 13L5 16Z M10.5 7L16 10L16 10L10.5 13Z";
const PAUSE = "M5 4L8.5 4L8.5 16L5 16Z M11.5 4L15 4L15 16L11.5 16Z";

/** Peak amplitude per bucket from any audio the browser can decode. */
async function decodePeaks(src: string, buckets: number, signal: AbortSignal) {
  const response = await fetch(src, { signal });
  if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
  const data = await response.arrayBuffer();
  const audio = await new OfflineAudioContext(1, 1, 8000).decodeAudioData(data);
  const channels = Array.from({ length: audio.numberOfChannels }, (_, c) =>
    audio.getChannelData(c),
  );
  const size = Math.max(1, Math.floor(audio.length / buckets));
  const peaks = new Array<number>(buckets).fill(0);
  let loudest = 0;
  for (let b = 0; b < buckets; b++) {
    let peak = 0;
    for (
      let i = b * size, end = Math.min(audio.length, i + size);
      i < end;
      i += 2
    )
      for (const channel of channels)
        peak = Math.max(peak, Math.abs(channel[i]!));
    peaks[b] = peak;
    loudest = Math.max(loudest, peak);
  }
  // A gentle gamma keeps quiet passages visible beside loud ones.
  return peaks.map((p) => (loudest ? Math.pow(p / loudest, 0.75) : 0));
}

/**
 * Audio you can see: a waveform scrubber over a native audio element, with
 * chapters, speed and skip controls. Peaks may be supplied; otherwise they are
 * decoded from the source.
 */
export const Waveform = forwardRef<
  WaveformHandle,
  {
    src: string;
    label: string;
    /** Normalised 0–1 amplitudes. Decoded from `src` when omitted (same-origin or CORS-enabled audio). */
    peaks?: readonly number[];
    markers?: readonly WaveformMarker[];
    /** Seconds, shown before the media reports its own duration. */
    duration?: number;
    rates?: readonly number[];
    /** Waveform height in pixels. */
    height?: number;
    onTimeUpdate?: (seconds: number) => void;
    onPlayingChange?: (playing: boolean) => void;
    className?: string;
    style?: CSSProperties;
  }
>(function Waveform(
  {
    src,
    label,
    peaks,
    markers = [],
    duration: knownDuration,
    rates = [1, 1.25, 1.5, 2],
    height = 72,
    onTimeUpdate,
    onPlayingChange,
    className = "",
    style,
  },
  ref,
) {
  const id = useId();
  const reduce = useReducedMotion();
  const audio = useRef<HTMLAudioElement>(null);
  const [trackRef, { width }] = useElementSize<HTMLDivElement>();
  const [message, announce] = useAnnouncer();
  const [duration, setDuration] = useState(knownDuration ?? 0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(rates[0] ?? 1);
  const [failed, setFailed] = useState(false);
  const [decoded, setDecoded] = useState<{
    src: string;
    peaks: number[] | null;
  } | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const timeUpdateRef = useLatest(onTimeUpdate);
  const playingChangeRef = useLatest(onPlayingChange);

  useEffect(() => {
    if (peaks) return;
    const controller = new AbortController();
    decodePeaks(src, 1024, controller.signal).then(
      (result) => setDecoded({ src, peaks: result }),
      () => {
        if (!controller.signal.aborted) setDecoded({ src, peaks: null });
      },
    );
    return () => controller.abort();
  }, [src, peaks]);

  // Smooth progress while playing; the media element only reports a few times a second.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      if (audio.current) setTime(audio.current.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const seek = (seconds: number) => {
    const media = audio.current;
    const limit = duration || media?.duration || 0;
    const next = clamp(
      seconds,
      0,
      Number.isFinite(limit) && limit > 0 ? limit : 0,
    );
    if (media) media.currentTime = next;
    setTime(next);
    timeUpdateRef.current?.(next);
  };
  const toggle = () => {
    const media = audio.current;
    if (!media) return;
    if (media.paused) void media.play().catch(() => setPlaying(false));
    else media.pause();
  };
  useImperativeHandle(ref, () => ({
    play: () => audio.current?.play() ?? Promise.resolve(),
    pause: () => audio.current?.pause(),
    seek,
  }));

  const source = peaks ?? (decoded?.src === src ? decoded.peaks : undefined);
  const count = Math.max(0, Math.floor(width / BAR));
  const bars = useMemo(() => {
    if (!source?.length || !count) return null;
    return Array.from({ length: count }, (_, i) => {
      const a = Math.floor((i * source.length) / count),
        b = Math.max(a + 1, Math.floor(((i + 1) * source.length) / count));
      let peak = 0;
      for (let j = a; j < b; j++) peak = Math.max(peak, source[j] ?? 0);
      return clamp(peak, 0, 1);
    });
  }, [source, count]);
  const path = useMemo(
    () =>
      bars
        ?.map((p, i) => {
          const h = Math.max(2, p * (height - 8));
          return `M${i * BAR} ${((height - h) / 2).toFixed(1)}h2v${h.toFixed(1)}h-2Z`;
        })
        .join("") ?? "",
    [bars, height],
  );

  const shownTime = scrub ?? time;
  const progress = duration ? clamp(shownTime / duration, 0, 1) : 0;
  const chapters = [...markers].sort((a, b) => a.time - b.time);
  const current = chapters.filter((m) => m.time <= shownTime + 0.25).pop();
  const decoding = !peaks && source === undefined;

  const at = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return r.width ? clamp((e.clientX - r.left) / r.width, 0, 1) * duration : 0;
  };
  const jump = (seconds: number, note?: string) => {
    seek(seconds);
    if (note) announce(note);
  };
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") && (e.key === " " || e.key === "Enter"))
      return;
    const index = current ? chapters.indexOf(current) : -1;
    const keys: Record<string, () => void> = {
      k: toggle,
      K: toggle,
      j: () => jump(time - 10, `Back to ${formatClock(time - 10)}`),
      l: () => jump(time + 10, `Forward to ${formatClock(time + 10)}`),
      "[": () => {
        const to =
          chapters[time - (current?.time ?? 0) > 3 ? index : index - 1] ??
          chapters[0];
        if (to) jump(to.time, `Chapter: ${to.label}`);
      },
      "]": () => {
        const to = chapters[index + 1];
        if (to) jump(to.time, `Chapter: ${to.label}`);
      },
    };
    if (target.getAttribute("role") === "slider") {
      Object.assign(keys, {
        " ": toggle,
        ArrowLeft: () => seek(time - (e.shiftKey ? 30 : 5)),
        ArrowRight: () => seek(time + (e.shiftKey ? 30 : 5)),
        Home: () => seek(0),
        End: () => seek(duration),
      });
    }
    const action = keys[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  return (
    <figure
      className={`mizu-waveform ${className}`}
      style={style}
      aria-label={label}
      data-playing={playing || undefined}
      onKeyDown={onKey}
    >
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          setFailed(false);
          if (Number.isFinite(e.currentTarget.duration))
            setDuration(e.currentTarget.duration);
          e.currentTarget.playbackRate = rate;
        }}
        onTimeUpdate={(e) => {
          if (!playing) setTime(e.currentTarget.currentTime);
          timeUpdateRef.current?.(e.currentTarget.currentTime);
        }}
        onPlay={() => {
          setPlaying(true);
          playingChangeRef.current?.(true);
        }}
        onPause={() => {
          setPlaying(false);
          playingChangeRef.current?.(false);
          if (audio.current) setTime(audio.current.currentTime);
        }}
        onError={() => setFailed(true)}
      />
      <div className="mizu-waveform-head">
        <button
          type="button"
          className="mizu-waveform-play"
          aria-label={playing ? "Pause" : "Play"}
          disabled={failed}
          onClick={toggle}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <motion.path
              initial={false}
              animate={{ d: playing ? PAUSE : PLAY }}
              transition={{ duration: reduce ? 0 : 0.28, ease: EASE_EXPO }}
            />
          </svg>
        </button>
        <figcaption>
          <span className="mizu-waveform-title">{label}</span>
          <span className="mizu-waveform-chapter" aria-live="off">
            {current?.label ?? " "}
          </span>
        </figcaption>
        <p className="mizu-waveform-clock">
          <span>{formatClock(shownTime)}</span>
          <span aria-hidden="true"> / </span>
          <span>{duration ? formatClock(duration) : "—:—"}</span>
        </p>
      </div>

      <div className="mizu-waveform-stage">
        {chapters.length > 0 && duration > 0 && (
          <div className="mizu-waveform-markers" aria-hidden="true">
            {chapters.map((m) => (
              <span
                key={m.id}
                data-current={m === current || undefined}
                style={{ left: `${(m.time / duration) * 100}%` }}
                title={`${formatClock(m.time)} ${m.label}`}
                onClick={() => jump(m.time)}
              />
            ))}
          </div>
        )}
        <div
          ref={trackRef}
          className="mizu-waveform-track"
          style={{ height }}
          role="slider"
          tabIndex={failed ? -1 : 0}
          aria-label={`Seek ${label}`}
          aria-describedby={`${id}-keys`}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(shownTime)}
          aria-valuetext={`${formatClock(shownTime)} of ${formatClock(duration)}`}
          aria-disabled={failed || undefined}
          data-state={
            failed ? "failed" : decoding ? "decoding" : bars ? "ready" : "flat"
          }
          onPointerDown={(e) => {
            if (e.button !== 0 || !duration || failed) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setScrub(at(e));
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) setScrub(at(e));
            else if (e.pointerType === "mouse" && duration) setHover(at(e));
          }}
          onPointerUp={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            e.currentTarget.releasePointerCapture(e.pointerId);
            if (scrub !== null) seek(scrub);
            setScrub(null);
          }}
          onPointerCancel={() => setScrub(null)}
          onPointerLeave={() => setHover(null)}
        >
          {bars ? (
            <svg
              viewBox={`0 0 ${count * BAR} ${height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              key={src}
            >
              <path className="mizu-waveform-bars" d={path} />
              <path
                className="mizu-waveform-played"
                d={path}
                style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }}
              />
              {hover !== null && scrub === null && duration > 0 && (
                <path
                  className="mizu-waveform-hovered"
                  d={path}
                  style={{
                    clipPath: `inset(0 ${(1 - hover / duration) * 100}% 0 ${progress * 100}%)`,
                  }}
                />
              )}
            </svg>
          ) : decoding ? (
            <div className="mizu-waveform-measuring" aria-hidden="true">
              {Array.from(
                { length: Math.min(96, Math.max(24, count / 3)) },
                (_, i) => (
                  <span key={i} style={{ "--mizu-i": i } as CSSProperties} />
                ),
              )}
            </div>
          ) : (
            <span className="mizu-waveform-flat" aria-hidden="true" />
          )}
          {duration > 0 && !failed && (
            <span
              className="mizu-waveform-head-line"
              aria-hidden="true"
              style={{ left: `${progress * 100}%` }}
            />
          )}
          {hover !== null && scrub === null && duration > 0 && (
            <span
              className="mizu-waveform-ghost"
              aria-hidden="true"
              style={{ left: `${(hover / duration) * 100}%` }}
            >
              <output>{formatClock(hover)}</output>
            </span>
          )}
        </div>
        {/* Beside the slider, not in it: a button inside role="slider" is lost to
            assistive tech. It covers the track from the stage. */}
        {failed && (
          <p className="mizu-waveform-error" role="alert">
            This audio could not be loaded.
            <button
              type="button"
              className="mizu-text-button"
              onClick={() => {
                setFailed(false);
                audio.current?.load();
              }}
            >
              Try again
            </button>
          </p>
        )}
      </div>

      <div className="mizu-waveform-tools">
        <button
          type="button"
          onClick={() => jump(time - 10)}
          aria-label="Back 10 seconds"
          disabled={failed}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M8 4 4 7l4 3" />
            <path d="M4.5 7H11a5 5 0 1 1-5 5" />
          </svg>
          10
        </button>
        <button
          type="button"
          onClick={() => jump(time + 30)}
          aria-label="Forward 30 seconds"
          disabled={failed}
        >
          30
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m12 4 4 3-4 3" />
            <path d="M15.5 7H9a5 5 0 1 0 5 5" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={`Playback speed ${rate}×. Change speed`}
          onClick={() => {
            const next = rates[(rates.indexOf(rate) + 1) % rates.length] ?? 1;
            setRate(next);
            if (audio.current) audio.current.playbackRate = next;
          }}
        >
          {rate}×
        </button>
      </div>

      {chapters.length > 0 && (
        <ol className="mizu-waveform-chapters" aria-label={`${label} chapters`}>
          {chapters.map((m, i) => {
            const end = chapters[i + 1]?.time ?? duration;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  aria-current={m === current ? "true" : undefined}
                  onClick={() => jump(m.time, `Chapter: ${m.label}`)}
                >
                  <time>{formatClock(m.time)}</time>
                  <span>{m.label}</span>
                  {end > m.time && <small>{formatClock(end - m.time)}</small>}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <p id={`${id}-keys`} className="mizu-sr-only">
        Arrow keys seek five seconds, Shift thirty. Space plays or pauses. J and
        L skip ten seconds; brackets move between chapters.
      </p>
      <span className="mizu-sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </figure>
  );
});
