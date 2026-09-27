"use client";

import { useId, type CSSProperties } from "react";
export type ChartPoint = { label: string; value: number };
export function BarChart({ data, label, format = (v) => String(v), className = "" }: { data: readonly ChartPoint[]; label: string; format?: (value: number) => string; className?: string }) {
  data = data.filter(d => Number.isFinite(d.value));
  const max = Math.max(1, ...data.map(d => Math.abs(d.value)));
  return <figure className={`mizu-bar-chart ${className}`}><figcaption>{label}</figcaption><ul>{data.map((d, i) => <li key={i}><span>{d.label}</span><div className="mizu-bar-track"><span style={{ width: `${Math.abs(d.value) / max * 100}%` }} data-negative={d.value < 0} /></div><span>{format(d.value)}</span></li>)}</ul>{!data.length && <p className="mizu-field-hint">No measurements yet.</p>}</figure>;
}
export function Sparkline({ values, label, className = "", style }: { values: readonly number[]; label: string; className?: string; style?: CSSProperties }) {
  const id = useId(), finite = values.filter(Number.isFinite);
  const min = Math.min(0, ...finite), max = Math.max(1, ...finite), span = max - min;
  const points = finite.map((v, i) => `${finite.length === 1 ? 120 : i / Math.max(1, finite.length - 1) * 240},${56 - (v - min) / span * 48}`).join(" ");
  return <svg className={`mizu-sparkline ${className}`} style={style} viewBox="0 0 240 64" role="img" aria-labelledby={id}><title id={id}>{label}{finite.length ? `: ${finite.join(", ")}` : ": no data"}</title><path d="M0 56H240" stroke="var(--mizu-line)" fill="none" /><polyline points={points} stroke="var(--mizu-accent)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" /></svg>;
}
export function Heatmap({ data, label = "Activity", className = "" }: { data: readonly { date: string; value: number }[]; label?: string; className?: string }) {
  data = data.filter(d => Number.isFinite(d.value));
  const max = Math.max(1, ...data.map(d => d.value));
  return <figure className={`mizu-heatmap ${className}`}><figcaption>{label}</figcaption><ol>{data.map(d => <li key={d.date} title={`${d.date}: ${d.value}`} style={{ "--mizu-heat": Math.max(0, d.value) / max } as CSSProperties}><span className="mizu-sr-only">{d.date}: {d.value}</span></li>)}</ol><p className="mizu-field-hint">Each square is one day. Intensity follows the recorded value.</p></figure>;
}
