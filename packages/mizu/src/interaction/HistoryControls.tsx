"use client";
import { useState,useCallback } from "react";
export function useHistory<T>(initial:T,limit=50){
 const [state,setState]=useState<{past:T[];present:T;future:T[]}>({past:[],present:initial,future:[]});
 const capacity=Math.max(1,Number.isFinite(limit)?Math.floor(limit):50);
 const set=useCallback((value:T)=>setState(s=>Object.is(s.present,value)?s:{past:[...s.past,s.present].slice(-capacity),present:value,future:[]}),[capacity]);
 const undo=useCallback(()=>setState(s=>!s.past.length?s:{past:s.past.slice(0,-1),present:s.past[s.past.length-1]!,future:[s.present,...s.future]}),[]);
 const redo=useCallback(()=>setState(s=>!s.future.length?s:{past:[...s.past,s.present].slice(-capacity),present:s.future[0]!,future:s.future.slice(1)}),[capacity]);
 const reset=useCallback((value:T)=>setState({past:[],present:value,future:[]}),[]);
 return {value:state.present,set,undo,redo,reset,canUndo:!!state.past.length,canRedo:!!state.future.length};
}
export function HistoryControls({onUndo,onRedo,canUndo,canRedo,className=""}:{onUndo:()=>void;onRedo:()=>void;canUndo:boolean;canRedo:boolean;className?:string}){
 return <div className={`mizu-history-controls ${className}`} role="group" aria-label="Edit history"><button type="button" disabled={!canUndo} onClick={onUndo}>← Undo</button><button type="button" disabled={!canRedo} onClick={onRedo}>Redo →</button></div>;
}
