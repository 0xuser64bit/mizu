"use client";
import { useState, useId, useRef } from "react";
import type { Choice } from "../forms/Selection.tsx";
export function Combobox({ label, value, onValueChange, options, placeholder = "Choose an option", disabled = false, className = "" }: { label: string; value: string; onValueChange: (value: string) => void; options: readonly Choice[]; placeholder?: string; disabled?: boolean; className?: string }) {
 const id=useId(), input=useRef<HTMLInputElement>(null), [open,setOpen]=useState(false),[query,setQuery]=useState(""),[cursor,setCursor]=useState(0);
 const matches=options.filter(o=>!o.disabled && `${o.label} ${o.description??""}`.toLowerCase().includes(query.toLowerCase())), active=Math.min(cursor,Math.max(0,matches.length-1));
 const selected=options.find(o=>o.value===value);
 const choose=(v:string)=>{onValueChange(v);setOpen(false);setQuery("");input.current?.focus();};
 return <div className={`mizu-combobox ${className}`} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)) {setOpen(false);setQuery("");}}}><label className="mizu-field-label" htmlFor={id}>{label}</label><input ref={input} id={id} className="mizu-input" role="combobox" disabled={disabled} aria-expanded={open} aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={open && matches.length ? `${id}-option-${active}` : undefined} value={open ? query : selected?.label??""} placeholder={selected?.label??placeholder} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setCursor(0);setOpen(true);}} onKeyDown={e=>{
  if(e.key==="ArrowDown"||e.key==="ArrowUp") {e.preventDefault();setOpen(true);setCursor(matches.length ? (active+(e.key==="ArrowDown"?1:-1)+matches.length)%matches.length : 0);}
  if(e.key==="Enter" && open && matches[active]) {e.preventDefault();choose(matches[active]!.value);}
  if(e.key==="Escape" && open) {e.preventDefault();e.stopPropagation();setOpen(false);setQuery("");}
 }}/>{open && <div id={`${id}-list`} role="listbox" aria-label={`${label} options`} className="mizu-option-list">{matches.map((o,i)=><div role="option" id={`${id}-option-${i}`} key={o.value} aria-selected={i===active} onPointerMove={()=>setCursor(i)} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(o.value)}><strong>{o.label}</strong>{o.description&&<small>{o.description}</small>}</div>)}{!matches.length&&<p role="status">No matching options.</p>}</div>}</div>;
}
