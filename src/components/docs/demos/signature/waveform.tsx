"use client";

import { useEffect, useRef, useState } from "react";
import { Waveform, type WaveformHandle, type WaveformMarker } from "@/mizu";
import { Scenarios, seeded } from "./shared";

const RATE = 22050;
const SECONDS = 48;
const CHAPTERS: WaveformMarker[] = [
  { id: "intro", time: 0, label: "Intro — a single voice" },
  { id: "theme", time: 8, label: "Theme with bass" },
  { id: "bridge", time: 22, label: "Bridge — the room goes quiet" },
  { id: "return", time: 30, label: "Return, fuller" },
  { id: "coda", time: 42, label: "Coda" },
];

/** A short pentatonic piece rendered offline, so the showcase plays real audio without shipping a file. */
async function compose() {
  const ctx = new OfflineAudioContext(1, RATE * SECONDS, RATE);
  const master = ctx.createGain();
  master.connect(ctx.destination);
  const random = seeded(12);
  const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
  const pluck = (freq: number, t: number, dur: number, level: number) => {
    const body = ctx.createOscillator(),
      air = ctx.createOscillator(),
      env = ctx.createGain(),
      shimmer = ctx.createGain();
    body.type = "triangle";
    body.frequency.value = freq;
    air.frequency.value = freq * 2;
    shimmer.gain.value = 0.25;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(level, t + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    body.connect(env);
    air.connect(shimmer).connect(env);
    env.connect(master);
    for (const o of [body, air]) {
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  };
  const pad = (freqs: number[], t: number, dur: number, level: number) => {
    const env = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.frequency.value = 900;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(level, t + dur * 0.4);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    filter.connect(env).connect(master);
    for (const f of freqs) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.connect(filter);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  };
  const beat = 0.25;
  for (let t = 0; t < SECONDS - 1; t += beat) {
    const section =
      t < 8
        ? "intro"
        : t < 22
          ? "theme"
          : t < 30
            ? "bridge"
            : t < 42
              ? "return"
              : "coda";
    const step = Math.round(t / beat);
    if (section === "bridge") {
      if (step % 16 === 0) pad([110, 164.81, 220], t, 4.2, 0.05);
      if (step % 8 === 4 && random() > 0.4)
        pluck(scale[4 + Math.floor(random() * 4)]!, t, 1.6, 0.05);
      continue;
    }
    const busy =
      section === "return"
        ? 0.72
        : section === "theme"
          ? 0.55
          : section === "coda"
            ? 0.3
            : 0.22;
    const fade =
      section === "coda"
        ? Math.max(0.15, 1 - (t - 42) / 6)
        : section === "intro"
          ? 0.4 + t / 16
          : 1;
    if (random() < busy)
      pluck(
        scale[Math.floor(random() * scale.length)]!,
        t,
        0.9 + random(),
        0.14 * fade,
      );
    if (section !== "intro" && step % 8 === 0)
      pluck(scale[step % 16 === 0 ? 0 : 3]! / 2, t, 1.8, 0.22 * fade);
    if (section === "return" && step % 16 === 8)
      pad([220, 261.63, 329.63], t, 3, 0.035);
  }
  const rendered = await ctx.startRendering();
  const samples = rendered.getChannelData(0);
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const text = (offset: number, value: string) =>
    [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, RATE, true);
  view.setUint32(28, RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  const gain = peak ? 0.9 / peak : 1;
  samples.forEach((s, i) =>
    view.setInt16(
      44 + i * 2,
      Math.max(-1, Math.min(1, s * gain)) * 0x7fff,
      true,
    ),
  );
  return URL.createObjectURL(new Blob([view], { type: "audio/wav" }));
}

type Scenario = "composition" | "tone" | "broken";

export function WaveformShowcase() {
  const [scenario, setScenario] = useState<Scenario>("composition");
  const [url, setUrl] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const player = useRef<WaveformHandle>(null);
  useEffect(() => {
    let revoked = false,
      made: string | null = null;
    compose().then((u) => {
      made = u;
      if (revoked) URL.revokeObjectURL(u);
      else setUrl(u);
    });
    return () => {
      revoked = true;
      if (made) URL.revokeObjectURL(made);
    };
  }, []);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Scenario"
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "composition", label: "Composition with chapters" },
          { value: "tone", label: "Four-second tone" },
          { value: "broken", label: "Unavailable source" },
        ]}
        note="The composition is generated in your browser and decoded into its waveform. Press K to play, J and L to skip, [ and ] for chapters."
      />
      {scenario === "composition" ? (
        url ? (
          <>
            <Waveform
              ref={player}
              key="composition"
              src={url}
              label="Mizu — study in pentatonic"
              markers={CHAPTERS}
              onTimeUpdate={setTime}
            />
            <div className="mizu-showcase-readout">
              <span>Driven from outside through the handle</span>
              <button
                type="button"
                className="mizu-text-button"
                onClick={() => player.current?.seek(22)}
              >
                Seek to the bridge
              </button>
              <output>onTimeUpdate → {time.toFixed(1)}s</output>
            </div>
          </>
        ) : (
          <p className="mizu-showcase-readout" role="status">
            <span>Composing</span>Rendering 48 seconds of audio offline…
          </p>
        )
      ) : scenario === "tone" ? (
        <Waveform
          key="tone"
          src="/audio/calibration.wav"
          label="Calibration tone, 440 Hz"
        />
      ) : (
        <Waveform
          key="broken"
          src="/audio/missing-episode.mp3"
          label="Episode 13 — not yet published"
          duration={2710}
        />
      )}
    </div>
  );
}
