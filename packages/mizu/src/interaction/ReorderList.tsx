"use client";
import { Reorder,useDragControls,useReducedMotion } from "motion/react";
export type ReorderEntry={id:string;label:string;description?:string};
function Entry({item,index,total,move}:{item:ReorderEntry;index:number;total:number;move:(from:number,to:number)=>void}){
 const controls=useDragControls(),reduced=useReducedMotion();
 return <Reorder.Item value={item.id} dragListener={false} dragControls={controls} layout="position" transition={reduced?{duration:0}:undefined} className="mizu-reorder-entry"><button className="mizu-reorder-handle" type="button" aria-label={`Move ${item.label}`} onPointerDown={e=>controls.start(e)} onKeyDown={e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();move(index,index+(e.key==="ArrowUp"?-1:1));}}}><span aria-hidden="true">⠿</span></button><div><strong>{item.label}</strong>{item.description&&<small>{item.description}</small>}</div><div className="mizu-reorder-actions"><button type="button" disabled={index===0} aria-label={`Move ${item.label} up`} onClick={()=>move(index,index-1)}>↑</button><button type="button" disabled={index===total-1} aria-label={`Move ${item.label} down`} onClick={()=>move(index,index+1)}>↓</button></div></Reorder.Item>;
}
export function ReorderList<T extends ReorderEntry>({items,onReorder,label="Reorder items",className=""}:{items:readonly T[];onReorder:(items:T[])=>void;label?:string;className?:string}){
 const move=(from:number,to:number)=>{if(to<0||to>=items.length||from===to)return;const next=[...items];next.splice(to,0,next.splice(from,1)[0]!);onReorder(next);};
 return <div className={`mizu-reorder-list ${className}`}><p className="mizu-field-label">{label}</p><Reorder.Group axis="y" values={items.map(i=>i.id)} aria-label={label} onReorder={ids=>onReorder(ids.map(id=>items.find(i=>i.id===id)!))}>{items.map((item,index)=><Entry key={item.id} item={item} index={index} total={items.length} move={move}/>)}</Reorder.Group>{!items.length&&<p className="mizu-field-hint">No items to reorder.</p>}<p className="mizu-field-hint">Drag a handle, use its arrow keys, or use the move buttons.</p></div>;
}
