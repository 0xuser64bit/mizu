"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import { Combobox, MultiSelect, InlineEdit, RangeSelector, ReorderList, ImageCompare, HistoryControls, useHistory, Stack, ConfirmAction } from "@/mizu";

export function ComboboxDemo() {
  const [value,setValue]=useState("react");
  return <Combobox label="Framework" value={value} onValueChange={setValue} options={[{value:"react",label:"React",description:"Compose with components"},{value:"next",label:"Next.js",description:"React with server rendering"},{value:"vite",label:"Vite",description:"A quick client build"}]} />;
}

export function MultiSelectDemo() {
  const [value,setValue]=useState(["types"]);
  return <MultiSelect label="Release checks" value={value} onValueChange={setValue} max={3} options={[{value:"types",label:"Types"},{value:"lint",label:"Lint"},{value:"tests",label:"Tests"},{value:"browser",label:"Browser review"}]} />;
}

export function InlineEditDemo() {
  const [value,setValue]=useState("Untitled release");
  return <InlineEdit label="Release name" value={value} onValueChange={setValue} validate={v=>v.trim() ? undefined : "A release needs a name."} />;
}

export function RangeSelectorDemo() {
  const [value,setValue]=useState<[number,number]>([20,70]);
  return <RangeSelector label="Visible window" value={value} onValueChange={setValue} min={0} max={120} format={v=>`${v}s`} />;
}

export function ReorderListDemo() {
  const [items,setItems]=useState([{id:"a",label:"Verify types",description:"Catch incompatible props"},{id:"b",label:"Run checks",description:"Exercise behavior"},{id:"c",label:"Review the browser",description:"Confirm the real interaction"}]);
  return <ReorderList label="Release order" items={items} onReorder={setItems} />;
}

export function ImageCompareDemo() {
  const [value,setValue]=useState(50);
  return <ImageCompare label="Surface study" before={{src:"/images/field.svg",alt:"Ink surface with muted diamonds"}} after={{src:"/images/field-light.svg",alt:"Paper surface with warm diamonds"}} value={value} onValueChange={setValue} beforeLabel="Ink" afterLabel="Paper" />;
}

export function HistoryControlsDemo() {
  const history=useHistory("First draft");
  return <Stack gap={16}><InlineEdit label="Draft name" value={history.value} onValueChange={history.set} /><HistoryControls canUndo={history.canUndo} canRedo={history.canRedo} onUndo={history.undo} onRedo={history.redo} /></Stack>;
}

export function ConfirmActionDemo() {
  const [archived,setArchived]=useState(false);
  return archived ? <p role="status">Draft archived on this device.</p> : <ConfirmAction label="Archive draft" title="Archive this draft?" confirmLabel="Archive" action={async()=>{localStorage.setItem("mizu-demo-archived","true");}} onSuccess={()=>setArchived(true)}>The draft leaves your active list. This demonstration stores the result locally.</ConfirmAction>;
}
