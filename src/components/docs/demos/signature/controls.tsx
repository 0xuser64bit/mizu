"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMotionValue } from "motion/react";
import {
  Button,
  Fader,
  ImageFigure,
  Knob,
  SegmentedControl,
  XYPad,
} from "@/mizu";
import { PLATES } from "./plates";
import { Scenarios } from "./shared";

type Scenario = "synth" | "grade";

const hz = (v: number) =>
  v >= 1000
    ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)} kHz`
    : `${Math.round(v)} Hz`;
const ms = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`;
const db = (v: number) =>
  v <= 0 ? "−∞ dB" : `${(20 * Math.log10(v)).toFixed(1)} dB`;
const signed =
  (unit: string, digits = 0) =>
  (v: number) =>
    `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(digits)} ${unit}`;
const percent = (v: number) => `${Math.round(v)}%`;

type Params = {
  cutoff: number;
  resonance: number;
  attack: number;
  release: number;
  detune: number;
  saw: number;
  sub: number;
  noise: number;
  vibrato: { x: number; y: number };
};
type Voice = {
  ctx: AudioContext;
  filter: BiquadFilterNode;
  amp: GainNode;
  gains: GainNode[];
  oscillators: OscillatorNode[];
  lfo: OscillatorNode;
  depth: GainNode;
  meters: AnalyserNode[];
  scope: AnalyserNode;
};
const NOTES = { A2: 110, C3: 130.81, E3: 164.81, A3: 220 } as const;
const PEAK = 0.28;

/** A small subtractive voice: saw and sub oscillators and noise, through a filter and envelope. */
function build(): Voice {
  const ctx = new AudioContext();
  const saw = ctx.createOscillator(),
    sub = ctx.createOscillator(),
    lfo = ctx.createOscillator();
  saw.type = "sawtooth";
  sub.type = "square";
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const samples = noiseBuffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const gains = [ctx.createGain(), ctx.createGain(), ctx.createGain()];
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  const amp = ctx.createGain();
  amp.gain.value = 0;
  const depth = ctx.createGain();
  const scope = ctx.createAnalyser();
  scope.fftSize = 1024;
  const meters = gains.map((g) => {
    const a = ctx.createAnalyser();
    a.fftSize = 256;
    g.connect(a);
    g.connect(filter);
    return a;
  });
  saw.connect(gains[0]!);
  sub.connect(gains[1]!);
  noise.connect(gains[2]!);
  lfo.connect(depth);
  depth.connect(saw.detune);
  depth.connect(sub.detune);
  filter.connect(amp).connect(scope).connect(ctx.destination);
  for (const node of [saw, sub, noise, lfo]) node.start();
  return {
    ctx,
    filter,
    amp,
    gains,
    oscillators: [saw, sub],
    lfo,
    depth,
    meters,
    scope,
  };
}

function Synth() {
  const [p, setP] = useState<Params>({
    cutoff: 1400,
    resonance: 30,
    attack: 12,
    release: 480,
    detune: 0,
    saw: 0.7,
    sub: 0.45,
    noise: 0.05,
    vibrato: { x: 5, y: 8 },
  });
  const [note, setNote] = useState<keyof typeof NOTES>("A2");
  const [playing, setPlaying] = useState(false);
  const [committed, setCommitted] = useState("Nothing yet");
  const voiceRef = useRef<Voice | null>(null);
  const scopeRef = useRef<SVGPolylineElement>(null);
  const levels = [useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const levelsRef = useRef(levels);
  const set =
    <K extends keyof Params>(key: K) =>
    (v: Params[K]) =>
      setP((q) => ({ ...q, [key]: v }));

  // Parameters follow the controls, smoothed so nothing clicks.
  useEffect(() => {
    const v = voiceRef.current;
    if (!v) return;
    const at = v.ctx.currentTime;
    v.filter.frequency.setTargetAtTime(p.cutoff, at, 0.015);
    v.filter.Q.setTargetAtTime(0.7 + (p.resonance / 100) * 14, at, 0.015);
    [p.saw, p.sub, p.noise].forEach((g, i) =>
      v.gains[i]!.gain.setTargetAtTime(g * g, at, 0.015),
    );
    v.oscillators.forEach((o, i) => {
      o.frequency.setTargetAtTime(NOTES[note] / (i + 1), at, 0.01);
      o.detune.setTargetAtTime(p.detune, at, 0.015);
    });
    v.lfo.frequency.setTargetAtTime(p.vibrato.x, at, 0.02);
    v.depth.gain.setTargetAtTime(p.vibrato.y, at, 0.02);
  }, [p, note, playing]);

  // Meters and the scope read the audio graph directly, every frame.
  useEffect(() => {
    let frame = 0;
    const data = new Float32Array(1024);
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const v = voiceRef.current;
      if (!v) return;
      const envelope = v.amp.gain.value / PEAK;
      v.meters.forEach((m, i) => {
        m.getFloatTimeDomainData(data.subarray(0, m.fftSize));
        let sum = 0;
        for (let k = 0; k < m.fftSize; k++) sum += data[k]! * data[k]!;
        levelsRef.current[i]!.set(
          Math.min(1, Math.sqrt(sum / m.fftSize) * 2.2 * envelope),
        );
      });
      v.scope.getFloatTimeDomainData(data);
      const points: string[] = [];
      for (let k = 0; k < 256; k++)
        points.push(`${k},${(36 - (data[k * 2]! / PEAK) * 30).toFixed(1)}`);
      scopeRef.current?.setAttribute("points", points.join(" "));
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      void voiceRef.current?.ctx.close();
      voiceRef.current = null;
    };
  }, []);

  const start = () => {
    if (playing) return;
    const v = (voiceRef.current ??= build());
    void v.ctx.resume();
    const at = v.ctx.currentTime;
    v.amp.gain.cancelScheduledValues(at);
    v.amp.gain.setValueAtTime(v.amp.gain.value, at);
    v.amp.gain.linearRampToValueAtTime(PEAK, at + p.attack / 1000);
    setPlaying(true);
  };
  const stop = () => {
    const v = voiceRef.current;
    if (!v || !playing) return;
    const at = v.ctx.currentTime;
    v.amp.gain.cancelScheduledValues(at);
    v.amp.gain.setValueAtTime(v.amp.gain.value, at);
    v.amp.gain.setTargetAtTime(0, at, p.release / 4000);
    setPlaying(false);
  };

  return (
    <div className="mizu-demo-synth">
      <div className="mizu-demo-rack">
        <Knob
          label="Cutoff"
          min={40}
          max={16000}
          taper="log"
          value={p.cutoff}
          onValueChange={set("cutoff")}
          onValueCommit={(v) => setCommitted(`Cutoff ${hz(v)}`)}
          format={hz}
          defaultValue={1400}
        />
        <Knob
          label="Resonance"
          value={p.resonance}
          onValueChange={set("resonance")}
          onValueCommit={(v) => setCommitted(`Resonance ${percent(v)}`)}
          format={percent}
          defaultValue={30}
        />
        <Knob
          label="Attack"
          min={1}
          max={2000}
          taper="log"
          value={p.attack}
          onValueChange={set("attack")}
          onValueCommit={(v) => setCommitted(`Attack ${ms(v)}`)}
          format={ms}
          defaultValue={12}
        />
        <Knob
          label="Release"
          min={10}
          max={4000}
          taper="log"
          value={p.release}
          onValueChange={set("release")}
          onValueCommit={(v) => setCommitted(`Release ${ms(v)}`)}
          format={ms}
          defaultValue={480}
        />
        <Knob
          label="Detune"
          min={-50}
          max={50}
          bipolar
          value={p.detune}
          onValueChange={set("detune")}
          onValueCommit={(v) => setCommitted(`Detune ${signed("ct")(v)}`)}
          format={signed("ct")}
          defaultValue={0}
        />
      </div>
      <div className="mizu-demo-rack">
        {(["saw", "sub", "noise"] as const).map((key, i) => (
          <Fader
            key={key}
            label={key === "saw" ? "Saw" : key === "sub" ? "Sub" : "Noise"}
            min={0}
            max={1}
            step={0.01}
            value={p[key]}
            onValueChange={set(key)}
            onValueCommit={(v) =>
              setCommitted(
                `${key === "saw" ? "Saw" : key === "sub" ? "Sub" : "Noise"} ${db(v)}`,
              )
            }
            format={db}
            marks={[1, 0.5, 0.25, 0]}
            level={levels[i]}
            defaultValue={key === "saw" ? 0.7 : key === "sub" ? 0.45 : 0.05}
          />
        ))}
        <XYPad
          label="Vibrato"
          size={176}
          x={{
            label: "Rate",
            min: 0.2,
            max: 12,
            step: 0.1,
            taper: "log",
            format: (v) => `${v.toFixed(1)} Hz`,
          }}
          y={{ label: "Depth", min: 0, max: 60, format: (v) => `${v} ct` }}
          value={p.vibrato}
          onValueChange={set("vibrato")}
          onValueCommit={(v) =>
            setCommitted(`Vibrato ${v.x.toFixed(1)} Hz, ${v.y} ct`)
          }
          defaultValue={{ x: 5, y: 8 }}
        />
        <div className="mizu-demo-play">
          <svg
            className="mizu-demo-scope"
            viewBox="0 0 255 72"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline ref={scopeRef} points="0,36 255,36" />
          </svg>
          <SegmentedControl
            label="Note"
            value={note}
            onValueChange={(v) => setNote(v as keyof typeof NOTES)}
            options={Object.keys(NOTES).map((n) => ({ value: n, label: n }))}
          />
          <Button
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                start();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") stop();
            }}
            onBlur={stop}
            aria-pressed={playing}
          >
            {playing ? "Playing" : `Hold to play ${note}`}
          </Button>
        </div>
      </div>
      <p className="mizu-showcase-readout">
        <span>onValueCommit</span>
        {committed}
      </p>
    </div>
  );
}

function Grade() {
  const [exposure, setExposure] = useState(0);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [balance, setBalance] = useState({ x: 0, y: 0 });
  const [vignette, setVignette] = useState(0.35);
  const [lift, setLift] = useState(0);
  const [compare, setCompare] = useState(false);
  const [exported, setExported] = useState<string | null>(null);
  const plate = PLATES[4]!;
  const warm = balance.x > 0,
    magenta = balance.y > 0;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setExported(
      JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    );
  };
  return (
    <form className="mizu-demo-grade" onSubmit={submit}>
      <div className="mizu-demo-grade-view">
        <ImageFigure
          src={plate.src}
          alt={`${plate.alt}, graded`}
          style={{
            filter: compare
              ? undefined
              : `brightness(${2 ** exposure}) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg)`,
          }}
        />
        {!compare && (
          <>
            <span
              style={{
                background: warm ? "#ff8a2a" : "#2a7dff",
                opacity: (Math.abs(balance.x) / 100) * 0.45,
                mixBlendMode: "soft-light",
              }}
            />
            <span
              style={{
                background: magenta ? "#ff2aa8" : "#20c46a",
                opacity: (Math.abs(balance.y) / 100) * 0.4,
                mixBlendMode: "soft-light",
              }}
            />
            <span
              style={{
                background: "#8a8a8a",
                opacity: lift,
                mixBlendMode: "screen",
              }}
            />
            <span
              style={{
                background: `radial-gradient(ellipse at center, transparent 42%, rgb(0 0 0 / ${vignette}) 100%)`,
              }}
            />
          </>
        )}
      </div>
      <div className="mizu-demo-rack">
        <Knob
          label="Exposure"
          name="exposure"
          min={-2}
          max={2}
          step={0.1}
          bipolar
          value={exposure}
          onValueChange={setExposure}
          format={signed("EV", 1)}
          defaultValue={0}
        />
        <Knob
          label="Contrast"
          name="contrast"
          min={50}
          max={150}
          value={contrast}
          onValueChange={setContrast}
          format={percent}
          defaultValue={100}
        />
        <Knob
          label="Saturation"
          name="saturation"
          min={0}
          max={200}
          value={saturation}
          onValueChange={setSaturation}
          format={percent}
          defaultValue={100}
        />
        <Knob
          label="Hue"
          name="hue"
          min={-180}
          max={180}
          bipolar
          value={hue}
          onValueChange={setHue}
          format={signed("°")}
          defaultValue={0}
        />
        <XYPad
          label="Balance"
          name="balance"
          size={150}
          x={{ label: "Temp", min: -100, max: 100 }}
          y={{ label: "Tint", min: -100, max: 100 }}
          value={balance}
          onValueChange={setBalance}
          defaultValue={{ x: 0, y: 0 }}
        />
        <Fader
          label="Vignette"
          name="vignette"
          height={150}
          min={0}
          max={0.8}
          step={0.01}
          value={vignette}
          onValueChange={setVignette}
          format={(v) => percent(v * 125)}
          defaultValue={0.35}
        />
        <Fader
          label="Lift"
          name="lift"
          height={150}
          min={0}
          max={0.4}
          step={0.01}
          value={lift}
          onValueChange={setLift}
          format={(v) => percent(v * 250)}
          defaultValue={0}
        />
      </div>
      <div className="mizu-showcase-actions">
        <Button type="submit">Export settings</Button>
        <Button
          type="button"
          variant="ghost"
          onPointerDown={() => setCompare(true)}
          onPointerUp={() => setCompare(false)}
          onPointerLeave={() => setCompare(false)}
          aria-pressed={compare}
        >
          Hold to compare
        </Button>
      </div>
      {exported && (
        <p className="mizu-showcase-readout">
          <span>FormData from name</span>
          {exported}
        </p>
      )}
    </form>
  );
}

function ControlsShowcase({ start }: { start: Scenario }) {
  const [scenario, setScenario] = useState<Scenario>(start);
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Panel"
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "synth", label: "Synth voice" },
          { value: "grade", label: "Colour grade" },
        ]}
        note="Drag knobs and faders up or down (Shift for fine), press anywhere on the pad, or use the arrow keys; double-click or Backspace returns a control home. The synth really plays while you hold the button — the meters and scope read its audio."
      />
      {scenario === "synth" ? <Synth /> : <Grade />}
    </div>
  );
}

export const KnobShowcase = () => <ControlsShowcase start="synth" />;
export const FaderShowcase = () => <ControlsShowcase start="synth" />;
export const XYPadShowcase = () => <ControlsShowcase start="grade" />;
