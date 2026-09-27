"use client";
import { useRef, useId, type ReactNode } from "react";
export function SplitPane({ first, second, value, onValueChange, min = 15, max = 85, label = "Resize panels", className = "" }: { first: ReactNode; second: ReactNode; value: number; onValueChange: (value: number) => void; min?: number; max?: number; label?: string; className?: string }) {
 const ref=useRef<HTMLDivElement>(null), id=useId(), low=Math.max(0,Math.min(100,min)), high=Math.max(low,Math.min(100,max)), current=Math.max(low,Math.min(high,Number.isFinite(value) ? value : 50));
 const update=(v:number)=>onValueChange(Math.round(Math.max(low,Math.min(high,v))));
 return <div ref={ref} className={`mizu-split-pane ${className}`} style={{gridTemplateColumns:`minmax(0,${current}fr) 24px minmax(0,${100-current}fr)`}}><div id={`${id}-first`}>{first}</div><div role="separator" tabIndex={0} aria-label={label} aria-orientation="vertical" aria-valuemin={low} aria-valuemax={high} aria-valuenow={current} aria-controls={`${id}-first`} className="mizu-split-handle"
 onPointerDown={e=>{ if(e.button===0) { e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); } }} onPointerMove={e=>{ if(!e.currentTarget.hasPointerCapture(e.pointerId)) return; const r=ref.current!.getBoundingClientRect(); if(r.width) update((e.clientX-r.left)/r.width*100); }} onPointerUp={e=>{ if(e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
 onKeyDown={e=>{ const v=e.key==="Home" ? low : e.key==="End" ? high : e.key==="ArrowLeft" ? current-(e.shiftKey ? 10 : 1) : e.key==="ArrowRight" ? current+(e.shiftKey ? 10 : 1) : null; if(v!==null) { e.preventDefault(); update(v); } }}><span aria-hidden="true" /></div><div>{second}</div></div>;
}
